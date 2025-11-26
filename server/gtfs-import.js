import { MongoInternals } from 'meteor/mongo';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fetch } from 'meteor/fetch';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse';
import { gtfsLog } from '../utils/logger';

// Standard GTFS Filenames and their collection names
// Based on gtfs@0.8.2 definitions
const filenames = [
  { fileNameBase: 'agency', collection: 'agencies' },
  { fileNameBase: 'calendar_dates', collection: 'calendardates' },
  { fileNameBase: 'calendar', collection: 'calendars' },
  { fileNameBase: 'fare_attributes', collection: 'fareattributes' },
  { fileNameBase: 'fare_rules', collection: 'farerules' },
  { fileNameBase: 'feed_info', collection: 'feedinfos' },
  { fileNameBase: 'frequencies', collection: 'frequencies' },
  { fileNameBase: 'routes', collection: 'routes' },
  { fileNameBase: 'shapes', collection: 'shapes' },
  { fileNameBase: 'stops', collection: 'stops' },
  { fileNameBase: 'transfers', collection: 'transfers' },
  { fileNameBase: 'trips', collection: 'trips' },
];

const integerFields = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'start_date', 'end_date', 'date', 'exception_type', 'shape_pt_sequence',
  'payment_method', 'transfers', 'transfer_duration', 'feed_start_date',
  'feed_end_date', 'headway_secs', 'exact_times', 'route_type', 'direction_id',
  'location_type', 'wheelchair_boarding', 'stop_sequence', 'pickup_type',
  'drop_off_type', 'use_stop_sequence', 'transfer_type', 'min_transfer_time',
  'wheelchair_accessible', 'bikes_allowed', 'timepoint', 'timetable_sequence'
];

const floatFields = [
  'price', 'shape_dist_traveled', 'shape_pt_lat', 'shape_pt_lon', 'stop_lat', 'stop_lon'
];

export const importGtfsFromUrl = async ({ url, agencyKey, driver }) => {
  const tmpDir = path.join(os.tmpdir(), `gtfs-${Date.now()}`);
  const zipPath = path.join(tmpDir, 'latest.zip');

  try {
    // 1. Create temp directory
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // 2. Download file
    gtfsLog.info(`Downloading GTFS from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download GTFS: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(zipPath, Buffer.from(buffer));

    // 3. Unzip
    gtfsLog.info('Unzipping...');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tmpDir, true);

    // 3.5 Determine Agency Key from agency.txt
    let finalAgencyKey = agencyKey;
    const agencyFilePath = path.join(tmpDir, 'agency.txt');
    
    if (fs.existsSync(agencyFilePath)) {
      try {
        const parser = fs.createReadStream(agencyFilePath).pipe(parse({
          columns: true,
          relax_quotes: true,
          trim: true,
          skip_empty_lines: true,
          to: 1
        }));

        for await (const record of parser) {
          if (record.agency_id) {
            finalAgencyKey = record.agency_id;
            gtfsLog.info(`Using agency_key from agency.txt: ${finalAgencyKey}`);
          }
          break;
        }
      } catch (e) {
        gtfsLog.warn(`Failed to read agency_id from agency.txt, using default key: ${e}`);
      }
    }

    // 4. Import files
    // Use the provided driver, or fallback to default if not provided (though we expect it)
    const mongoConnection = driver ? driver.mongo : MongoInternals.defaultRemoteCollectionDriver().mongo;
    const db = mongoConnection.db;

    for (const fileInfo of filenames) {
      const filePath = path.join(tmpDir, `${fileInfo.fileNameBase}.txt`);
      if (!fs.existsSync(filePath)) {
        gtfsLog.info(`Skipping ${fileInfo.fileNameBase}.txt (not found)`);
        continue;
      }

      gtfsLog.info(`Importing ${fileInfo.fileNameBase}.txt...`);
      const collection = db.collection(fileInfo.collection);

      // Remove existing data for this agency
      // Using deleteMany instead of remove (which was causing OP_QUERY error)
      await collection.deleteMany({ agency_key: finalAgencyKey });

      const records = [];
      const parser = fs.createReadStream(filePath).pipe(parse({
        columns: true,
        relax_quotes: true,
        trim: true,
        skip_empty_lines: true
      }));

      for await (const record of parser) {
        // Clean nulls
        Object.keys(record).forEach(key => {
          if (record[key] === null || record[key] === '') {
            delete record[key];
          }
        });

        // Add agency key
        record.agency_key = finalAgencyKey;

        // Convert types
        integerFields.forEach(field => {
          if (record[field]) record[field] = parseInt(record[field], 10);
        });

        floatFields.forEach(field => {
          if (record[field]) record[field] = parseFloat(record[field]);
        });

        // Create loc array for stops and shapes
        if (record.stop_lat && record.stop_lon) {
          record.loc = [record.stop_lon, record.stop_lat];
        }
        if (record.shape_pt_lat && record.shape_pt_lon) {
          record.loc = [record.shape_pt_lon, record.shape_pt_lat];
        }

        records.push(record);

        // Batch insert
        if (records.length >= 1000) {
          await collection.insertMany(records);
          records.length = 0;
        }
      }

      // Insert remaining
      if (records.length > 0) {
        await collection.insertMany(records);
      }
    }

    gtfsLog.info('GTFS Import completed successfully.');
    return finalAgencyKey;

  } catch (error) {
    gtfsLog.error(`GTFS Import failed: ${error}`);
    throw error;
  } finally {
    // Cleanup
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      gtfsLog.error(`Error cleaning up temp files: ${e}`);
    }
  }
};
