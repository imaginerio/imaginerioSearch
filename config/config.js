require('dotenv').config();

module.exports = {
  development: {
    url: 'postgresql://postgres:postgres@127.0.0.1/postgres',
    dialect: 'postgres',
  },
  test: {
    url: 'postgresql://postgres:postgres@127.0.0.1/postgres',
    dialect: 'postgres',
  },
  production: {
    url: process.env.DB_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
      },
    },
  },
};
