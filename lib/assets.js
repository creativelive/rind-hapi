'use strict';

function assets(opts) {
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
