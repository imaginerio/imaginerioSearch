const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ThematicFeature extends Model {
    static associate(models) {
      ThematicFeature.hasMany(models.ThematicValue);
    }
  }
  ThematicFeature.init(
    {
      name: {
        type: DataTypes.TEXT,
        unique: 'thematicFeatureUniqueIndex',
      },
      firstyear: {
        type: DataTypes.INTEGER,
        unique: 'thematicFeatureUniqueIndex',
      },
      lastyear: {
        type: DataTypes.INTEGER,
        unique: 'thematicFeatureUniqueIndex',
      },
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
