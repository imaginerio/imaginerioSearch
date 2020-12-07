const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Visual extends Model {
    static associate(models) {
      Visual.hasMany(models.Document);
    }
  }
  Visual.init(
    {
      name: DataTypes.TEXT,
      title: DataTypes.TEXT,
      remoteId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Visual',
    }
  );
  return Visual;
};
