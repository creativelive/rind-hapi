'use strict';

var server = require('abner')();
var test = require('tape');
var Chaps = require('chaps');
var chaps = new Chaps({
  debug: true,
  hostname: 'localhost:',
  timeout: 2000
});
var rind = require('..');

test('plugin should add context object to views', function(t) {
  t.plan(1);

  server.pack.register(rind, {
    conf: {
      foo: 'foo'
    }
  }, function(err) {
    if (err) {
      console.log('Failed loading plugin');
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: function(request, reply) {
        reply.view('main', {
          dump: 'bar'
        });
      }
    }
  });

  // start the server
  server.start(function() {
    console.log('server started:', server.info.uri);
    chaps.get({
      url: server.info.port
    }, function(err, data) {
      if (err) {
        t.fail('failed to talk to test server');
      }
      server.stop(function() {
        console.log('server stopped');
      });
      console.log('output:', data.text);
      t.equal(data.text, 'true foo bar\n');
    });
  });
});
