const { Document, Sequelize } = require('../models');

module.exports = router => {
  router.get('/document/:id', (req, res) =>
    Document.findOne({
      attributes: ['title', 'geom'],
      where: {
        [Sequelize.Op.or]: [{ ssid: req.params.id }, { id: req.params.id }],
      },
      include: {
        association: 'Visual',
        attributes: ['title'],
      },
    }).then(document =>
      res.send({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              title: document.title,
              type: document.Visual.title,
            },
            geometry: document.geom,
          },
        ],
      })
    )
  );
};
