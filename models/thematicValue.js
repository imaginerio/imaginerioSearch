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
      number: DataTypes.FLOAT,
      category: DataTypes.TEXT,
      firstyear: DataTypes.INTEGER,
      lastyear: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'ThematicValue',
    }
  );
  return ThematicValue;
};
