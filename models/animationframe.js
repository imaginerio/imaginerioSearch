const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AnimationFrame extends Model {
    static associate(models) {
      AnimationFrame.belongsTo(models.Animation);
    }
  }
  AnimationFrame.init(
    {
      ordering: DataTypes.INTEGER,
      label: DataTypes.STRING,
      directory: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'AnimationFrame',
    }
  );
  return AnimationFrame;
};
