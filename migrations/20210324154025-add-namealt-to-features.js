module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('Features', 'namealt', { type: Sequelize.TEXT }),
  down: async queryInterface => queryInterface.removeColumn('Features', 'namealt'),
};
