const { Layer, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/probe/:location', (req, res) => {
    const { year } = req.query;
    const location = req.params.location.split(',');
    if (location.length !== 2 || location.length !== 4 || !year) return res.sendStatus(500);
    let geom = Sequelize.fn('ST_SetSRID', Sequelize.fn('ST_MakePoint', ...location), 4326);
    if (location.length === 4) geom = Sequelize.fn('ST_MakeEnvelope', ...location, 4326);
    return Layer.findAll({
      attributes: ['id', 'title'],
      include: {
        association: 'Features',
        attributes: ['id', 'name'],
        where: {
          firstyear: {
            [Sequelize.Op.lte]: parseInt(year, 10),
          },
          lastyear: {
            [Sequelize.Op.gte]: parseInt(year, 10),
          },
          geom: {
            [Sequelize.Op.overlap]: geom,
          },
        },
        limit: 5,
      },
    }).then(layers => res.send(layers.filter(l => l.Features.length)));
  });
};
