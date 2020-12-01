/* eslint-disable no-console */
const axios = require('axios');
const { nanoid } = require('nanoid');
const { range } = require('lodash');
const { Feature, Layer } = require('../models');

const STEP = 1000;

module.exports = {
  up: async () => {
    const stepLoader = (layer, i, count) =>
      axios
        .get(
          `https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/${layer.remoteId}/query?where=name IS NOT NULL&outFields=objectid,name,firstyear,lastyear&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}`
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
        title: l.name,
        remoteId: l.id,
      });
      await layer.save();
      const {
        data: { count },
      } = await axios.get(
        `https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/${l.id}/query?where=objectid IS NOT NULL&f=json&returnCountOnly=true`
      );

      return range(0, count, STEP).reduce(async (previousPromise, next) => {
        await previousPromise;
        return stepLoader(layer, next, count);
      }, Promise.resolve());
    };

    let {
      data: { layers },
    } = await axios.get(
      'https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/layers?f=json'
    );
    layers = layers.filter(l => !l.name.match(/^ir_rio/));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};
