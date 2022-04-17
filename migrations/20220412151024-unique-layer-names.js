module.exports = {
  up: async queryInterface => {
    await queryInterface.addConstraint('Layers', {
      fields: ['name'],
      type: 'unique',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeConstraint('Layers', 'Layers_name_uk');
  },
};
