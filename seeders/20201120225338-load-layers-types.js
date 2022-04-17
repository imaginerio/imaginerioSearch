/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { parse } = require('csv-parse');
const { groupBy } = require('lodash');

const { Layer, Type } = require('../models');

const parseAsync = promisify(parse);

module.exports = {
  up: async () => {
    if (!process.env.NAMES_CSV) return false;
    const csvText = await fs.promises.readFile(
      path.join('./config', process.env.NAMES_CSV),
      'utf-8'
    );
    const typesData = await parseAsync(csvText, { columns: true });
    const layerGroups = groupBy(typesData, 'GIS Feature Class');
    return Promise.all(
      Object.keys(layerGroups).map(name => {
        const types = layerGroups[name];
        return Layer.upsert({
          name,
          titleEn: types[0]['Map Legend Layer Name (English)'],
          titlePt: types[0]['Map Legend Layer Name (Portuguese)'],
        }).then(layer =>
          Promise.all(
            types.map(type =>
              Type.upsert({
                key: type['Type Name (English)'].toLowerCase().replace(/\W/gi, '-'),
                titleEn: type['Type Name (English)'],
                titlePt: type['Type Name (Portuguese)'],
                LayerId: layer[0].id,
              })
            )
          )
        );
      })
    );
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('Types');
    await queryInterface.bulkDelete('Layers');
  },
};

if (require.main === module) module.exports.up();
