module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ThematicFeatures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.ENUM(['point', 'line', 'polygon']),
      },
      geom: {
        type: Sequelize.GEOMETRY,
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
    await queryInterface.dropTable('ThematicFeatures');
  },
};
