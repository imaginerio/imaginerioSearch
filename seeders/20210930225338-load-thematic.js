/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const https = require('https');
const { range } = require('lodash');

const { authenticate } = require('../utils/auth');
const { errorReport } = require('../utils/axiosError');
const { ThematicFeature, ThematicLayer, ThematicValue, Sequelize } = require('../models');
const config = require('../config/thematic');

const STEP = 500;
const thematicLayers = config[process.env.MAPPING];

module.exports = {
  up: async () => {
    const token = await authenticate();
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const stepLoader = (layers, i, count) =>
      axios
        .get(
          `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${layers[0].remoteId}/query?where=objectid%20IS%20NOT%20NULL&outFields=*&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { features } }) => {
          console.log(`${i} / ${count}`);
          return Promise.all(
            features.map(feature =>
              ThematicFeature.create({
                name: feature.properties[thematicLayers[layers[0].name].name],
                geom: Sequelize.fn(
                  'ST_SetSRID',
                  Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
                  4326
                ),
              }).then(thematicFeature =>
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
        })
        .catch(error => {
          console.log(`Error loading ${layers[0].name}`);
          errorReport(error);
        });

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
          }))
        );
      }
      return axios
        .get(
          `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${l.id}/query?where=objectid IS NOT NULL&f=json&returnCountOnly=true&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { count } }) => {
          console.log(count);
          return range(0, count, STEP).reduce(async (previousPromise, next) => {
            await previousPromise;
            return stepLoader(layers, next, count);
          }, Promise.resolve());
        })
        .catch(error => {
          console.log(`Error loading ${l.name}`);
          errorReport(error);
          return Promise.resolve();
        });
    };

    if (!thematicLayers || !Object.keys(thematicLayers).length) return Promise.resolve();

    let {
      data: { layers },
    } = await axios.get(
      `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/layers?f=json&token=${token}`,
      { httpsAgent }
    );
    console.log(Object.keys(thematicLayers));
    layers = layers.filter(l => Object.keys(thematicLayers).includes(l.name));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};

if (require.main === module) module.exports.up();
