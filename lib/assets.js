'use strict';

function assets(opts) {
  if (!opts.assets) {
    if (opts.verbose) {
      console.warn('rind-hapi: no assets defined');
    }
    return function() {
      return {};
    };
  }
  return function getAssets(url) {
    var assetsMatch;
    var path = url.pathname.split('/').slice(1);
    while (!assetsMatch) {
      assetsMatch = opts.assets['/' + path.join('/')];
      path.pop();
    }
    return assetsMatch;
  };
}

module.exports = assets;
