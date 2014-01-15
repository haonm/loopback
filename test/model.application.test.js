var loopback = require(('../'));
var assert = require('assert');
var Application = loopback.Application;

describe('Application', function () {
  var registeredApp = null;

  it('Create a new application', function (done) {
    Application.create({owner: 'rfeng',
      name: 'MyApp1',
      description: 'My first mobile application'}, function (err, result) {
      var app = result;
      assert.equal(app.owner, 'rfeng');
      assert.equal(app.name, 'MyApp1');
      assert.equal(app.description, 'My first mobile application');
      assert(app.clientKey);
      assert(app.javaScriptKey);
      assert(app.restApiKey);
      assert(app.windowsKey);
      assert(app.masterKey);
      assert(app.created);
      assert(app.modified);
      done(err, result);
    });
  });

  it('Create a new application with push settings', function (done) {
    Application.create({owner: 'rfeng',
        name: 'MyAppWithPush',
        description: 'My push mobile application',
        pushSettings: {
          apns: {
            production: false,
            certData: 'cert',
            keyData: 'key',
            pushOptions: {
              gateway: 'gateway.sandbox.push.apple.com',
              port: 2195
            },
            feedbackOptions: {
              gateway: 'feedback.sandbox.push.apple.com',
              port: 2196,
              interval: 300,
              batchFeedback: true
            }
          },
          gcm: {
            serverApiKey: 'serverKey'
          }
        }},
      function (err, result) {
        var app = result;
        assert.deepEqual(app.pushSettings.toObject(), {
          apns: {
            production: false,
            certData: 'cert',
            keyData: 'key',
            pushOptions: {
              gateway: 'gateway.sandbox.push.apple.com',
              port: 2195
            },
            feedbackOptions: {
              gateway: 'feedback.sandbox.push.apple.com',
              port: 2196,
              interval: 300,
              batchFeedback: true
            }
          },
          gcm: {
            serverApiKey: 'serverKey'
          }
        });
        done(err, result);
      });
  });

  beforeEach(function (done) {
    Application.register('rfeng', 'MyApp2',
      {description: 'My second mobile application'}, function (err, result) {
        var app = result;
        assert.equal(app.owner, 'rfeng');
        assert.equal(app.name, 'MyApp2');
        assert.equal(app.description, 'My second mobile application');
        assert(app.clientKey);
        assert(app.javaScriptKey);
        assert(app.restApiKey);
        assert(app.windowsKey);
        assert(app.masterKey);
        assert(app.created);
        assert(app.modified);
        registeredApp = app;
        done(err, result);
      });
  });

  it('Reset keys', function (done) {
    Application.resetKeys(registeredApp.id, function (err, result) {
      var app = result;
      assert.equal(app.owner, 'rfeng');
      assert.equal(app.name, 'MyApp2');
      assert.equal(app.description, 'My second mobile application');
      assert(app.clientKey);
      assert(app.javaScriptKey);
      assert(app.restApiKey);
      assert(app.windowsKey);
      assert(app.masterKey);

      assert(app.clientKey !== registeredApp.clientKey);
      assert(app.javaScriptKey !== registeredApp.javaScriptKey);
      assert(app.restApiKey !== registeredApp.restApiKey);
      assert(app.windowsKey !== registeredApp.windowsKey);
      assert(app.masterKey !== registeredApp.masterKey);

      assert(app.created);
      assert(app.modified);
      registeredApp = app;
      done(err, result);
    });
  });

  it('Authenticate with application id & clientKey', function (done) {
    Application.authenticate(registeredApp.id, registeredApp.clientKey,
      function (err, result) {
        assert.equal(result, 'clientKey');
        done(err, result);
      });
  });

  it('Authenticate with application id & javaScriptKey', function (done) {
    Application.authenticate(registeredApp.id, registeredApp.javaScriptKey,
      function (err, result) {
        assert.equal(result, 'javaScriptKey');
        done(err, result);
      });
  });

  it('Authenticate with application id & restApiKey', function (done) {
    Application.authenticate(registeredApp.id, registeredApp.restApiKey,
      function (err, result) {
        assert.equal(result, 'restApiKey');
        done(err, result);
      });
  });

  it('Authenticate with application id & masterKey', function (done) {
    Application.authenticate(registeredApp.id, registeredApp.masterKey,
      function (err, result) {
        assert.equal(result, 'masterKey');
        done(err, result);
      });
  });

  it('Authenticate with application id & windowsKey', function (done) {
    Application.authenticate(registeredApp.id, registeredApp.windowsKey,
      function (err, result) {
        assert.equal(result, 'windowsKey');
        done(err, result);
      });
  });

  it('Fail to authenticate with application id & invalid key', function (done) {
    Application.authenticate(registeredApp.id, 'invalid-key',
      function (err, result) {
        assert(!result);
        done(err, result);
      });
  });
});

describe('Application subclass', function () {
  it('should use subclass model name', function (done) {
    var MyApp = Application.extend('MyApp');
    MyApp.attachTo(loopback.createDataSource({connector: loopback.Memory}));
    MyApp.register('rfeng', 'MyApp2',
      {description: 'My second mobile application'}, function (err, result) {
        var app = result;
        assert.equal(app.owner, 'rfeng');
        assert.equal(app.name, 'MyApp2');
        assert.equal(app.description, 'My second mobile application');
        assert(app.clientKey);
        assert(app.javaScriptKey);
        assert(app.restApiKey);
        assert(app.windowsKey);
        assert(app.masterKey);
        assert(app.created);
        assert(app.modified);
        MyApp.findById(app.id, function (err, myApp) {
          assert(!err);
          assert(myApp);

          Application.findById(app.id, function (err, myApp) {
            assert(!err);
            assert(myApp === null);
            done(err, myApp);
          });
        });
      });
  });
});

