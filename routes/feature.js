const { Feature, Sequelize } = require('../models');

module.exports = router => {
  router.get('/feature/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.sendStatus(500);
    return Feature.findByPk(id, { attributes: ['id', 'name', 'geom'] }).then(feature =>
      Feature.findOne({
        attributes: [[Sequelize.fn('ST_Collect', Sequelize.col('geom')), 'geom']],
        group: ['name'],
        where: {
          [Sequelize.Op.and]: [
            { name: feature.name },
            Sequelize.where(
              Sequelize.fn(
                'ST_Intersects',
                Sequelize.fn(
                  'ST_Buffer',
                  Sequelize.fn(
                    'ST_SetSRID',
                    Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geom)),
                    4326
                  ),
                  0.001
                ),
                Sequelize.col('geom')
              ),
              true
            ),
          ],
        },
      }).then(geometry =>
        res.send({
          type: 'Feature',
          geometry: geometry.geom,
          properties: {
            id: feature.id,
            name: feature.name,
          },
        })
      )
    );
  });
};
