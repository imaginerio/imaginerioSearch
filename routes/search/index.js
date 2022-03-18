const { uniqBy, sortBy } = require('lodash');
const { Layer, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/search', (req, res) => {
    const { text, year } = req.query;
    if (!text || !year) return res.sendStatus(500);
    return Layer.findAll({
      attributes: ['id', 'title'],
      include: {
        association: 'Features',
        attributes: ['id', 'name', 'firstyear', 'lastyear', 'creator'],
        where: {
          firstyear: {
            [Sequelize.Op.lte]: parseInt(year, 10),
          },
          lastyear: {
            [Sequelize.Op.gte]: parseInt(year, 10),
          },
          [Sequelize.Op.or]: [
            Sequelize.where(Sequelize.fn('unaccent', Sequelize.col('Features.name')), {
              [Sequelize.Op.iLike]: `%${text}%`,
            }),
            Sequelize.where(Sequelize.fn('unaccent', Sequelize.col('namealt')), {
              [Sequelize.Op.iLike]: `%${text}%`,
            }),
            Sequelize.where(Sequelize.fn('unaccent', Sequelize.col('creator')), {
              [Sequelize.Op.iLike]: `%${text}%`,
            }),
          ],
        },
      },
    }).then(result => {
      let layers = result.filter(l => l.Features.length);
      layers = layers.map(({ dataValues }) => ({
        ...dataValues,
        Features: sortBy(
          uniqBy(dataValues.Features, f => f.name),
          'name'
        ),
      }));
      return res.send(layers);
    });
  });
};
