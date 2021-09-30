const d3Scale = require('d3-scale');
const d3Array = require('d3-array');
const colorbrewer = require('colorbrewer');
const { omit } = require('lodash');

const { ThematicLayer, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/thematic', async (req, res) => {
    const { year } = req.query;
    let where = {};
    if (year) {
      where = {
        firstyear: {
          [Sequelize.Op.lte]: parseInt(year, 10),
        },
        lastyear: {
          [Sequelize.Op.gte]: parseInt(year, 10),
        },
      };
    }
    let layers = await ThematicLayer.findAll({
      attributes: ['id', 'title'],
      include: {
        association: 'ThematicValues',
        attributes: ['number'],
        required: true,
        where,
      },
    });

    layers = layers.map(layer => {
      const values = layer.ThematicValues.map(v => v.number).filter(v => v !== -999);
      const scale = d3Scale
        .scaleQuantize()
        .domain(d3Array.extent(values))
        .range([0, 1, 2, 3])
        .nice()
        .thresholds();

      const { sequential } = colorbrewer.schemeGroups;
      const colors = colorbrewer[sequential[Math.floor(Math.random() * sequential.length)]][4];

      return {
        ...omit(layer.dataValues, 'ThematicValues'),
        scale,
        colors,
      };
    });
    res.send(layers);
  });
};
