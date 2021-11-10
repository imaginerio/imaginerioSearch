const { omit } = require('lodash');
const { Visual, Sequelize } = require('../../models');
const { attachImageMeta } = require('../../utils/attachImageMeta');

module.exports = router => {
  router.get('/documents', (req, res) => {
    const { year, visual } = req.query;
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

    let visualWhere = {};
    if (visual) {
      visualWhere = {
        title: {
          [Sequelize.Op.iLike]: visual,
        },
      };
    }

    return Visual.findAll({
      attributes: ['id', 'title'],
      where: visualWhere,
      include: {
        association: 'Documents',
        attributes: [
          'ssid',
          'title',
          'latitude',
          'longitude',
          'firstyear',
          'lastyear',
          'thumbnail',
        ],
        where,
        include: {
          association: 'ImageMeta',
          attributes: [['key', 'label'], 'value', 'link'],
        },
      },
    }).then(layers => {
      const response = layers
        .filter(l => l.Documents.length)
        .map(l => ({
          ...l.dataValues,
          Documents: l.Documents.map(d => ({
            ...omit(d.dataValues, 'ImageMeta'),
            ...attachImageMeta(d.ImageMeta),
          })),
        }));
      return res.send(response);
    });
  });
};
