import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';

// Obtención de la versión actual
export const getCurrentVersion = () => {
  if (Meteor.isClient) {
    return Session.get('appVersion') || '0.0.0';
  }
  return '0.0.0';
};

// Hook reactivo para la versión
export function useVersion() {
  return useTracker(() => {
    if (Meteor.isClient) {
      if (!Session.get('appVersion')) {
        Meteor.call('version.get', (error, version) => {
          if (!error) {
            Session.set('appVersion', version);
          }
        });
      }
      return {
        version: Session.get('appVersion') || '0.0.0',
        ready: !!Session.get('appVersion'),
      };
    }
    return {
      version: getCurrentVersion(),
      ready: true,
    };
  });
}
