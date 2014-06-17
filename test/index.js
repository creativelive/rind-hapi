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
var path = require('path');
var fs = require('fs');
var expected = fs.readFileSync(path.join(__dirname, 'expected.txt'), 'utf8');

test('plugin should add context object to views', function(t) {
  t.plan(1);

  var options = {
    locales: ['en-US', 'de'],
    cwd: path.join(__dirname, 'lang'),
    conf: {
      foo: 'foo'
    },
    assets: {
      '/': {
        js: {
          i18n: ['foo'],
          main: ['bar']
        },
        css: ['main']
      }
    },
    hash: {
      '/sample.txt': '/sample.3453fg1.txt'
    }
  };

  server.pack.register(rind, options, function(err) {
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
      url: server.info.port,
      headers: {
        'accept-language': 'de',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36',
        'Cookie': 'aaa=bbb'
      }
    }, function(err, data) {
      if (err) {
        t.fail('failed to talk to test server');
      }
      server.stop(function() {
        console.log('server stopped');
      });
      console.log(data.text);

      t.equal(data.text, expected);
    });
  });
});
