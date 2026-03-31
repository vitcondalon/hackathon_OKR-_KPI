const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const server = app.listen(env.port, env.host, () => {
  logger.info('Backend running', {
    url: `http://${env.host}:${env.port}${env.apiPrefix}`
  });
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection', {
    message: error?.message
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    message: error?.message
  });
  server.close(() => process.exit(1));
});
