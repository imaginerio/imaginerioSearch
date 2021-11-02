require('dotenv').config();
const axios = require('axios');
const { ImageMeta, Document } = require('../models');

const { IIIF, SMAPSHOT } = process.env;

module.exports = {
  up: () => {
    if (!SMAPSHOT) return Promise.resolve();

    return axios.get(`${IIIF}/iiif/collection/smapshot.json`).then(({ data: { items } }) => {
      const metaRequests = items.map(({ id }) => {
        const ssid = id.replace(/.*?\/3\/(.*?)\/manifest/gi, '$1');
        return Document.findOne({ where: { ssid }, attributes: ['id'] }).then(async document => {
          if (!document) return Promise.resolve();
          return ImageMeta.create({ DocumentId: document.id, label: 'Smapshot', value: [true] });
        });
      });
      return Promise.all(metaRequests);
    });
  },
  down: () => ImageMeta.destroy({ where: { label: 'Smapshot' } }),
};

if (require.main === module) module.exports.up();
