'use strict';

var _ = require('underscore');
var ua = require('./lib/ua');

var rind = {
  name: 'rind-hapi',
  version: '0.0.1',
  register: function(plugin, options, next) {

    var locale = require('rind-locale')({
      locales: options.locales
    });

    var i18n = require('rind-i18n')({
      cwd: options.cwd
    });

    var assets = require('./lib/assets')({
      assets: options.assets
    });

    plugin.ext('onRequest', function(request, extNext) {
      request.headers = request.headers || {};
      request.query = request.query || {};

      request.pre.locale = locale(request.query.locale || request.headers['accept-language']);
      request.pre.lang = request.pre.locale.substring(0, 2);
      request.pre.i18n = i18n[request.pre.locale];
      request.pre.ua = ua(request.headers['user-agent']);
      request.pre.assets = assets(request.url);
      extNext();
    });

    plugin.ext('onPreResponse', function(request, extNext) {
      var response = request.response;
      if (response.variety === 'view') {
        response.source.context = response.source.context || {};
        var context = response.source.context;

        // create the rind object
        context.rind = {
          context: {},
          config: {}
        };

        // populate dump
        context.dump = context.dump || {};

        // attach app conf values
        context.rind.config = _.extend({}, options.conf);

        // attach locale details
        context.rind.context.locale = request.pre.locale || {};

        // add i18n functions to top level scope
        context.i18n = request.pre.i18n || {};

        // attach useragent info
        context.rind.context.ua = request.pre.ua || {};

        // attach assets to serve
        context.rind.context.assets = request.pre.assets || {};

      }
      extNext();
    });

    next();
  }
};

module.exports = rind;
