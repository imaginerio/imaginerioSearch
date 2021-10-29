require('dotenv').config();
const fs = require('fs');

module.exports = {
  development: {
    url: 'postgresql://postgres:postgres@127.0.0.1/imagineriosearch',
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
  test: {
    url: 'postgresql://postgres:postgres@127.0.0.1/imagineriotest',
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
  production: {
    url: process.env.DB_URL,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: [fs.readFileSync(process.env.CERT_PATH)],
      },
      // statement_timeout: 6000,
      // query_timeout: 6000,
      // connectionTimeoutMillis: 6000,
    },
  },
};
