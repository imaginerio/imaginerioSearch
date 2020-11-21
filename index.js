/* eslint-disable no-console */
const express = require('express');
const bodyparser = require('body-parser');

const port = process.env.PORT || 5000;

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

require('./routes/nameSearch')(app);

app.listen(port, () => console.log(`Server started on ${port}`));
