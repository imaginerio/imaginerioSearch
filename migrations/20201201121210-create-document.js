module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT,
      },
      ssid: {
        type: Sequelize.TEXT,
      },
      firstyear: {
        type: Sequelize.INTEGER,
      },
      lastyear: {
        type: Sequelize.INTEGER,
      },
      VisualId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Visuals',
          key: 'id',
        },
      },
      longitude: {
        type: Sequelize.FLOAT,
      },
      latitude: {
        type: Sequelize.FLOAT,
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
    }),
  down: queryInterface => queryInterface.dropTable('Documents'),
};
