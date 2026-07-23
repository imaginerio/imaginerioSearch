/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');

const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const startup = require('./startup').default;

// The imagineRio site build fans out hundreds of API requests in well under a
// minute, tripping the per-IP rate limit and filling its build log with 429s.
// A request carrying the shared bypass token skips the limiter entirely. The
// token is optional: with RATE_LIMIT_BYPASS_TOKEN unset, nothing can bypass,
// so the limiter behaves exactly as it did before.
const bypassToken = process.env.RATE_LIMIT_BYPASS_TOKEN;

const hasBypassToken = req => {
  if (!bypassToken) return false;
  const provided = req.get('x-ratelimit-bypass');
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(bypassToken);
  // timingSafeEqual throws on a length mismatch, so gate on length first.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const app = express();

app.set('trust proxy', 1);

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_PER_MIN) || 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: hasBypassToken,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const routes = fs.readdirSync(path.join(__dirname, 'routes'));
routes.forEach(route => {
  require(path.join(__dirname, 'routes', route))(app);
});

app.use(notFound);
app.use(errorHandler);

if (process.env.STARTUP) startup();

module.exports = app;
