const { Model } = require('sequelize');
const { fixEncoding } = require('../utils/fixEncoding');

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
      value: DataTypes.ARRAY(DataTypes.TEXT),
      link: DataTypes.ARRAY(DataTypes.TEXT),
      language: {
        type: DataTypes.STRING,
        unique: 'documentMetaLabel',
        defaultValue: 'none',
      },
    },
    {
      sequelize,
      modelName: 'ImageMeta',
      hooks: {
        beforeCreate: meta => {
          // eslint-disable-next-line no-param-reassign
          meta.value = meta.value.map(fixEncoding);
        },
      },
    }
  );
  return ImageMeta;
};
