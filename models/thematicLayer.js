const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ThematicLayer extends Model {
    static associate(models) {
      ThematicLayer.hasMany(models.ThematicValue);
    }
  }
  ThematicLayer.init(
    {
      title: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'ThematicLayer',
    }
  );
  return ThematicLayer;
};
