/* eslint-disable no-console */
require('dotenv').config();
const uuid = require('uuid').v4;
const { uniq } = require('lodash');

const { listLayers, forEachPage } = require('../utils/arcgisClient');
const { mapProperties } = require('../utils/mapProperties');
const { Feature, Layer, Type, Sequelize } = require('../models');

const visual = [
  'AerialExtentsPoly',
  'PlanExtentsPoly',
  'MapExtentsPoly',
  'ViewConesPoly',
  'SurveyExtentsPoly',
  'BasemapExtentsPoly',
];

let OMIT = process.env.OMIT ? JSON.parse(process.env.OMIT) : [];
if (process.env.THEMATIC) {
  OMIT = OMIT.concat(JSON.parse(process.env.THEMATIC));
}

const loadPage = async (layer, features) => {
  const validFeatures = features.filter(f => f.geometry && f.properties.name?.trim());

  const typeLoader = uniq(validFeatures.map(f => f.properties.type)).map(t => ({
    key: t?.toLowerCase().replace(/\W/gi, '-'),
    titleEn: t,
    titlePt: t,
    LayerId: layer.id,
  }));

  await Type.bulkCreate(typeLoader, { ignoreDuplicates: true });
  const types = await layer.getTypes();

  const featureLoader = validFeatures.map(feature => ({
    ...mapProperties({ properties: feature.properties, type: 'feature' }),
    id: `'${uuid()}'`,
    LayerId: layer.id,
    TypeId: types.find(t => t.key === feature.properties.type?.toLowerCase().replace(/\W/gi, '-'))
      ?.dataValues.id,
    geom: Sequelize.fn(
      'ST_SetSRID',
      Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
      4326
    ),
  }));
  return Feature.bulkCreate(featureLoader);
};

const layerLoader = async l => {
  console.log(`----- Loading ${l.name} -----`);
  const name = l.name.replace(/.*\./gm, '');
  let layer = await Layer.findOne({ where: { name } });
  if (!layer) {
    layer = Layer.build({
      name,
      titleEn: l.name.replace(/(Poly|Line)$/, '').replace(/(?!^)([A-Z])/gm, ` $1`),
      remoteId: l.id,
    });
    await layer.save();
  } else {
    await layer.update({ remoteId: l.id });
    await Feature.update({ updated: true }, { where: { LayerId: layer.id } });
  }

  try {
    await forEachPage(l.id, {
      where: 'name IS NOT NULL',
      onPage: features => loadPage(layer, features),
      label: l.name,
    });
    console.log('Deleting superceded features');
    await Feature.destroy({ where: { LayerId: layer.id, updated: true } });
  } catch (error) {
    console.log(`Error loading ${l.name}: ${error?.message ?? error}`);
    console.log('Deleting new features');
    await Feature.destroy({
      where: { LayerId: layer.id, updated: { [Sequelize.Op.ne]: true } },
    });
    await Feature.update({ updated: true }, { where: { VisualId: layer.id } });
  }
};

module.exports = {
  up: async () => {
    const layers = (await listLayers()).filter(
      l => !visual.includes(l.name) && !OMIT.includes(l.name)
    );
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};

if (require.main === module) module.exports.up();
