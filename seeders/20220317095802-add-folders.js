const { Layer, Folder } = require('../models');
const config = require('../config/mappings');

module.exports = {
  async up() {
    if (config[process.env.MAPPING].folders) {
      const { folders } = config[process.env.MAPPING];
      let defaultFolder;

      await Promise.all(
        folders.map(async ({ name, layers, defaultFolder: isDefaultFolder }) => {
          let folder = await Folder.findOne({ where: { name } });
          if (!folder) {
            folder = await Folder.create({ name });
          }
          if (isDefaultFolder) {
            defaultFolder = folder;
          }
          return Promise.all(
            layers.map(layerName =>
              Layer.findOne({ where: { name: layerName } }).then(layer => {
                if (layer) {
                  return layer.setFolder(folder);
                }
                return Promise.resolve();
              })
            )
          );
        })
      );

      if (defaultFolder) {
        const unmatchedLayers = await Layer.findAll({ where: { FolderId: null } });
        if (unmatchedLayers && unmatchedLayers.length) {
          return Promise.all(unmatchedLayers.map(l => l.setFolder(defaultFolder)));
        }
      }
    }
    return Promise.resolve();
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Folders');
  },
};

if (require.main === module) module.exports.up();
