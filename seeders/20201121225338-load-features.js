const axios = require('axios');
const { Feature, Layer } = require('../models');

module.exports = {
  up: async () => {
    let {
      data: { layers },
    } = await axios.get(
      'https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/layers?f=json',
    );
    layers = layers.filter((l) => !l.name.match(/^ir_rio/));
    return Promise.all(
      layers.map((l) => Layer.create({ title: l.name, remoteId: l.id })
        .then((layer) => axios
          .get(
            `https://arcgis.rice.edu/arcgis/rest/services/imagineRio_Data/FeatureServer/${layer.remoteId}/query?where=name IS NOT NULL&outFields=objectid,name,firstyear,lastyear&f=geojson`,
          )
          .then(({ data: { features } }) => Feature.bulkCreate(
            features.map((feature) => {
              const props = {
                ...feature.properties,
                LayerId: layer.id,
                geom: feature.geometry,
              };
              return props;
            }),
          )))),
    );
  },

  down: async (queryInterface) => queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};
