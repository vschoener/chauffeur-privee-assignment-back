import app from './bootstraper';
import logger from './logger';

app.start().catch((e) => {
  logger.log('error', e);
});
