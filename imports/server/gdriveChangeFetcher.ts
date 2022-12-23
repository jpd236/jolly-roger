/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import type { drive_v3 } from '@googleapis/drive';
import Flags from '../Flags';
import DocumentActivities from '../lib/models/DocumentActivities';
import Documents from '../lib/models/Documents';
import DriveClient from './gdriveClientRefresher';
import ignoringDuplicateKeyErrors from './ignoringDuplicateKeyErrors';
import DriveChangesPageTokens from './models/DriveChangesPageTokens';
import Locks, { PREEMPT_TIMEOUT } from './models/Locks';

const ACTIVITY_GRANULARITY = 5 * 60 * 1000; // milliseconds

async function recordDriveChange(file: Pick<drive_v3.Schema$File, 'id' | 'modifiedTime'>) {
  if (!file.id || !file.modifiedTime) {
    return;
  }

  const document = Documents.findOne({ 'value.id': file.id });
  if (!document) {
    return;
  }

  // Round the mod time to the nearest 5 seconds
  const roundedTime = new Date(
    Math.round(new Date(file.modifiedTime).getTime() / ACTIVITY_GRANULARITY) * ACTIVITY_GRANULARITY
  );
  await ignoringDuplicateKeyErrors(async () => {
    await DocumentActivities.insertAsync({
      document: document._id,
      ts: roundedTime,
      hunt: document.hunt,
      puzzle: document.puzzle,
    });
  });
}

async function fetchDriveChangesIteration(gdrive: drive_v3.Drive, lock: string): Promise<boolean> {
  await Locks.renew(lock);

  let pageToken = DriveChangesPageTokens.findOne({ _id: 'default' })?.token;

  if (!pageToken) {
    const resp = await gdrive.changes.getStartPageToken();
    pageToken = resp.data.startPageToken ?? undefined;
  }

  let resp;
  try {
    resp = await gdrive.changes.list({
      pageToken,
      fields: 'nextPageToken, newStartPageToken, changes(file(id, modifiedTime))',
    });
  } catch (e) {
    // Assume that page token is no longer valid
    DriveChangesPageTokens.update({ _id: 'default', token: pageToken }, {
      $unset: {
        token: 1,
      },
    });
    return true; /* continue loop */
  }

  await resp.data.changes?.reduce(async (p, change) => {
    await p;
    if (!change.file) {
      return;
    }

    await recordDriveChange(change.file);
  }, Promise.resolve());

  DriveChangesPageTokens.upsert({ _id: 'default', token: pageToken }, {
    $set: {
      token: resp.data.nextPageToken ?? resp.data.newStartPageToken ?? undefined,
    },
  });

  // nextPageToken means that we're at the end of the change list, and we
  // should expect to see a newStartPageToken
  return !!resp.data.nextPageToken;
}

async function fetchDriveChanges(lock: string) {
  const gdrive = DriveClient.gdrive;
  if (!gdrive) {
    return;
  }

  // eslint-disable-next-line no-await-in-loop
  while (await fetchDriveChangesIteration(gdrive, lock));
}

const FEATURE_FLAG_NAME = 'disable.gdrive_document_activity';

async function featureFlagChanged() {
  return new Promise<void>((r) => {
    let handle: Meteor.LiveQueryHandle | undefined;
    const cleanup = () => {
      handle?.stop();
      r();
    };
    handle = Flags.observeChanges(FEATURE_FLAG_NAME, cleanup);
  });
}

async function fetchDriveLoop() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    /* eslint-disable no-await-in-loop */
    // Only try to grab the lock if feature flags would allow it
    if (!Flags.active(FEATURE_FLAG_NAME)) {
      await featureFlagChanged();
    }

    await Locks.withLock('drive-changes', async (lock) => {
      if (Flags.active(FEATURE_FLAG_NAME)) {
        return;
      }

      await fetchDriveChanges(lock);

      // Ensure that we continue to hold the lock while we wait. We'll wake up
      // every 15 seconds (+/- 5 seconds of jitter)
      let renew;
      try {
        renew = Meteor.setInterval(async () => {
          await Locks.renew(lock);
        }, PREEMPT_TIMEOUT / 2);

        await new Promise<void>((r) => {
          Meteor.setTimeout(r, 10 * 1000 + Math.random() * 10 * 1000);
        });
      } finally {
        if (renew) {
          Meteor.clearInterval(renew);
        }
      }
    });
    /* eslint-enable no-await-in-loop */
  }
}

Meteor.startup(() => {
  void fetchDriveLoop();
});