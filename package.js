// jshint ignore: start
Package.describe({
  name: 'aumel:security-authorization',
  version: '2.0.1',
  // Brief, one-line summary of the package.
  summary: 'An authorization security system with voters.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/aumel/meteor-security-authorization',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');

  api.export('AbstractVoter');
  api.export('RoleVoter');
  api.export('SecurityAuthorization');

  api.addFiles('src/access-decision-manager.js');
  api.addFiles('src/authorization-checker.js');
  api.addFiles('src/voter/voter.js');
  api.addFiles('src/voter/role-voter.js');
  api.addFiles('src/security-authorization-common.js');
  api.addFiles('src/security-authorization-server.js', 'server');
  api.addFiles('src/security-authorization-client.js', 'client');

  // These files instantiate the default SecurityAuthorization instance
  // on the server and the client, so they must be evaluated last
  // (before the helpers) to ensure
  // that the prototypes have been fully populated.
  api.addFiles('src/globals-server.js', 'server');
  api.addFiles('src/globals-client.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('accounts-password');
  api.use('aumel:security-authorization');

  api.addFiles('tests/voter-tests.js', 'server');
  api.addFiles('tests/role-voter-tests.js', 'server');
  api.addFiles('tests/access-decision-manager-tests.js', 'server');
  api.addFiles('tests/authorization-checker-tests.js', 'server');
  api.addFiles('tests/security-authorization-tests.js', 'server');
  api.addFiles(
    'tests/security-authorization-meteor-user-tests.js',
    ['server', 'client']);
});
