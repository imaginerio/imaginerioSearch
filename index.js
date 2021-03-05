/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const startup = require('./startup').default;

const port = process.env.PORT || 5000;

const app = express();

app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(cors());

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const routes = fs.readdirSync(path.join(__dirname, 'routes'));
routes.forEach(route => {
  require(path.join(__dirname, 'routes', route))(app);
});

startup();

app.listen(port, () => console.log(`Server started on ${port}`));
