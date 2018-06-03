// @flow
import winston from 'winston';

// Keep it simple to focus on the need first
// Logger should send log to a logger service
const logger = new (winston.Logger)({
  level: 'info',
  transports: [
    new winston.transports.Console({
      colorize: true,
    }),
  ],
});

export default logger;
