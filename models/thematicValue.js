const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ThematicValue extends Model {
    static associate(models) {
      ThematicValue.belongsTo(models.ThematicLayer);
      ThematicValue.belongsTo(models.ThematicFeature);
    }
  }
  ThematicValue.init(
    {
      title: DataTypes.TEXT,
      number: DataTypes.FLOAT,
      category: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'ThematicValue',
    }
  );
  return ThematicValue;
};
