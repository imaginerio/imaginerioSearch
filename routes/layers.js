const { Layer, Feature, Sequelize } = require('../models');

module.exports = router => {
  router.get('/layers', (req, res) => {
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

    return Layer.findAll({
      where,
      attributes: ['id', 'name', 'title'],
    }).then(layers =>
      Feature.findAll({
        where,
        attributes: ['LayerId', 'type'],
        group: ['LayerId', 'type'],
        order: ['LayerId', 'type'],
      }).then(types => {
        const result = layers.map(l => ({
          ...l.dataValues,
          types: types.filter(t => t.LayerId === l.id).map(t => t.type),
        }));
        res.send(result);
      })
    );
  });
};
