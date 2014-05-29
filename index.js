'use strict';

var _ = require('underscore');

var rind = {
  name: 'rind-hapi',
  version: '0.0.1',
  register: function(plugin, options, next) {

    plugin.ext('onPreResponse', function(request, extNext) {
      var response = request.response;
      if (response.variety === 'view') {
        response.source.context = response.source.context || {};
        var context = response.source.context;
        context.rind = {
          context: {},
          config: {}
        };
        // populate dump
        context.dump = context.dump || {};
        // attach app conf values
        context.rind.config = _.extend({}, options.conf);

      }
      extNext();
    });

    next();
  }
};

module.exports = rind;
