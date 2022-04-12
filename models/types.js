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
      titleEN: DataTypes.TEXT,
      titlePT: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Type',
    }
  );
  return Type;
};
