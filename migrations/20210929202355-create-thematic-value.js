module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ThematicValues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.TEXT,
      },
      number: {
        type: Sequelize.FLOAT,
      },
      category: {
        type: Sequelize.TEXT,
      },
      ThematicLayerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ThematicLayers',
          key: 'id',
        },
      },
      ThematicFeatureId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ThematicFeatures',
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
  down: async queryInterface => {
    await queryInterface.dropTable('ThematicValues');
  },
};
