require('dotenv').config();

const productionSsl = () => {
  if (process.env.DB_CA_CERT) {
    return {
      require: true,
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT,
    };
  }
  // Render's managed Postgres serves a self-signed cert at the connection-string
  // host. Without DB_CA_CERT we accept it but still require encryption.
  return {
    require: true,
    rejectUnauthorized: false,
  };
};

module.exports = {
  development: {
    url: process.env.DB_URL || 'postgresql://postgres:postgres@127.0.0.1/imagineriosearch',
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
      ssl: productionSsl(),
    },
  },
};
