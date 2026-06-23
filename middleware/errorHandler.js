const logger = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

const notFound = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const log = req.log || logger;

  if (status >= 500) {
    log.error({ err }, 'request failed');
  } else {
    log.warn({ err: { message: err.message, status } }, 'request failed');
  }

  res.status(status).json({
    error: err.expose || status < 500 ? err.message || 'Error' : 'Internal server error',
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
