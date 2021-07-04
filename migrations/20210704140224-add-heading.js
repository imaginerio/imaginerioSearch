module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('Documents', 'heading', { type: Sequelize.FLOAT }),

  down: async queryInterface => queryInterface.removeColumn('Documents', 'heading'),
};
