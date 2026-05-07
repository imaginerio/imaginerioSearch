const app = require('./server');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  logger.info({ port }, 'server started');
});

const shutdown = signal => {
  logger.info({ signal }, 'shutdown initiated');

  const forceExit = setTimeout(() => {
    logger.warn('forced exit after 10s');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async err => {
    if (err) logger.error({ err }, 'error closing http server');
    try {
      await sequelize.close();
    } catch (dbErr) {
      logger.error({ err: dbErr }, 'error closing database');
    }
    logger.info('shutdown complete');
    process.exit(err ? 1 : 0);
  });
};

['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig, () => shutdown(sig)));

process.on('unhandledRejection', err => {
  logger.error({ err }, 'unhandled promise rejection');
});
process.on('uncaughtException', err => {
  logger.fatal({ err }, 'uncaught exception');
  process.exit(1);
});
