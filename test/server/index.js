'use strict';

var Hapi = require('hapi');
var clc = require('cli-color');
var moment = require('moment');
var port = 9615;

// server config
var server = new Hapi.Server('localhost', port, {
  cors: true,
  views: {
    isCached: false,
    path: __dirname,
    engines: {
      ejs: {
        module: 'ejs'
      }
    }
  }
});

server.on('request', function(request, event) {
  if (event.data && event.data.url) {
    if (event.data.url === '/favicon.ico') {
      return;
    }
    console.log(clc.cyan(moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + event.data.url));
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

module.exports = server;
