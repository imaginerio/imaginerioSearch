const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ThematicFeature extends Model {
    static associate(models) {
      ThematicFeature.hasMany(models.ThematicValue);
    }
  }
  ThematicFeature.init(
    {
      name: DataTypes.TEXT,
      type: DataTypes.ENUM(['point', 'line', 'polygon']),
      geom: DataTypes.GEOMETRY,
    },
    {
      sequelize,
      modelName: 'ThematicFeature',
    }
  );
  return ThematicFeature;
};
