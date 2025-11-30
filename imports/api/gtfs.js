import { Mongo } from 'meteor/mongo';

// GTFS Collections - use standard Meteor collections
// Connect to external MongoDB by setting MONGO_URL environment variable
export const Shapes = new Mongo.Collection('shapes');
export const Stops = new Mongo.Collection('stops');
export const Routes = new Mongo.Collection('routes');
