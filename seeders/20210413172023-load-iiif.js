/* eslint-disable no-console */
require('dotenv').config();
const md5 = require('md5');
const axios = require('axios');
const { isArray, isObject, map, uniqBy } = require('lodash');
const ora = require('ora');
const wkt = require('wellknown');
const { ImageMeta, Document, Visual, Sequelize } = require('../models');

const { IIIF, COLLECTIONS, ID_SECRET } = process.env;

const apiProps = ['dcterms:hasVersion', 'dcterms:source', 'foaf:depicts'];

const getSeeAlso = seeAlso => {
  if (!seeAlso || !isArray(seeAlso)) return null;
  const link = seeAlso.find(s => s.id && s.id.match(IIIF));
  if (link) return link.id;
  return null;
};

const loadApi = (seeAlso, DocumentId) => {
  const link = getSeeAlso(seeAlso);
  if (!link) return Promise.resolve();

  return axios.get(link).then(({ data }) => {
    const meta = [];
    apiProps.forEach(prop => {
      if (data[prop]) {
        const [d] = data[prop];
        const label = `${d.property_label.charAt(0).toUpperCase()}${d.property_label.slice(1)}`;
        meta.push({
          DocumentId,
          label,
          value: map(data[prop], 'o:label'),
          link: map(data[prop], '@id'),
        });
      }
    });
    return ImageMeta.bulkCreate(uniqBy(meta, 'label'), {
      updateOnDuplicate: ['value', 'link', 'updatedAt'],
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

const createDocument = async (seeAlso, collection) => {
  const link = getSeeAlso(seeAlso);
  if (!link) return Promise.resolve();

  const { data } = await axios.get(link);
  const { data: mapping } = await axios.get(data['o-module-mapping:marker'][0]['@id']);
  const visual = await Visual.findOne({
    where: { title: { [Sequelize.Op.iLike]: collection } },
    attributes: ['id'],
  });
  const ssid = data['dcterms:identifier'][0]['@value'];
  const temporal = data['dcterms:temporal'] || data['dcterms:available'];
  if (!temporal || !data['schema:polygon']) return Promise.resolve();
  const [firstyear, lastyear] = temporal[0]['@value'].split('/');
  return Document.create({
    id: md5(`${ID_SECRET}${ssid}`),
    ssid,
    firstyear,
    lastyear,
    VisualId: visual.id,
    latitude: mapping['o-module-mapping:lat'],
    longitude: mapping['o-module-mapping:lng'],
    geom: wkt(data['schema:polygon'][0]['@value']),
  });
};

const loadManifest = (manifest, collection) =>
  axios.get(manifest).then(async ({ data: { metadata, seeAlso, items } }) => {
    const ssid = Object.values(
      metadata.find(m => Object.values(m.label)[0][0] === 'Identifier').value
    )[0][0];
    let document = await Document.findOne({ where: { ssid }, attributes: ['id'], raw: true });
    if (!document) document = await createDocument(seeAlso, collection);
    if (!document) return Promise.resolve();
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
    }).then(() => loadApi(seeAlso, document.id));
  });

const loadCollection = collection => {
  const spinner = ora(`Loading ${collection}...`).start();
  return axios.get(`${IIIF}/iiif/3/collection/${collection}`).then(({ data: { items } }) =>
    items
      .reduce(async (previousPromise, { id: manifest }, i) => {
        await previousPromise;
        spinner.text = `Loading ${collection} ${i + 1} / ${items.length}`;
        return loadManifest(manifest, collection);
      })
      .then(() => spinner.succeed())
  );
};

module.exports = {
  up: async () => {
    if (!IIIF || !COLLECTIONS) return null;

    return JSON.parse(COLLECTIONS).reduce(async (previousPromise, collection) => {
      await previousPromise;
      return loadCollection(collection);
    }, Promise.resolve());
  },

  down: queryInterface => queryInterface.bulkDelete('ImageMeta'),
};
