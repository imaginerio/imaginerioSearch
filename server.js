/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');

const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const startup = require('./startup').default;

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
