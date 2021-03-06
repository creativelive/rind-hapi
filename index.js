'use strict';

var _ = require('underscore');
var ua = require('./lib/ua');
var deepval = require('deepval');
var path = require('path');
var version = require('./package').version;

var rind = {
  name: 'rind-hapi',
  version: version,
  attributes: {
    pkg: require('./package.json')
  },
  register: function(plugin, options, next) {

    var conf = _.extend({}, options.conf);
    if (conf.redact) {
      // remove any sensitive app config values from those potentially sent to client
      conf.redact.forEach(function(r) {
        deepval(conf, r, null, true);
      });
      deepval(conf, 'redact', null, true);
    }

    var locale = require('rind-locale')({
      locales: options.locales
    });

    var i18n = require('rind-i18n')({
      cwd: path.join(path.dirname(module.parent.filename), 'lang')
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

      if (response.variety === 'view' || response.isBoom) {
        var context;
        if (response.isBoom) {
          // boom objects do not have a source.context
          // so attach context info directly
          context = response.context = {};
        } else {
          context = response.source.context;
        }

        // create the rind object
        context.rind = context.rind || {};
        context.rind.context = context.rind.context || {};
        context.rind.config = context.rind.config || {};

        // populate dump
        context.dump = context.dump || {};

        // attach app conf values
        context.rind.config = _.extend(conf);

        // attach locale details
        context.rind.context.locale = request.pre.locale || {};

        // add i18n functions to top level scope
        context.i18n = request.pre.i18n || {};

        // attach useragent info
        context.rind.context.ua = request.pre.ua || {};

        // attach assets to serve
        context.rind.context.assets = request.pre.assets || {};

        // add the assets hash (allows production asset mapping) to top level scope
        context.hash = options.hash;

        // add each individual cookie to the context under the key "cookie"
        context.cookie = {};
        _.each(request.state, function(cookie, key) {
          context.cookie[key] = cookie;
        });

        // parse rind debug cookie
        if (context.cookie.rind) {
          var rindCookie = {};
          try {
            context.cookie.rind.split('|').forEach(function(kvp) {
              kvp = kvp.split(':');
              var key = kvp[0];
              var value = kvp[1] || true;
              rindCookie[key] = value;
            });
          } catch (e) {}
          context.cookie.rind = rindCookie;
        }

        // make pathname available
        context.rind.context.pathname = request.path;

        // add url to the context
        context.rind.context.url = context.rind.context.url || request.server.info.protocol + '://' + request.info.host + request.path;
      }
      extNext();
    });
    next();
  }
};

module.exports = rind;
