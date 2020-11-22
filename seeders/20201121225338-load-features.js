const axios = require('axios');
const { nanoid } = require('nanoid');
const { Feature, Layer } = require('../models');

module.exports = {
  up: async () => {
    let {
      data: { layers },
    } = await axios.get(
      'https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/layers?f=json'
    );
    layers = layers.filter(l => !l.name.match(/^ir_rio/));
    return Promise.all(
      layers.map(l =>
        Layer.create({ title: l.name, remoteId: l.id }).then(layer =>
          axios
            .get(
              `https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/${layer.remoteId}/query?where=name IS NOT NULL&outFields=objectid,name,firstyear,lastyear&f=geojson`
            )
            .then(({ data: { features } }) => {
              const featureLoader = features.map(feature =>
                Feature.create({
                  ...feature.properties,
                  id: `i${nanoid(8)}`,
                  LayerId: layer.id,
                  geom: feature.geometry,
                })
              );
              return Promise.all(featureLoader);
            })
        )
      )
    );
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};
