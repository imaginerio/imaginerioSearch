module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AnimationFrames', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ordering: {
        type: Sequelize.INTEGER,
      },
      label: {
        type: Sequelize.STRING,
      },
      directory: {
        type: Sequelize.STRING,
      },
      AnimationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Animations',
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
    await queryInterface.dropTable('AnimationFrames');
  },
};
