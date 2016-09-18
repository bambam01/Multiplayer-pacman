var logger = exports;
logger.debugLevel = 'debug';
logger.log = function(level, message) {
  var levels = ['error', 'warn', 'info', 'debug'];
  if (levels.indexOf(level) >= levels.indexOf(logger.debugLevel) || level === 'debug') {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    };
    console.log(level+': '+message);
  }
}