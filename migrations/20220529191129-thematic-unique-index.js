module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('ThematicValues', {
      fields: ['firstyear', 'lastyear', 'ThematicLayerId', 'ThematicFeatureId'],
      type: 'unique',
    });
    await queryInterface.addColumn('ThematicFeatures', 'firstyear', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('ThematicFeatures', 'lastyear', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addConstraint('ThematicFeatures', {
      fields: ['firstyear', 'lastyear', 'name'],
      type: 'unique',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeConstraint(
      'ThematicValues',
      'ThematicValues_firstyear_lastyear_ThematicLayerId_ThematicFeatu'
    );
    await queryInterface.removeConstraint(
      'ThematicFeatures',
      'ThematicFeatures_firstyear_lastyear_name_uk'
    );
    await queryInterface.removeColumn('ThematicFeatures', 'firstyear');
    await queryInterface.removeColumn('ThematicFeatures', 'lastyear');
  },
};
