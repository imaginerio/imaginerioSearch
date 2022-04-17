module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Layers', 'titlePt', { type: Sequelize.TEXT });
    await queryInterface.renameColumn('Layers', 'title', 'titleEn');
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Layers', 'titlePt');
    await queryInterface.renameColumn('Layers', 'titleEn', 'title');
  },
};
