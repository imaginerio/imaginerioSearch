const { z } = require('zod');
const { Folder, Layer, Type, Feature, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const layersSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().optional(),
    lang: z.enum(['en', 'pt']).optional(),
  }),
});

module.exports = router => {
  router.get(
    '/layers',
    validate(layersSchema),
    asyncHandler(async (req, res) => {
      const { year } = req.query;
      const lang = req.query.lang === 'pt' ? 'Pt' : 'En';
      const where = year
        ? {
            firstyear: { [Sequelize.Op.lte]: year },
            lastyear: { [Sequelize.Op.gte]: year },
          }
        : {};

      const folders = await Folder.findAll({
        include: {
          model: Layer,
          attributes: ['id', 'name', [`title${lang}`, 'title']],
        },
      });

      const types = await Type.findAll({
        attributes: ['id', 'LayerId', [`title${lang}`, 'title'], ['titleEn', 'name']],
        order: ['LayerId', `title${lang}`],
        include: {
          model: Feature,
          where,
          required: true,
          // The join only tests that the type has a feature in range -- no
          // feature data reaches the response. Selecting no columns stops
          // Sequelize hydrating every matching row, including its `geom`
          // polygon, just to discard it below. That hydration grew with the
          // dataset until it could exhaust the heap on busy years.
          attributes: [],
        },
      });

      const result = folders
        .map(f => ({
          id: f.dataValues.id,
          name: f.dataValues.name,
          layers: f.Layers.map(l => ({
            ...l.dataValues,
            types: types
              .filter(t => t.LayerId === l.id)
              .map(t => ({
                title: t.dataValues.title,
                name: t.dataValues.name,
              }))
              .filter(t => t),
          })).filter(l => l.types && l.types.length),
        }))
        .filter(f => f.layers && f.layers.length);

      res.send(result);
    })
  );
};
