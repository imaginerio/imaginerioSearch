const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImageMeta extends Model {
    static associate(models) {
      ImageMeta.belongsTo(models.Document);
    }
  }
  ImageMeta.init(
    {
      DocumentId: {
        type: DataTypes.TEXT,
        unique: 'documentMetaLabel',
      },
      label: {
        type: DataTypes.TEXT,
        unique: 'documentMetaLabel',
      },
      value: DataTypes.TEXT,
      link: DataTypes.TEXT,
      language: {
        type: DataTypes.STRING,
        unique: 'documentMetaLabel',
      },
    },
    {
      sequelize,
      modelName: 'ImageMeta',
    }
  );
  return ImageMeta;
};
