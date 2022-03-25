module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Folders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      ordering: {
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

    await queryInterface.addColumn('Layers', 'FolderId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Folders',
        key: 'id',
        onDelete: 'CASCADE',
      },
    });
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('Layers', 'FolderId');
    await queryInterface.dropTable('Folders');
  },
};
