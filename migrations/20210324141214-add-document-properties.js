module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface
      .addColumn('Documents', 'creator', { type: Sequelize.TEXT })
      .then(() => queryInterface.addColumn('Documents', 'creditline', { type: Sequelize.TEXT }))
      .then(() => queryInterface.addColumn('Documents', 'artstor', { type: Sequelize.TEXT })),
  down: async queryInterface =>
    queryInterface
      .removeColumn('Documents', 'creator')
      .then(() => queryInterface.removeColumn('Documents', 'creditline'))
      .then(() => queryInterface.removeColumn('Documents', 'artstor')),
};
