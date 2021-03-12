module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('Features', 'type', { type: Sequelize.TEXT }),
  down: async queryInterface => queryInterface.removeColumn('Features', 'Type'),
};
