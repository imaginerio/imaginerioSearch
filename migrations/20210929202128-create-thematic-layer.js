module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ThematicLayers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.TEXT,
      },
      name: {
        type: Sequelize.TEXT,
      },
      property: {
        type: Sequelize.TEXT,
      },
      colors: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      remoteId: {
        type: Sequelize.INTEGER,
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
  down: async queryInterface => {
    await queryInterface.dropTable('ThematicLayers');
  },
};
