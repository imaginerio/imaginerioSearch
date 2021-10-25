const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.Visual);
      Document.hasMany(models.ImageMeta);
    }
  }
  Document.init(
    {
      ssid: DataTypes.TEXT,
      title: DataTypes.TEXT,
      creator: DataTypes.TEXT,
      creditline: DataTypes.TEXT,
      artstor: DataTypes.TEXT,
      firstyear: DataTypes.INTEGER,
      lastyear: DataTypes.INTEGER,
      thumbnail: DataTypes.TEXT,
      VisualId: DataTypes.INTEGER,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      heading: DataTypes.FLOAT,
      geom: DataTypes.GEOMETRY,
      updated: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Document',
    }
  );
  return Document;
};
