import { Meteor } from 'meteor/meteor';
import { log } from '../utils/logger';
import { AppLogs } from '../imports/api/logs';
import { Stops, Routes, Shapes } from '../imports/api/gtfs';
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

// Publish GTFS stops
Meteor.publish('gtfs.stops', function () {
  return Stops.find({});
});

// Publish GTFS routes
Meteor.publish('gtfs.routes', function () {
  return Routes.find({});
});

// Publish GTFS shapes
Meteor.publish('gtfs.shapes', function () {
  return Shapes.find({});
});

Meteor.startup(async () => {
  try {
    const version = await Meteor.call('version.get');
    log.info(`Server starting with version ${version}`);
  } catch (error) {
    log.error(`Error getting version: ${error.message}`);
  }
});
