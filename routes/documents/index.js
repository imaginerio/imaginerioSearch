const { omit } = require('lodash');
const { Visual, Sequelize } = require('../../models');

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
        attributes: ['ssid', 'title', 'latitude', 'longitude', 'firstyear', 'lastyear'],
        where,
        include: {
          association: 'ImageMeta',
          attributes: ['label', 'value', 'link'],
        },
      },
    }).then(layers => {
      const response = layers
        .filter(l => l.Documents.length)
        .map(l => ({
          ...l.dataValues,
          Documents: l.Documents.map(d => {
            const document = omit(d.dataValues, 'ImageMeta');
            d.ImageMeta.forEach(meta => {
              const parsedMeta = {
                value: meta.value.length > 1 ? meta.value : meta.value[0],
                link: !meta.link || meta.link.length > 1 ? meta.link : meta.link[0],
              };
              document[meta.label.toLowerCase()] = meta.link ? parsedMeta : parsedMeta.value;
            });
            return document;
          }),
        }));
      return res.send(response);
    });
  });
};
