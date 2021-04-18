/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const startup = require('./startup').default;

const app = express();

app.set('trust proxy', 1);
app.use(cors());

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const routes = fs.readdirSync(path.join(__dirname, 'routes'));
routes.forEach(route => {
  require(path.join(__dirname, 'routes', route))(app);
});

if (process.env.NODE_ENV === 'production') startup();

module.exports = app;
