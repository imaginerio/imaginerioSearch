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
      property: DataTypes.TEXT,
      name: DataTypes.TEXT,
      colors: DataTypes.ARRAY(DataTypes.STRING),
      remoteId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'ThematicLayer',
    }
  );
  return ThematicLayer;
};
