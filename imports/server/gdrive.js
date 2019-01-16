import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Ansible from '../ansible';
import Flags from '../flags';
import Locks from './models/lock';
import DriveClient from './gdrive-client-refresher';
import Documents from '../lib/models/documents';
import Settings from '../lib/models/settings';

const MimeTypes = {
  spreadsheet: 'application/vnd.google-apps.spreadsheet',
  document: 'application/vnd.google-apps.document',
};

function checkClientOk() {
  if (!DriveClient.ready()) {
    throw new Meteor.Error(500, 'Google OAuth is not configured.');
  }

  if (Flags.active('disable.google')) {
    throw new Meteor.Error(500, 'Google integration is disabled.');
  }
}

function createDocument(name, type) {
  if (!_.has(MimeTypes, type)) {
    throw new Meteor.Error(400, `Invalid document type ${type}`);
  }
  checkClientOk();

  const template = Settings.findOne({ name: `gdrive.template.${type}` });
  const mimeType = MimeTypes[type];

  let file;
  if (template) {
    file = Meteor.wrapAsync(DriveClient.gdrive.files.copy, DriveClient.gdrive)({
      fileId: template.value.id,
      resource: { name, mimeType },
    });
  } else {
    file = Meteor.wrapAsync(DriveClient.gdrive.files.create, DriveClient.gdrive)({
      resource: { name, mimeType },
    });
  }

  const fileId = file.data.id;

  Meteor.wrapAsync(DriveClient.gdrive.permissions.create, DriveClient.gdrive.permissions)({
    fileId,
    resource: { role: 'writer', type: 'anyone' },
  });
  return fileId;
}

function renameDocument(id, name) {
  checkClientOk();
  // It's unclear if this can ever return an error
  Meteor.wrapAsync(DriveClient.gdrive.files.update, DriveClient.gdrive)({
    fileId: id,
    resource: { name },
  });
}

function grantPermission(id, email, permission) {
  checkClientOk();
  Meteor.wrapAsync(DriveClient.gdrive.permissions.create, DriveClient.gdrive.permissions)({
    fileId: id,
    sendNotificationEmail: false,
    resource: {
      type: 'user',
      emailAddress: email,
      role: permission,
    },
  });
}

function ensureDocument(puzzle, type = 'spreadsheet') {
  let doc = Documents.findOne({ puzzle: puzzle._id });
  if (!doc) {
    checkClientOk();

    Locks.withLock(`puzzle:${puzzle._id}:documents`, () => {
      doc = Documents.findOne({ puzzle: puzzle._id });
      if (!doc) {
        Ansible.log('Creating missing document for puzzle', {
          puzzle: puzzle._id,
        });

        const docId = createDocument(`${puzzle.title}: Death and Mayhem`, type);
        doc = {
          hunt: puzzle.hunt,
          puzzle: puzzle._id,
          provider: 'google',
          value: { type, id: docId },
        };
        doc._id = Documents.insert(doc);
      }
    });
  }

  return doc;
}

export {
  renameDocument,
  grantPermission,
  ensureDocument,
};
