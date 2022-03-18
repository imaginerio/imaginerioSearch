module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Features', 'creator', { type: Sequelize.TEXT });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Features', 'creator');
  },
};
