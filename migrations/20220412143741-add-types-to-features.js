module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Features', 'type');
    await queryInterface.addColumn('Features', 'TypeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Types',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Features', 'TypeId');
    await queryInterface.addColumn('Features', 'type', { type: Sequelize.TEXT });
  },
};
