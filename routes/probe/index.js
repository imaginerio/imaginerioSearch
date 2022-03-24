const { omit } = require('lodash');
const { Layer, Visual, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/probe/:type/:location', async (req, res) => {
    const { year } = req.query;
    const { type } = req.params;
    const location = req.params.location.split(',');
    if (location.length !== 2 && location.length !== 4 && !year) return res.sendStatus(500);
    if (type !== 'features' && type !== 'views') return res.sendStatus(500);

    let geom = Sequelize.fn(
      'ST_Transform',
      Sequelize.fn(
        'ST_Buffer',
        Sequelize.fn(
          'ST_Transform',
          Sequelize.fn('ST_SetSRID', Sequelize.fn('ST_MakePoint', ...location), 4326),
          3857
        ),
        100
      ),
      4326
    );
    if (location.length === 4) geom = Sequelize.fn('ST_MakeEnvelope', ...location, 4326);

    const query = {
      firstyear: {
        [Sequelize.Op.lte]: parseInt(year, 10),
      },
      lastyear: {
        [Sequelize.Op.gte]: parseInt(year, 10),
      },
      [Sequelize.Op.and]: Sequelize.where(
        Sequelize.fn('ST_Intersects', Sequelize.col('geom'), geom),
        true
      ),
    };

    let layers = [];
    if (type === 'features') {
      layers = await Layer.findAll({
        attributes: ['id', 'title'],
        include: {
          association: 'Features',
          attributes: ['id', 'name', 'firstyear', 'lastyear', 'creator'],
          where: query,
        },
      });
    } else if (type === 'views') {
      layers = await Visual.findAll({
        where: { title: 'Views' },
        attributes: ['id', 'title'],
        include: {
          association: 'Documents',
          attributes: ['id', 'title', 'ssid', 'thumbnail', 'firstyear', 'lastyear', 'creator'],
          where: query,
        },
      });
      layers = layers.map(layer => ({
        ...omit(layer.dataValues, ['Documents']),
        Features: layer.Documents,
      }));
    }
    return res.send(layers.filter(l => l.Features.length));
  });
};
