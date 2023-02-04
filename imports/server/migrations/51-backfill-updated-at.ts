import type { z } from 'zod';
import Announcements from '../../lib/models/Announcements';
import ChatMessages from '../../lib/models/ChatMessages';
import ChatNotifications from '../../lib/models/ChatNotifications';
import DiscordCache from '../../lib/models/DiscordCache';
import DiscordRoleGrants from '../../lib/models/DiscordRoleGrants';
import Documents from '../../lib/models/Documents';
import FeatureFlags from '../../lib/models/FeatureFlags';
import FolderPermissions from '../../lib/models/FolderPermissions';
import Guesses from '../../lib/models/Guesses';
import Hunts from '../../lib/models/Hunts';
import type Model from '../../lib/models/Model';
import PendingAnnouncements from '../../lib/models/PendingAnnouncements';
import Puzzles from '../../lib/models/Puzzles';
import Settings from '../../lib/models/Settings';
import Tags from '../../lib/models/Tags';
import type { createdTimestamp, updatedTimestamp } from '../../lib/models/customTypes';
import ConnectAcks from '../../lib/models/mediasoup/ConnectAcks';
import ConnectRequests from '../../lib/models/mediasoup/ConnectRequests';
import ConsumerAcks from '../../lib/models/mediasoup/ConsumerAcks';
import Consumers from '../../lib/models/mediasoup/Consumers';
import PeerRemoteMutes from '../../lib/models/mediasoup/PeerRemoteMutes';
import Peers from '../../lib/models/mediasoup/Peers';
import ProducerClients from '../../lib/models/mediasoup/ProducerClients';
import ProducerServers from '../../lib/models/mediasoup/ProducerServers';
import Rooms from '../../lib/models/mediasoup/Rooms';
import Routers from '../../lib/models/mediasoup/Routers';
import TransportRequests from '../../lib/models/mediasoup/TransportRequests';
import TransportStates from '../../lib/models/mediasoup/TransportStates';
import Transports from '../../lib/models/mediasoup/Transports';
import APIKeys from '../models/APIKeys';
import LatestDeploymentTimestamps from '../models/LatestDeploymentTimestamps';
import Subscribers from '../models/Subscribers';
import UploadTokens from '../models/UploadTokens';
import Migrations from './Migrations';

type ModelWithTimestamps = Model<
  z.ZodObject<{
    createdAt: typeof createdTimestamp,
    updatedAt: typeof updatedTimestamp,
  }>,
  any
>;

Migrations.add({
  version: 51,
  name: 'Backfill updatedAt property for existing records',
  async up() {
    // This list of models was generated by grepping for `with(Timestamps|Common)\(`
    const models = [
      Announcements,
      ChatMessages,
      ChatNotifications,
      DiscordCache,
      DiscordRoleGrants,
      Documents,
      FeatureFlags,
      FolderPermissions,
      Guesses,
      Hunts,
      PendingAnnouncements,
      Puzzles,
      Settings,
      Tags,
      ConnectAcks,
      ConnectRequests,
      ConsumerAcks,
      Consumers,
      PeerRemoteMutes,
      Peers,
      ProducerClients,
      ProducerServers,
      Rooms,
      Routers,
      TransportRequests,
      Transports,
      TransportStates,
      APIKeys,
      LatestDeploymentTimestamps,
      Subscribers,
      UploadTokens,
    ];

    for (const model of models) {
      for (const record of (model as ModelWithTimestamps).find({ updatedAt: null } as any)) {
        await (model as ModelWithTimestamps).updateAsync(record._id, {
          $set: {
            updatedAt: record.createdAt,
          },
        });
      }
    }
  },
});
