/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const https = require('https');
const uuid = require('uuid').v4;
const { range, uniq } = require('lodash');

const { authenticate } = require('../utils/auth');
const { errorReport } = require('../utils/axiosError');
const { mapProperties } = require('../utils/mapProperties');
const { Feature, Layer, Type, Sequelize } = require('../models');

const STEP = 500;
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

module.exports = {
  up: async () => {
    const token = await authenticate();
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const stepLoader = (layer, i, count) =>
      axios
        .get(
          `https://gis.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${layer.remoteId}/query?where=name%20IS%20NOT%20NULL&outFields=*&f=geojson&resultRecordCount=${STEP}&resultOffset=${i}&token=${token}`,
          { httpsAgent }
        )
        .then(async ({ data: { features } }) => {
          console.log(`${i} / ${count}`);
          const validFeatures = features
            ? features.filter(f => f.geometry && f.properties.name.trim())
            : [];

          const typeLoader = uniq(validFeatures.map(f => f.properties.type)).map(t => ({
            key: t.toLowerCase().replace(/\W/gi, '-'),
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
            TypeId: types.find(
              t => t.key === feature.properties.type.toLowerCase().replace(/\W/gi, '-')
            )?.dataValues.id,
            geom: Sequelize.fn(
              'ST_SetSRID',
              Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geometry)),
              4326
            ),
          }));
          return Feature.bulkCreate(featureLoader);
        })
        .catch(error => {
          console.log(`Error loading ${layer.name}`);
          errorReport(error);
        });

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
        await layer.update({
          remoteId: l.id,
        });
        await Feature.update(
          {
            updated: true,
          },
          {
            where: {
              LayerId: layer.id,
            },
          }
        );
      }
      return axios
        .get(
          `https://gis.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/${l.id}/query?where=objectid IS NOT NULL&f=json&returnCountOnly=true&token=${token}`,
          { httpsAgent }
        )
        .then(({ data: { count } }) =>
          range(0, count, STEP)
            .reduce(async (previousPromise, next) => {
              await previousPromise;
              return stepLoader(layer, next, count);
            }, Promise.resolve())
            .then(() => {
              console.log('Deleting superceded features');
              return Feature.destroy({
                where: {
                  LayerId: layer.id,
                  updated: true,
                },
              });
            })
            .catch(() => {
              console.log('Deleting new features');
              return Feature.destroy({
                where: {
                  LayerId: layer.id,
                  updated: {
                    [Sequelize.Op.ne]: true,
                  },
                },
              }).then(() =>
                Feature.update(
                  {
                    updated: true,
                  },
                  {
                    where: {
                      VisualId: layer.id,
                    },
                  }
                )
              );
            })
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
      `https://gis.spatialstudieslab.org/server/rest/services/Hosted/${process.env.DATABASE}/FeatureServer/layers?f=json&token=${token}`,
      { httpsAgent }
    );
    layers = layers.filter(l => !visual.includes(l.name) && !OMIT.includes(l.name));
    return layers.reduce(async (previousPromise, next) => {
      await previousPromise;
      return layerLoader(next);
    }, Promise.resolve());
  },

  down: async queryInterface =>
    queryInterface.bulkDelete('Features').then(() => queryInterface.bulkDelete('Layers')),
};

if (require.main === module) module.exports.up();
