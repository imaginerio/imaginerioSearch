const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Animation extends Model {
    static associate(models) {
      Animation.hasMany(models.AnimationFrame);
    }
  }
  Animation.init(
    {
      name: {
        type: DataTypes.TEXT,
        unique: true,
      },
      title: DataTypes.STRING,
      firstyear: DataTypes.INTEGER,
      lastyear: DataTypes.INTEGER,
      url: DataTypes.TEXT,
      maxzoom: DataTypes.INTEGER,
      minzoom: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Animation',
    }
  );
  return Animation;
};
