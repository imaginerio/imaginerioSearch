const { omit } = require('lodash');
const { Document, Sequelize } = require('../../models');
const { attachImageMeta } = require('../../utils/attachImageMeta');

module.exports = router => {
  router.get('/document/:id', (req, res) =>
    Document.findOne({
      where: {
        [Sequelize.Op.or]: [{ ssid: req.params.id }, { id: req.params.id }],
      },
      include: [
        {
          association: 'Visual',
          attributes: ['title'],
        },
        {
          association: 'ImageMeta',
          attributes: ['label', 'value', 'link'],
        },
      ],
    }).then(document =>
      res.send({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              ...omit(
                document.dataValues,
                'Visual',
                'VisualId',
                'geom',
                'updatedAt',
                'updatedAt',
                'ImageMeta'
              ),
              ...attachImageMeta(document.ImageMeta),
              type: document.Visual.title,
            },
            geometry: document.geom,
          },
        ],
      })
    )
  );
};
