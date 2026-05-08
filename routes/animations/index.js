const { omit } = require('lodash');
const { z } = require('zod');
const { Animation, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const animationsSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().optional(),
  }),
});

module.exports = router => {
  router.get(
    '/animations',
    validate(animationsSchema),
    asyncHandler(async (req, res) => {
      const { year } = req.query;
      const where = year
        ? {
            firstyear: { [Sequelize.Op.lte]: year },
            lastyear: { [Sequelize.Op.gte]: year },
          }
        : {};

      const animations = await Animation.findAll({
        where,
        attributes: ['id', 'name', 'title', 'url', 'minzoom', 'maxzoom'],
        include: {
          association: 'AnimationFrames',
          attributes: ['label', 'directory', 'ordering'],
        },
      });

      res.send(
        animations.map(an => ({
          ...omit(an.dataValues, 'AnimationFrames'),
          frames: an.AnimationFrames.sort((a, b) => a.ordering - b.ordering).map(fr =>
            omit(fr.dataValues, 'ordering')
          ),
        }))
      );
    })
  );
};
