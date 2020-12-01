module.exports = {
  up: queryInterface => queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis'),
  down: () => Promise.resolve(),
};
