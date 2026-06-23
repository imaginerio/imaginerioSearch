const { omit } = require('lodash');
const { z } = require('zod');
const { Layer, Visual, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const probeSchema = z.object({
  params: z.object({
    type: z.enum(['features', 'views']),
    location: z
      .string()
      .refine(s => [2, 4].includes(s.split(',').length), 'location must have 2 or 4 coords')
      .refine(s => s.split(',').every(n => Number.isFinite(Number(n))), 'coords must be numbers'),
  }),
  query: z.object({
    year: z.coerce.number().int(),
    lang: z.enum(['en', 'pt']).optional(),
  }),
});

module.exports = router => {
  router.get(
    '/probe/:type/:location',
    validate(probeSchema),
    asyncHandler(async (req, res) => {
      const { year } = req.query;
      const { type } = req.params;
      const location = req.params.location.split(',').map(Number);
      const lang = req.query.lang === 'pt' ? 'Pt' : 'En';

      let geom = Sequelize.fn(
        'ST_Transform',
        Sequelize.fn(
          'ST_Buffer',
          Sequelize.fn(
            'ST_Transform',
            Sequelize.fn('ST_SetSRID', Sequelize.fn('ST_MakePoint', ...location), 4326),
            3857
          ),
          50
        ),
        4326
      );
      if (location.length === 4) geom = Sequelize.fn('ST_MakeEnvelope', ...location, 4326);

      const query = {
        firstyear: { [Sequelize.Op.lte]: year },
        lastyear: { [Sequelize.Op.gte]: year },
        [Sequelize.Op.and]: Sequelize.where(
          Sequelize.fn('ST_Intersects', Sequelize.col('geom'), geom),
          true
        ),
      };

      let layers = [];
      if (type === 'features') {
        layers = await Layer.findAll({
          attributes: ['id', [`title${lang}`, 'title']],
          include: {
            association: 'Features',
            attributes: ['id', 'name', 'firstyear', 'lastyear', 'creator'],
            where: query,
          },
        });
      } else {
        const visuals = await Visual.findAll({
          where: { title: 'Views' },
          attributes: ['id', 'title'],
          include: {
            association: 'Documents',
            attributes: ['id', 'title', 'ssid', 'thumbnail', 'firstyear', 'lastyear', 'creator'],
            where: query,
          },
        });
        layers = visuals.map(layer => ({
          ...omit(layer.dataValues, ['Documents']),
          Features: layer.Documents,
        }));
      }
      res.send(layers.filter(l => l.Features.length));
    })
  );
};
