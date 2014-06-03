'use strict';

var useragent = require('useragent');

var windowsRegex = /windows/i;

function ua(uaString) {
  var agent;
  try {
    agent = useragent.parse(uaString).toJSON();
  } catch (e) {
    return {};
  }
  if (agent.os.family === 'Android' || agent.os.family === 'iOS') {
    agent.mobile = true;
  } else {
    if (windowsRegex.exec(agent.os.family)) {
      agent.os.windows = true;
    }
  }
  return agent;
}

module.exports = ua;
