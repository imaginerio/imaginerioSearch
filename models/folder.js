const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Folder extends Model {
    static associate(models) {
      Folder.hasMany(models.Layer);
    }
  }
  Folder.init(
    {
      name: DataTypes.STRING,
      ordering: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Folder',
    }
  );
  return Folder;
};
