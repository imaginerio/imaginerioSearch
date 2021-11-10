module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ImageMeta', 'key', { type: Sequelize.TEXT, allowNull: false });
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('ImageMeta', 'key');
  },
};
