module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('Documents', 'thumbnail', { type: Sequelize.TEXT }),
  down: async queryInterface => queryInterface.removeColumn('Documents', 'thumbnail'),
};
