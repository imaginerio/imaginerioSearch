const { z } = require('zod');
const { Feature, Type, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const featureSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({
    year: z.coerce.number().int(),
    lang: z.enum(['en', 'pt']).optional(),
  }),
});

module.exports = router => {
  router.get(
    '/feature/:id',
    validate(featureSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { year } = req.query;
      const lang = req.query.lang === 'pt' ? 'Pt' : 'En';

      const feature = await Feature.findByPk(id, {
        attributes: ['id', 'name', 'geom'],
        include: {
          model: Type,
          attributes: [[`title${lang}`, 'title']],
        },
      });

      if (!feature) return res.sendStatus(404);

      const geometry = await Feature.findOne({
        attributes: [[Sequelize.fn('ST_Collect', Sequelize.col('geom')), 'geom']],
        group: ['name'],
        where: {
          [Sequelize.Op.and]: [
            { name: feature.name },
            { firstyear: { [Sequelize.Op.lte]: year } },
            { lastyear: { [Sequelize.Op.gte]: year } },
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
      });

      return res.send({
        type: 'Feature',
        geometry: geometry.geom,
        properties: {
          id: feature.id,
          name: feature.name,
          type: feature.Type?.dataValues.title,
        },
      });
    })
  );
};
