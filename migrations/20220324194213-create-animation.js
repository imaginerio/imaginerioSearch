module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Animations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
      },
      firstyear: {
        type: Sequelize.INTEGER,
      },
      lastyear: {
        type: Sequelize.INTEGER,
      },
      url: {
        type: Sequelize.TEXT,
      },
      maxzoom: {
        type: Sequelize.INTEGER,
      },
      minzoom: {
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
  async down(queryInterface) {
    await queryInterface.dropTable('Animations');
  },
};
