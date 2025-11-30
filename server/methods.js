import { Meteor } from 'meteor/meteor';
import crypto from 'crypto';
import { importGtfsFromUrl, setImportAborted } from './gtfs-import';
import { log } from '../utils/logger';
import { gtfsDriver, Shapes, Stops } from '../imports/api/gtfs';

// Helper to generate checksum from data
function generateChecksum(data) {
  const hash = crypto.createHash('md5');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

// Cache for checksums (regenerated on import)
const checksumCache = {
  stops: null,
  shapes: null,
};

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

  async 'gtfs.getStopsChecksum'() {
    if (!checksumCache.stops) {
      const count = await Stops.find({}).countAsync();
      const sample = await Stops.findOneAsync({}, { sort: { _id: -1 } });
      checksumCache.stops = generateChecksum({ count, lastId: sample?._id });
    }
    return checksumCache.stops;
  },

  async 'gtfs.getShapesChecksum'() {
    if (!checksumCache.shapes) {
      const count = await Shapes.find({}).countAsync();
      const sample = await Shapes.findOneAsync({}, { sort: { _id: -1 } });
      checksumCache.shapes = generateChecksum({ count, lastId: sample?._id });
    }
    return checksumCache.shapes;
  },

  async 'gtfs.getStops'() {
    return await Stops.find({}).fetchAsync();
  },

  async 'gtfs.getProcessedShapes'() {
    const rawShapes = await Shapes.find({}).fetchAsync();

    // Group shapes by shape_id
    const shapesMap = rawShapes.reduce((acc, shape) => {
      if (!acc[shape.shape_id]) {
        acc[shape.shape_id] = [];
      }
      acc[shape.shape_id].push(shape);
      return acc;
    }, {});

    // Sort by sequence and create path data
    return Object.keys(shapesMap).map((shapeId) => {
      const shapePoints = shapesMap[shapeId].sort(
        (a, b) => a.shape_pt_sequence - b.shape_pt_sequence
      );
      return {
        shape_id: shapeId,
        path: shapePoints.map((s) => [s.shape_pt_lon, s.shape_pt_lat]),
      };
    });
  },

  'gtfs.cancelImport'() {
    // Set abort flag for this user
    setImportAborted(this.userId || 'anonymous');
    log.info(`GTFS import cancellation requested by user ${this.userId || 'anonymous'}`);
  },

  async 'gtfs.importFromUrl'(url) {
    const agencyKey = 'imported_agency';

    try {
      // Verify connection before import
      try {
        await gtfsDriver.mongo.db.admin().ping();
      } catch (pingError) {
        log.warn(`MongoDB connection issue, will retry: ${pingError.message}`);
        // Connection might recover during import
      }

      // Use our custom import implementation that uses Meteor's driver
      const usedAgencyKey = await importGtfsFromUrl({
        url,
        agencyKey,
        driver: gtfsDriver,
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
    } finally {
      // Invalidate checksum cache after import
      checksumCache.stops = null;
      checksumCache.shapes = null;
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
