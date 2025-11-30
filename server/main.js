import { Meteor } from 'meteor/meteor';
import { log } from '../utils/logger';
import { AppLogs } from '../imports/api/logs';
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

Meteor.startup(async () => {
  try {
    const version = await Meteor.call('version.get');
    log.info(`Server starting with version ${version}`);

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
