const { Folder, Layer, Feature, Sequelize } = require('../../models');

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

    return Folder.findAll({
      include: {
        model: Layer,
        attributes: ['id', 'name', 'title'],
      },
    }).then(folders =>
      Feature.findAll({
        where,
        attributes: ['LayerId', 'type'],
        group: ['LayerId', 'type'],
        order: ['LayerId', 'type'],
      }).then(types => {
        const result = folders
          .map(f => ({
            id: f.dataValues.id,
            name: f.dataValues.name,
            layers: f.Layers.map(l => ({
              ...l.dataValues,
              types: types
                .filter(t => t.LayerId === l.id)
                .map(t => t.type)
                .filter(t => t),
            })).filter(l => l.types && l.types.length),
          }))
          .filter(f => f.layers && f.layers.length);
        res.send(result);
      })
    );
  });
};
