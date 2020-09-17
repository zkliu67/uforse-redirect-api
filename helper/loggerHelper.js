const { createLogger, format, transports, config } = require('winston');

const redirectLogger = createLogger({
  transports: [
    new transports.Console()
  ]
});

module.exports = redirectLogger;