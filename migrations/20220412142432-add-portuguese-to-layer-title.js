module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Layers', 'titlePT', { type: Sequelize.TEXT });
    await queryInterface.renameColumn('Layers', 'title', 'titleEN');
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Layers', 'titlePT');
    await queryInterface.renameColumn('Layers', 'titleEN', 'title');
  },
};
