/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const https = require('https');
const md5 = require('md5');
const { range } = require('lodash');
const centroid = require('@turf/centroid').default;

const { authenticate } = require('../utils/auth');
const { errorReport } = require('../utils/axiosError');
const { mapProperties } = require('../utils/mapProperties');
const { Visual, Document, Sequelize } = require('../models');

const STEP = 100;
const visual = [
  'ViewConesPoly',
  'AerialExtentsPoly',
  'PlanExtentsPoly',
  'MapExtentsPoly',
  'SurveyExtentsPoly',
];

module.exports = {
  up: async () => {
    const token = await authenticate();
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const stepLoader = (layer, i, count) =>
      axios
        .get(
          `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${layer.remoteId}/query?where=objectid%20IS%20NOT%20NULL&outFields=*&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { features } }) => {
          console.log(`${i} / ${count}`);
          const featureLoader = features.map(feature => {
            const properties = mapProperties({ properties: feature.properties, type: 'document' });
            if (!properties.longitude || !properties.latitude) {
              const point = centroid(feature.geometry);
              // eslint-disable-next-line no-param-reassign, prettier/prettier
              [properties.longitude, properties.latitude] = point.geometry.coordinates;
            }
            return {
              ...feature.properties,
              id: `'${md5(`${layer.remoteId}${process.env.ID_SECRET}${properties.objectid}`)}'`,
              VisualId: layer.id,
              geom: Sequelize.fn(
                'ST_SetSRID',
                Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
                4326
              ),
            };
          });
          return Document.bulkCreate(featureLoader, {
            updateOnDuplicate: [
              'title',
              'ssid',
              'firstyear',
              'lastyear',
              'latitude',
              'longitude',
              'heading',
              'VisualId',
              'geom',
              'updatedAt',
              'creator',
              'creditline',
              'artstor',
            ],
          });
        });

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
      }
      layer.remoteId = l.id;
      await layer.save();

      return axios
        .get(
          `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${l.id}/query?where=objectid IS NOT NULL&f=json&returnCountOnly=true&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { count } }) =>
          range(0, count, STEP).reduce(async (previousPromise, next) => {
            await previousPromise;
            return stepLoader(layer, next, count);
          }, Promise.resolve())
        )
        .catch(error => {
          console.log(`Error loading ${l.name}`);
          errorReport(error);
          return Promise.resolve();
        });
    };

    let {
      data: { layers },
    } = await axios.get(
      `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/layers?f=json&token=${token}`,
      { httpsAgent }
    );
    layers = layers.filter(l => visual.includes(l.name));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Visuals').then(() => queryInterface.bulkDelete('Documents')),
};

if (require.main === module) module.exports.up();
