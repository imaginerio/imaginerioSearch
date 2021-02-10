const { Document, Sequelize } = require('../models');

module.exports = router => {
  router.get('/document/:id', (req, res) =>
    Document.findOne({
      attributes: ['geom'],
      where: {
        [Sequelize.Op.or]: [{ ssid: req.params.id }, { id: req.params.id }],
      },
    }).then(document =>
      res.send({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: document.geom,
          },
        ],
      })
    )
  );
};
