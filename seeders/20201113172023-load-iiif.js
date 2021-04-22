/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const { isArray, isObject, map, uniqBy } = require('lodash');
const ora = require('ora');
const { ImageMeta, Document, Visual, Sequelize } = require('../models');

const { IIIF, COLLECTIONS } = process.env;

const apiProps = ['dcterms:hasVersion', 'dcterms:source', 'foaf:depicts'];

let loadsComplete = 0;
let loadsSkipped = 0;

const getSeeAlso = seeAlso => {
  if (!seeAlso || !isArray(seeAlso)) return null;
  const link = seeAlso.find(s => s.id && s.id.match(IIIF));
  if (link) return link.id;
  return null;
};

const loadApi = (seeAlso, document) => {
  const link = getSeeAlso(seeAlso);
  if (!link) return Promise.resolve();

  return axios.get(link).then(({ data }) => {
    const meta = [];
    apiProps.forEach(prop => {
      if (data[prop]) {
        const [d] = data[prop];
        const label = `${d.property_label.charAt(0).toUpperCase()}${d.property_label.slice(1)}`;
        meta.push({
          DocumentId: document.id,
          label,
          value: map(data[prop], 'o:label'),
          link: map(data[prop], '@id'),
        });
      }
    });
    return ImageMeta.bulkCreate(uniqBy(meta, 'label'), {
      updateOnDuplicate: ['value', 'link', 'updatedAt'],
    }).then(() => {
      // eslint-disable-next-line no-param-reassign
      document.thumbnail = data.thumbnail_display_urls.large;
      return document.save();
    });
  });
};

const parseIIIF = (metadata, DocumentId) => {
  const meta = [];
  if (!metadata || !isArray(metadata)) return null;
  metadata.forEach(m => {
    if (isObject(m)) {
      Object.keys(m.label).forEach(lang => {
        meta.push({
          DocumentId,
          label: m.label[lang][0],
          value: m.value[lang],
          language: lang,
        });
      });
    }
  });
  return meta;
};

const loadManifest = (manifest, document) =>
  axios.get(manifest).then(async ({ data: { metadata, seeAlso, items } }) => {
    let meta = parseIIIF(metadata, document.id).filter(
      m => m.label !== 'Identifier' && m.label !== 'Depicts'
    );

    meta = [
      ...meta,
      { DocumentId: document.id, label: 'Width', value: [items[0].width] },
      { DocumentId: document.id, label: 'Height', value: [items[0].height] },
    ];

    return ImageMeta.bulkCreate(uniqBy(meta, 'label'), {
      updateOnDuplicate: ['value', 'updatedAt'],
    }).then(() => {
      loadsComplete += 1;
      return loadApi(seeAlso, document);
    });
  });

const deleteNoIIIFDocuments = async collection => {
  const visual = await Visual.findOne({
    where: { title: { [Sequelize.Op.iLike]: collection } },
    attributes: ['id'],
  });
  const {
    data: { items },
  } = await axios.get(`${IIIF}/iiif/3/collection/${collection}`);
  return Document.destroy({
    where: {
      ssid: {
        [Sequelize.Op.notIn]: items.map(i => i.id.replace(/.*?\/3\/(.*?)\/manifest/gi, '$1')),
      },
      VisualId: visual.id,
    },
  }).then(deleted => console.log(`${deleted} items deleted from ${collection}`));
};

const loadCollection = collection => {
  loadsComplete = 0;
  loadsSkipped = 0;
  const spinner = ora(`Loading ${collection}...`).start();
  return axios.get(`${IIIF}/iiif/3/collection/${collection}`).then(({ data: { items } }) =>
    items
      .reduce(async (previousPromise, { id: manifest }, i) => {
        await previousPromise;
        spinner.text = `Loading ${collection} ${i + 1} / ${items.length}`;
        const ssid = manifest.replace(/.*?\/3\/(.*?)\/manifest/gi, '$1');
        const document = await Document.findOne({ where: { ssid }, attributes: ['id'] });
        if (!document) {
          loadsSkipped += 1;
          return Promise.resolve();
        }
        return loadManifest(manifest, document);
      })
      .then(async () =>
        spinner.succeed(`${loadsComplete} items imported / ${loadsSkipped} items skipped`)
      )
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
