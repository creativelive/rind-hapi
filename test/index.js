'use strict';

var server = require('./server');
var test = require('tape');
var Chaps = require('chaps');
var chaps = new Chaps({
  debug: true,
  hostname: 'localhost',
  timeout: 2000
});

test('plugin should add context object to views', function(t) {
  t.plan(1);

  server.pack.register(require('..'), {
    conf: {
      foo: 'foo'
    }
  }, function(err) {
    if (err) {
      console.log('Failed loading plugin');
    }
  });

  // start the server
  server.start(function() {
    console.log('server started:', server.info.uri);
    chaps.get({
      url: ':9615/'
    }, function(err, data) {
      if (err) {
        t.fail('failed to talked totest server');
      }
      server.stop(function() {
        console.log('server stopped');
      });
      t.equal(data.text, 'true foo bar\n');
    });
  });
});
