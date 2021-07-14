require('dotenv').config();
const axios = require('axios');
const { ImageMeta, Document } = require('../models');

const { IIIF } = process.env;

module.exports = {
  up: () =>
    axios.get(`${IIIF}/iiif/3/collection/smapshot`).then(({ data: { items } }) => {
      const metaRequests = items.map(({ id }) => {
        const ssid = id.replace(/.*?\/3\/(.*?)\/manifest/gi, '$1');
        return Document.findOne({ where: { ssid }, attributes: ['id'] }).then(document => {
          if (!document) return Promise.resolve();
          return document.addImageMeta({ label: 'Smapshot', value: [true] });
        });
      });
      return Promise.all(metaRequests);
    }),

  down: () => ImageMeta.destroy({ where: { label: 'Smapshot' } }),
};

if (require.main === module) module.exports.up();
