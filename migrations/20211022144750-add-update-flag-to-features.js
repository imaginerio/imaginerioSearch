module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Documents', 'updated', { type: Sequelize.BOOLEAN });
    await queryInterface.addColumn('Features', 'updated', { type: Sequelize.BOOLEAN });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('Documents', 'updated');
    await queryInterface.removeColumn('Features', 'updated');
  },
};
