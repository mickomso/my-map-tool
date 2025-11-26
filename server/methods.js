import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { MongoInternals } from 'meteor/mongo';
import { importGtfsFromUrl, setImportAborted } from './gtfs-import';
import { log } from '../utils/logger';

// Connect to the GTFS database
const GTFS_MONGO_URL = 'mongodb://localhost:27017/gtfs';
const remoteDriver = new MongoInternals.RemoteCollectionDriver(GTFS_MONGO_URL);

// Define collections using the remote driver
const Shapes = new Mongo.Collection('shapes', { _driver: remoteDriver });
const Stops = new Mongo.Collection('stops', { _driver: remoteDriver });

Meteor.methods({
  async 'app.clearLogs'() {
    const { AppLogs } = await import('../imports/api/logs');
    try {
      await AppLogs.removeAsync({ gtfs: true });
    } catch (error) {
      log.error(`Failed to clear logs: ${error}`);
      throw new Meteor.Error('clear-logs-failed', error.message);
    }
  },

  'gtfs.cancelImport'() {
    // Set abort flag for this user
    setImportAborted(this.userId || 'anonymous');
    log.info(`GTFS import cancellation requested by user ${this.userId || 'anonymous'}`);
  },

  async 'gtfs.importFromUrl'(url) {
    const agencyKey = 'imported_agency';

    try {
      // Use our custom import implementation that uses Meteor's driver
      const usedAgencyKey = await importGtfsFromUrl({
        url,
        agencyKey,
        driver: remoteDriver,
        userId: this.userId || 'anonymous',
      });

      // Query Shapes
      const rawShapes = await Shapes.find(
        { agency_key: usedAgencyKey },
        { sort: { shape_id: 1, shape_pt_sequence: 1 } }
      ).fetchAsync();

      // Group shapes by shape_id and convert to GeoJSON
      const shapesMap = rawShapes.reduce((acc, curr) => {
        if (!acc[curr.shape_id]) {
          acc[curr.shape_id] = [];
        }
        acc[curr.shape_id].push([curr.shape_pt_lon, curr.shape_pt_lat]);
        return acc;
      }, {});

      const shapesGeoJSON = {
        type: 'FeatureCollection',
        features: Object.keys(shapesMap).map((shapeId) => ({
          type: 'Feature',
          properties: {
            shape_id: shapeId,
            agency_key: usedAgencyKey,
          },
          geometry: {
            type: 'LineString',
            coordinates: shapesMap[shapeId],
          },
        })),
      };

      // Query Stops
      const rawStops = await Stops.find({ agency_key: usedAgencyKey }).fetchAsync();

      const stopsGeoJSON = {
        type: 'FeatureCollection',
        features: rawStops.map((stop) => ({
          type: 'Feature',
          properties: {
            stop_id: stop.stop_id,
            stop_name: stop.stop_name,
            stop_code: stop.stop_code,
            agency_key: usedAgencyKey,
          },
          geometry: {
            type: 'Point',
            coordinates: [stop.stop_lon, stop.stop_lat],
          },
        })),
      };

      return {
        shapes: shapesGeoJSON,
        stops: stopsGeoJSON,
      };
    } catch (error) {
      log.error(`GTFS Import Error: ${error}`);
      throw new Meteor.Error('gtfs-import-failed', error.message);
    }
  },

  async 'version.get'() {
    try {
      const { default: packageJson } = await import('../package.json', {
        assert: { type: 'json' },
      });
      return packageJson.version;
    } catch (error) {
      log.error(`Error reading package.json: ${error}`);
      return '0.0.0';
    }
  },
});
