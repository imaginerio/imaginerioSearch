const { omit } = require('lodash');
const { Document, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');

module.exports = router => {
  router.get(
    '/document/:id',
    asyncHandler(async (req, res) => {
      const document = await Document.findOne({
        where: {
          [Sequelize.Op.or]: [{ ssid: req.params.id }, { id: req.params.id }],
        },
        include: {
          association: 'Visual',
          attributes: ['title'],
        },
      });

      if (!document) return res.send({});

      return res.send({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              ...omit(document.dataValues, 'Visual', 'VisualId', 'geom', 'updatedAt', 'createdAt'),
              type: document.Visual.title,
            },
            geometry: document.geom,
          },
        ],
      });
    })
  );
};
