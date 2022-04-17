const { Feature, Type, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/feature/:id', (req, res) => {
    const { id } = req.params;
    const { year } = req.query;
    const lang = req.query.lang === 'pt' ? 'Pt' : 'En';

    if (!id || !year) return res.sendStatus(500);

    return Feature.findByPk(id, {
      attributes: ['id', 'name', 'geom'],
      include: {
        model: Type,
        attributes: [[`title${lang}`, 'title']],
      },
    }).then(feature => {
      if (!feature) return res.sendStatus(404);

      return Feature.findOne({
        attributes: [[Sequelize.fn('ST_Collect', Sequelize.col('geom')), 'geom']],
        group: ['name'],
        where: {
          [Sequelize.Op.and]: [
            { name: feature.name },
            {
              firstyear: {
                [Sequelize.Op.lte]: parseInt(year, 10),
              },
            },
            {
              lastyear: {
                [Sequelize.Op.gte]: parseInt(year, 10),
              },
            },
            Sequelize.where(
              Sequelize.fn(
                'ST_Intersects',
                Sequelize.fn(
                  'ST_Transform',
                  Sequelize.fn(
                    'ST_Buffer',
                    Sequelize.fn(
                      'ST_Transform',
                      Sequelize.fn(
                        'ST_SetSRID',
                        Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(feature.geom)),
                        4326
                      ),
                      3857
                    ),
                    500
                  ),
                  4326
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
            type: feature.Type.dataValues.title,
          },
        })
      );
    });
  });
};
