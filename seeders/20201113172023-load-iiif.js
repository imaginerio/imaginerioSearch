/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const { isArray, isObject, uniqBy } = require('lodash');
const ora = require('ora');
const { ImageMeta, Document, Visual, Sequelize } = require('../models');
const { fixEncoding } = require('../utils/fixEncoding');

const { IIIF, COLLECTIONS } = process.env;

let loadsComplete = 0;
let loadsSkipped = 0;

const parseIIIF = (metadata, DocumentId) => {
  const meta = [];
  if (!metadata || !isArray(metadata)) return null;
  metadata.forEach(m => {
    if (isObject(m)) {
      Object.keys(m.label).forEach(lang => {
        const value = m.value[lang] || m.value.none;
        const key = m.label.en[0] || Object.values(m.label)[0][0];
        const docMeta = {
          DocumentId,
          label: m.label[lang][0],
          key,
          value: value.map(fixEncoding),
          language: lang,
        };

        if (value[0].match(/^<a.*\/a>$/)) {
          docMeta.value = value.map(v => v.replace(/<a.*?>(.*?)<\/a>/gi, '$1'));
          docMeta.link = value
            .map(v => v.replace(/.*href=\\?"(.*?)\\?".*/gi, '$1'))
            .map(v => v.replace(/&#x3A;/gi, ':'))
            .map(v => v.replace(/&#x2F;/gi, '/'));
        }

        meta.push(docMeta);
      });
    }
  });
  return meta;
};

const parseLink = (link, label, DocumentId) => ({
  DocumentId,
  label,
  key: label,
  value: link.map(l => l.label.none[0]),
  link: link.map(l => l.id),
});

const loadManifest = (manifest, document) =>
  axios
    .get(manifest)
    .then(async ({ data: { metadata, items, seeAlso, homepage, thumbnail } }) => {
      let meta = parseIIIF(metadata, document.id).filter(
        m => m.label !== 'Identifier' && m.label !== 'Depicts'
      );

      if (seeAlso) {
        meta.push(parseLink(seeAlso, 'See Also', document.id));
      }

      if (homepage) {
        meta.push(parseLink(homepage, 'Source', document.id));
      }

      meta = [
        ...meta,
        { DocumentId: document.id, label: 'Width', key: 'Width', value: [items[0].width] },
        { DocumentId: document.id, label: 'Height', key: 'Height', value: [items[0].height] },
      ];

      return ImageMeta.bulkCreate(uniqBy(meta, 'label'), {
        individualHooks: true,
        logging: console.log,
      }).then(() => {
        loadsComplete += 1;
        // eslint-disable-next-line no-param-reassign
        document.thumbnail = thumbnail[0].id;
        return document.save();
      });
    })
    .catch(err => console.log(err));

const deleteNoIIIFDocuments = async collection => {
  const visual = await Visual.findOne({
    where: { title: { [Sequelize.Op.iLike]: collection } },
    attributes: ['id'],
  });
  const {
    data: { items },
  } = await axios.get(`${IIIF}/iiif/collection/${collection}.json`);
  return Document.findMany({
    attributes: ['ssid'],
    where: {
      ssid: {
        [Sequelize.Op.notIn]: items.map(i => i.id.replace(/.*?\/iiif\/(.*?)\/manifest.*/gi, '$1')),
      },
      VisualId: visual.id,
    },
  }).then(deleted => {
    console.log(`${deleted.map(d => d.ssid).join('; ')} items deleted from ${collection}`);
    return Document.destroy({
      where: {
        ssid: {
          [Sequelize.Op.notIn]: items.map(i =>
            i.id.replace(/.*?\/iiif\/(.*?)\/manifest.*/gi, '$1')
          ),
        },
        VisualId: visual.id,
      },
    });
  });
};

const loadCollection = collection => {
  loadsComplete = 0;
  loadsSkipped = 0;
  const spinner = ora(`Loading ${collection}...`).start();
  return axios
    .get(`${IIIF}/iiif/collection/${collection}.json`)
    .then(({ data: { items } }) =>
      items.reduce(async (previousPromise, { id: manifest }, i) => {
        await previousPromise;
        spinner.text = `Loading ${collection} ${i + 1} / ${items.length}`;
        const ssid = manifest.replace(/.*?\/iiif\/(.*?)\/manifest.*/gi, '$1');
        const document = await Document.findOne({ where: { ssid }, attributes: ['id'] });
        if (!document) {
          loadsSkipped += 1;
          return Promise.resolve();
        }
        const metaRecords = await document.getImageMeta();
        await Promise.all(metaRecords.map(record => record.destroy()));
        return loadManifest(manifest, document);
      })
    )
    .then(async () =>
      spinner.succeed(`${loadsComplete} items imported / ${loadsSkipped} items skipped`)
    );
};

module.exports = {
  up: async () => {
    if (!IIIF || !COLLECTIONS) return null;
    const collections = JSON.parse(COLLECTIONS);
    await Promise.all(collections.map(deleteNoIIIFDocuments));
    return JSON.parse(COLLECTIONS).reduce(async (previousPromise, collection) => {
      await previousPromise;
      return loadCollection(collection);
    }, Promise.resolve());
  },
  down: queryInterface => queryInterface.bulkDelete('ImageMeta'),
};

if (require.main === module) module.exports.up();
