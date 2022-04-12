const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Type extends Model {
    static associate(models) {
      Type.belongsTo(models.Layer);
      Type.hasMany(models.Feature);
    }
  }
  Type.init(
    {
      key: {
        type: DataTypes.TEXT,
        unique: true,
      },
      titleEn: DataTypes.TEXT,
      titlePt: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Type',
    }
  );
  return Type;
};
