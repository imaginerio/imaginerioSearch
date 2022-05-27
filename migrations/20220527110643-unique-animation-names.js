module.exports = {
  up: async queryInterface => {
    await queryInterface.addConstraint('Animations', {
      fields: ['name'],
      type: 'unique',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeConstraint('Animations', 'Animations_name_uk');
  },
};
