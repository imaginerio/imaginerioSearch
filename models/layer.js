const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layer extends Model {
    static associate(models) {
      Layer.hasMany(models.Feature);
    }
  }
  Layer.init(
    {
      name: DataTypes.TEXT,
      title: DataTypes.TEXT,
      remoteId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Layer',
    }
  );
  return Layer;
};
