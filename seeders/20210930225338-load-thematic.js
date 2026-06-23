/* eslint-disable no-console */
require('dotenv').config();
const colorbrewer = require('colorbrewer');

const { listLayers, forEachPage } = require('../utils/arcgisClient');
const { ThematicFeature, ThematicLayer, ThematicValue, Sequelize } = require('../models');
const config = require('../config/thematic');

const thematicLayers = config[process.env.MAPPING];
const { sequential } = colorbrewer.schemeGroups;

const loadPage = async (layers, features) =>
  Promise.all(
    features.map(feature =>
      ThematicFeature.upsert({
        name: feature.properties[thematicLayers[layers[0].name].name],
        firstyear: feature.properties.firstyear,
        lastyear: feature.properties.lastyear,
        geom: Sequelize.fn(
          'ST_SetSRID',
          Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
          4326
        ),
      }).then(([thematicFeature]) =>
        ThematicValue.bulkCreate(
          layers.map(({ id, property }) => ({
            number: feature.properties[property],
            firstyear: feature.properties.firstyear,
            lastyear: feature.properties.lastyear,
            ThematicLayerId: id,
            ThematicFeatureId: thematicFeature.id,
          }))
        )
      )
    )
  );

const layerLoader = async l => {
  console.log(`----- Loading ${l.name} -----`);
  const name = l.name.replace(/.*\./gm, '');
  let layers = await ThematicLayer.findAll({ where: { name } });
  if (!layers.length) {
    layers = await ThematicLayer.bulkCreate(
      thematicLayers[name].layers.map(layer => ({
        name,
        title: layer.title,
        property: layer.property,
        remoteId: l.id,
        colors: colorbrewer[sequential[Math.floor(Math.random() * sequential.length)]][4],
      }))
    );
  }

  try {
    await forEachPage(l.id, {
      where: 'objectid IS NOT NULL',
      onPage: features => loadPage(layers, features),
      label: l.name,
    });
  } catch (error) {
    console.log(`Error loading ${l.name}: ${error?.message ?? error}`);
  }
};

module.exports = {
  up: async () => {
    if (!thematicLayers || !Object.keys(thematicLayers).length) return Promise.resolve();
    const wanted = Object.keys(thematicLayers);
    const layers = (await listLayers()).filter(l => wanted.includes(l.name));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};

if (require.main === module) module.exports.up();
