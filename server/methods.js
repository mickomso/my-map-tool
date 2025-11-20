import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async 'version.get'() {
    try {
      const { default: packageJson } = await import('../package.json', {
        assert: { type: 'json' },
      });
      return packageJson.version;
    } catch (error) {
      console.error('Error reading package.json:', error);
      return '0.0.0';
    }
  },
});
