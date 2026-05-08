const { omit } = require('lodash');
const { z } = require('zod');
const { Visual, Sequelize } = require('../../models');
const { attachImageMeta } = require('../../utils/attachImageMeta');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const documentsSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().optional(),
    visual: z.string().optional(),
  }),
});

module.exports = router => {
  router.get(
    '/documents',
    validate(documentsSchema),
    asyncHandler(async (req, res) => {
      const { year, visual } = req.query;
      const where = year
        ? {
            firstyear: { [Sequelize.Op.lte]: year },
            lastyear: { [Sequelize.Op.gte]: year },
          }
        : {};
      const visualWhere = visual ? { title: { [Sequelize.Op.iLike]: visual } } : {};

      const layers = await Visual.findAll({
        attributes: ['id', 'title'],
        where: visualWhere,
        include: {
          association: 'Documents',
          attributes: [
            'ssid',
            'title',
            'latitude',
            'longitude',
            'firstyear',
            'lastyear',
            'thumbnail',
          ],
          where,
          include: {
            association: 'ImageMeta',
            attributes: [['key', 'label'], 'value', 'link'],
          },
        },
      });

      const response = layers
        .filter(l => l.Documents.length)
        .map(l => ({
          ...l.dataValues,
          Documents: l.Documents.map(d => ({
            ...omit(d.dataValues, 'ImageMeta'),
            ...attachImageMeta(d.ImageMeta),
          })),
        }));

      res.send(response);
    })
  );
};
