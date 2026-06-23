const { uniqBy, sortBy } = require('lodash');
const { z } = require('zod');
const { Layer, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const searchSchema = z.object({
  query: z.object({
    text: z.string().min(1, 'text is required'),
    year: z.coerce.number().int(),
    lang: z.enum(['en', 'pt']).optional(),
  }),
});

module.exports = router => {
  router.get(
    '/search',
    validate(searchSchema),
    asyncHandler(async (req, res) => {
      const { text, year } = req.query;
      const lang = req.query.lang === 'pt' ? 'Pt' : 'En';

      const result = await Layer.findAll({
        attributes: ['id', [`title${lang}`, 'title']],
        include: {
          association: 'Features',
          attributes: ['id', 'name', 'firstyear', 'lastyear', 'creator'],
          where: {
            firstyear: { [Sequelize.Op.lte]: year },
            lastyear: { [Sequelize.Op.gte]: year },
            [Sequelize.Op.or]: [
              Sequelize.where(Sequelize.fn('unaccent', Sequelize.col('Features.name')), {
                [Sequelize.Op.iLike]: `%${text}%`,
              }),
              Sequelize.where(Sequelize.fn('unaccent', Sequelize.col('namealt')), {
                [Sequelize.Op.iLike]: `%${text}%`,
              }),
              Sequelize.where(Sequelize.fn('unaccent', Sequelize.col('creator')), {
                [Sequelize.Op.iLike]: `%${text}%`,
              }),
            ],
          },
        },
      });

      const layers = result
        .filter(l => l.Features.length)
        .map(({ dataValues }) => ({
          ...dataValues,
          Features: sortBy(
            uniqBy(dataValues.Features, f => f.name),
            'name'
          ),
        }));

      res.send(layers);
    })
  );
};
