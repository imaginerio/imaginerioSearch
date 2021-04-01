module.exports = {
  up: queryInterface => queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent'),
  down: () => Promise.resolve(),
};
