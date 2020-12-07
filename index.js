/* eslint-disable no-console */
const express = require('express');
const bodyparser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

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

require('./routes/search')(app);
require('./routes/layers')(app);
require('./routes/documents')(app);
require('./routes/probe')(app);

app.listen(port, () => console.log(`Server started on ${port}`));
