const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Thematic extends Model {
    static associate(models) {
      Thematic.hasMany(models.ThematicFeature);
    }
  }
  Thematic.init(
    {
      objectid: DataTypes.INTEGER,
      name: DataTypes.TEXT,
      namealt: DataTypes.TEXT,
      firstyear: DataTypes.INTEGER,
      lastyear: DataTypes.INTEGER,
      LayerId: DataTypes.INTEGER,
      type: DataTypes.TEXT,
      geom: DataTypes.GEOMETRY,
    },
    {
      sequelize,
      modelName: 'Feature',
    }
  );
  return Thematic;
};
