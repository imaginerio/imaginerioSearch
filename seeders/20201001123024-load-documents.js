/* eslint-disable no-console */
require('dotenv').config();
const uuid = require('uuid').v4;
const centroid = require('@turf/centroid').default;

const { listLayers, forEachPage } = require('../utils/arcgisClient');
const { mapProperties } = require('../utils/mapProperties');
const { Visual, Document, Sequelize } = require('../models');

const visual = [
  'ViewConesPoly',
  'AerialExtentsPoly',
  'PlanExtentsPoly',
  'MapExtentsPoly',
  'SurveyExtentsPoly',
];

const loadPage = async (layer, features) => {
  const featureLoader = features.map(feature => {
    const properties = mapProperties({ properties: feature.properties, type: 'document' });
    if (!properties.longitude || !properties.latitude) {
      const point = centroid(feature.geometry);
      [properties.longitude, properties.latitude] = point.geometry.coordinates;
    }
    return {
      ...feature.properties,
      id: `'${uuid()}'`,
      VisualId: layer.id,
      geom: Sequelize.fn(
        'ST_SetSRID',
        Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
        4326
      ),
    };
  });
  return Document.bulkCreate(featureLoader);
};

const layerLoader = async l => {
  console.log(`----- Loading ${l.name} -----`);
  const name = l.name.replace(/.*\./gm, '');
  let layer = await Visual.findOne({ where: { name } });
  if (!layer) {
    layer = Visual.build({
      name,
      title: l.name
        .replace(/.*\./gm, '')
        .replace(/(Poly|Line)$/, '')
        .replace(/(?!^)([A-Z])/gm, ` $1`)
        .replace(/ .*/, 's'),
      remoteId: l.id,
    });
  } else {
    await Document.update({ updated: true }, { where: { VisualId: layer.id } });
  }
  layer.remoteId = l.id;
  await layer.save();

  try {
    await forEachPage(l.id, {
      where: 'objectid IS NOT NULL',
      onPage: features => loadPage(layer, features),
      label: l.name,
    });
    console.log('Deleting superceded features');
    await Document.destroy({ where: { VisualId: layer.id, updated: true } });
  } catch (error) {
    console.log(`Error loading ${l.name}: ${error?.message ?? error}`);
    await Document.destroy({
      where: { VisualId: layer.id, updated: { [Sequelize.Op.ne]: true } },
    });
    await Document.update({ updated: true }, { where: { VisualId: layer.id } });
  }
};

module.exports = {
  up: async () => {
    const layers = (await listLayers()).filter(l => visual.includes(l.name));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Visuals').then(() => queryInterface.bulkDelete('Documents')),
};

if (require.main === module) module.exports.up();
