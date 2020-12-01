/* eslint-disable no-console */
const axios = require('axios');
const { nanoid } = require('nanoid');
const { range } = require('lodash');
const { Visual, Document } = require('../models');

const STEP = 1000;

module.exports = {
  up: async () => {
    const stepLoader = (layer, i, count) =>
      axios
        .get(
          `https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/${layer.remoteId}/query?where=objectid%20IS%20NOT%20NULL&outFields=objectid,firstyear,lastyear,notes,latitude,longitude&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}`
        )
        .then(({ data: { features } }) => {
          console.log(`${i} / ${count}`);
          const featureLoader = features.map(feature =>
            Document.create({
              ...feature.properties,
              id: `i${nanoid(8)}`,
              VisualId: layer.id,
              ssid: `SSID${feature.properties.notes}`,
              geom: feature.geometry,
            })
          );
          return Promise.all(featureLoader);
        });

    const layerLoader = async l => {
      console.log(`----- Loading ${l.name} -----`);
      const layer = Visual.build({
        name: l.name.replace(/.*\./gm, ''),
        title: l.name
          .replace(/.*\./gm, '')
          .replace(/(Poly|Line)$/, '')
          .replace(/(?!^)([A-Z])/gm, ` $1`),
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
    layers = layers.filter(l => l.name.match(/^ir_rio/));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Visuals').then(() => queryInterface.bulkDelete('Documents')),
};
