module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      titleEN: {
        type: Sequelize.TEXT,
      },
      titlePT: {
        type: Sequelize.TEXT,
      },
      LayerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Layers',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Types');
  },
};
