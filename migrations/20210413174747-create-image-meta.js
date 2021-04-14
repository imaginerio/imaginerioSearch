module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ImageMeta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      DocumentId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: {
          model: 'Documents',
          key: 'id',
        },
      },
      label: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
      },
      link: {
        type: Sequelize.TEXT,
      },
      language: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex('ImageMeta', {
      unique: true,
      fields: ['DocumentId', 'label', 'language'],
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('ImageMeta');
  },
};
