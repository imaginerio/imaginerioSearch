require('dotenv').config();

module.exports = {
  development: {
    url: 'postgresql://postgres:postgres@127.0.0.1/postgres',
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
  test: {
    url: 'postgresql://postgres:postgres@127.0.0.1/postgres',
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
      },
    },
  },
};
