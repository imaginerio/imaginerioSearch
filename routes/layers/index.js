const { Folder, Layer, Type, Feature, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/layers', (req, res) => {
    const { year } = req.query;
    const lang = req.query.lang === 'pt' ? 'Pt' : 'En';
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
        attributes: ['id', 'name', [`title${lang}`, 'title']],
      },
    }).then(folders =>
      Type.findAll({
        attributes: ['LayerId', [`title${lang}`, 'title'], ['titleEn', 'name']],
        order: ['LayerId', `title${lang}`],
        include: {
          model: Feature,
          where,
          required: true,
        },
      }).then(types => {
        const result = folders
          .map(f => ({
            id: f.dataValues.id,
            name: f.dataValues.name,
            layers: f.Layers.map(l => ({
              ...l.dataValues,
              types: types
                .filter(t => t.LayerId === l.id)
                .map(t => ({
                  title: t.dataValues.title,
                  name: t.dataValues.name,
                }))
                .filter(t => t),
            })).filter(l => l.types && l.types.length),
          }))
          .filter(f => f.layers && f.layers.length);
        res.send(result);
      })
    );
  });
};
