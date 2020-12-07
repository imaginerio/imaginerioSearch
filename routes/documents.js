const { Visual, Sequelize } = require('../models');

module.exports = router => {
  router.get('/documents', (req, res) => {
    const { year } = req.query;
    if (!year) return res.sendStatus(500);
    return Visual.findAll({
      attributes: ['id', 'title'],
      include: {
        association: 'Documents',
        attributes: ['ssid', 'title', 'latitude', 'longitude', 'firstyear', 'lastyear'],
        where: {
          firstyear: {
            [Sequelize.Op.lte]: parseInt(year, 10),
          },
          lastyear: {
            [Sequelize.Op.gte]: parseInt(year, 10),
          },
        },
      },
    }).then(layers => res.send(layers.filter(l => l.Documents.length)));
  });
};
