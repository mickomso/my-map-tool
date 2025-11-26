import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

let gtfsDriver = null;

// Only create the remote driver on the server
if (Meteor.isServer) {
  const { MongoInternals } = require('meteor/mongo');

  // Connect to the GTFS database with connection pool settings
  const GTFS_MONGO_URL = 'mongodb://localhost:27017/gtfs';
  gtfsDriver = new MongoInternals.RemoteCollectionDriver(GTFS_MONGO_URL, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

export { gtfsDriver };

// Define collections using the remote driver on server, null on client
export const Shapes = new Mongo.Collection(
  'shapes',
  Meteor.isServer ? { _driver: gtfsDriver } : {}
);
export const Stops = new Mongo.Collection('stops', Meteor.isServer ? { _driver: gtfsDriver } : {});
