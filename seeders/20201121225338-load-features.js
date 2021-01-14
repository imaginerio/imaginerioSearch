/* eslint-disable no-console */
const axios = require('axios');
const https = require('https');
const { nanoid } = require('nanoid');
const { range } = require('lodash');

const { authenticate } = require('../utils/auth');
const { Feature, Layer } = require('../models');

const STEP = 1000;
const visual = ['PlanExtentsPoly', 'MapExtentsPoly', 'ViewConesPoly', 'SurveyExtentsPoly'];

module.exports = {
  up: async () => {
    const token = await authenticate();
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const stepLoader = (layer, i, count) =>
      axios
        .get(
          `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/imagineRio/FeatureServer/${layer.remoteId}/query?where=name%20IS%20NOT%20NULL&outFields=objectid,name,firstyear,lastyear&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { features } }) => {
          console.log(`${i} / ${count}`);
          const featureLoader = features.map(feature =>
            Feature.create({
              ...feature.properties,
              id: `i${nanoid(8)}`,
              LayerId: layer.id,
              geom: feature.geometry,
            })
          );
          return Promise.all(featureLoader);
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
        `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/imagineRio/FeatureServer/${l.id}/query?where=objectid IS NOT NULL&f=json&returnCountOnly=true&token=${token}`,
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
      `https://enterprise.spatialstudieslab.org/server/rest/services/Hosted/imagineRio/FeatureServer/layers?f=json&token=${token}`,
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
