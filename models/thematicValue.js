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
      firstyear: {
        type: DataTypes.INTEGER,
        unique: 'thematicUniqueIndex',
      },
      lastyear: {
        type: DataTypes.INTEGER,
        unique: 'thematicUniqueIndex',
      },
      ThematicLayerId: {
        type: DataTypes.INTEGER,
        unique: 'thematicUniqueIndex',
      },
      ThematicFeatureId: {
        type: DataTypes.INTEGER,
        unique: 'thematicUniqueIndex',
      },
    },
    {
      sequelize,
      modelName: 'ThematicValue',
    }
  );
  return ThematicValue;
};
