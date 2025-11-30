import { Meteor } from 'meteor/meteor';
import { log } from '../utils/logger';
import { AppLogs } from '../imports/api/logs';
import { Metadata } from '../imports/api/metadata';
import { Stops, Shapes } from '../imports/api/gtfs';
import './methods';

// Publish logs to clients (last 10 minutes only, GTFS logs only)
Meteor.publish('app.logs', function () {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return AppLogs.find(
    {
      createdAt: { $gte: tenMinutesAgo },
      gtfs: true,
    },
    { sort: { createdAt: -1 }, limit: 100 }
  );
});

// Check if version changed and clear logs if so
async function checkVersionAndClearLogs(currentVersion) {
  const storedMeta = await Metadata.findOneAsync({ key: 'appVersion' });
  const storedVersion = storedMeta?.value;

  if (storedVersion && storedVersion !== currentVersion) {
    log.info(`Version changed from ${storedVersion} to ${currentVersion}. Clearing app_logs...`);
    const removed = await AppLogs.removeAsync({});
    log.info(`Removed ${removed} log entries`);
  }

  // Update stored version
  await Metadata.upsertAsync({ key: 'appVersion' }, { $set: { key: 'appVersion', value: currentVersion } });
}

Meteor.startup(async () => {
  try {
    const version = await Meteor.call('version.get');
    log.info(`Server starting with version ${version}`);

    // Clear logs if version changed
    await checkVersionAndClearLogs(version);

    // Create MongoDB indexes for faster queries
    const shapesCollection = Shapes.rawCollection();
    const stopsCollection = Stops.rawCollection();

    await shapesCollection.createIndex({ shape_id: 1, shape_pt_sequence: 1 });
    await stopsCollection.createIndex({ stop_id: 1 });
    await stopsCollection.createIndex({ agency_key: 1 });

    log.info('MongoDB indexes created for GTFS collections');
  } catch (error) {
    log.error(`Error during startup: ${error.message}`);
  }
});
