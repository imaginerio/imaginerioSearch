module.exports = {
  up: async queryInterface => queryInterface.addIndex('Features', ['LayerId', 'type']),
  down: async queryInterface => queryInterface.removeIndex('Features', ['LayerId', 'type']),
};
