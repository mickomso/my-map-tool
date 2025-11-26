import { Meteor } from 'meteor/meteor';
import { log } from '../utils/logger';
import { AppLogs } from '../imports/api/logs';
import './methods';

// Publish logs to clients (last 10 minutes only, GTFS logs only)
Meteor.publish('app.logs', function () {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return AppLogs.find(
    { 
      createdAt: { $gte: tenMinutesAgo },
      gtfs: true 
    },
    { sort: { createdAt: -1 }, limit: 100 }
  );
});

Meteor.startup(async () => {
  try {
    const version = await Meteor.call('version.get');
    log.info(`Server starting with version ${version}`);
  } catch (error) {
    log.error(`Error getting version: ${error.message}`);
  }
});
