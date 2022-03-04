require('dotenv').config();

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
    url: process.env.DB_NAME,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      // statement_timeout: 6000,
      // query_timeout: 6000,
      // connectionTimeoutMillis: 6000,
    },
  },
};
