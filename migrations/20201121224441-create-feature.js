module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Features', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT,
      },
      objectid: {
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
      },
      firstyear: {
        type: Sequelize.INTEGER,
      },
      lastyear: {
        type: Sequelize.INTEGER,
      },
      LayerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Layers',
          key: 'id',
        },
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
    await queryInterface.dropTable('Features');
  },
};
