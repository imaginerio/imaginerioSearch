module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('Features', {
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
      })
      .then(() =>
        queryInterface.addIndex('Features', {
          using: 'GIST',
          fields: ['geom'],
        })
      ),
  down: queryInterface => queryInterface.dropTable('Features'),
};
