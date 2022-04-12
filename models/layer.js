const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layer extends Model {
    static associate(models) {
      Layer.hasMany(models.Feature);
      Layer.belongsTo(models.Folder);
      Layer.hasMany(models.Type);
    }
  }
  Layer.init(
    {
      name: {
        type: DataTypes.TEXT,
        unique: true,
      },
      titleEn: DataTypes.TEXT,
      titlePt: DataTypes.TEXT,
      remoteId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Layer',
    }
  );
  return Layer;
};
