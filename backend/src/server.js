const app = require('./app');
const env = require('./config/env');
const { initModels } = require('./models');
const logger = require('./utils/logger');

let server = null;

async function startServer() {
  await initModels();

  server = app.listen(env.port, env.host, () => {
    logger.info('Backend running', {
      url: `http://${env.host}:${env.port}${env.apiPrefix}`
    });
  });
}

startServer().catch((error) => {
  logger.error('Backend startup failed', {
    message: error?.message,
    code: error?.code
  });
  process.exit(1);
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
  if (!server) {
    process.exit(1);
    return;
  }
  server.close(() => process.exit(1));
});
