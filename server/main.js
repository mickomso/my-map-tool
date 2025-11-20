import { Meteor } from 'meteor/meteor';
import { log } from '../utils/logger';
import './methods';

Meteor.startup(async () => {
  try {
    const version = await Meteor.call('version.get');
    log.info(`Server starting with version ${version}`);
  } catch (error) {
    log.error(`Error getting version: ${error.message}`);
  }
});
