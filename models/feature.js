const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feature extends Model {
    static associate(models) {
      Feature.belongsTo(models.Layer);
    }
  }
  Feature.init(
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
  return Feature;
};
