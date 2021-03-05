/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const https = require('https');
const md5 = require('md5');
const { range } = require('lodash');

const { authenticate } = require('../utils/auth');
const { Feature, Layer, Sequelize } = require('../models');

const STEP = 500;
const visual = [
  'AerialExtentsPoly',
  'PlanExtentsPoly',
  'MapExtentsPoly',
  'ViewConesPoly',
  'SurveyExtentsPoly',
];

module.exports = {
  up: async () => {
    const token = await authenticate();
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const stepLoader = (layer, i, count) =>
      axios
        .get(
          `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${layer.remoteId}/query?where=name%20IS%20NOT%20NULL&outFields=objectid,name,firstyear,lastyear&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { features } }) => {
          console.log(`${i} / ${count}`);
          const featureLoader = features
            .filter(f => f.geometry)
            .map(feature => ({
              ...feature.properties,
              id: `'${md5(
                `${layer.remoteId}${process.env.ID_SECRET}${feature.properties.objectid}`
              )}'`,
              LayerId: layer.id,
              geom: Sequelize.fn(
                'ST_SetSRID',
                Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
                4326
              ),
            }));
          return Feature.bulkCreate(featureLoader, {
            updateOnDuplicate: ['name', 'firstyear', 'lastyear', 'geom'],
          });
        });

    const layerLoader = async l => {
      console.log(`----- Loading ${l.name} -----`);
      const layer = Layer.build({
        name: l.name,
        title: l.name.replace(/(Poly|Line)$/, '').replace(/(?!^)([A-Z])/gm, ` $1`),
        remoteId: l.id,
      });
      await layer.save();
      const {
        data: { count },
      } = await axios.get(
        `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${l.id}/query?where=objectid IS NOT NULL&f=json&returnCountOnly=true&token=${token}`,
        { httpsAgent }
      );

      return range(0, count, STEP).reduce(async (previousPromise, next) => {
        await previousPromise;
        return stepLoader(layer, next, count);
      }, Promise.resolve());
    };

    let {
      data: { layers },
    } = await axios.get(
      `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/layers?f=json&token=${token}`,
      { httpsAgent }
    );
    layers = layers.filter(l => !visual.includes(l.name));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};
