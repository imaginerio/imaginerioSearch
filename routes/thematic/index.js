const d3Scale = require('d3-scale');
const d3Array = require('d3-array');
const { omit, sortBy } = require('lodash');
const { z } = require('zod');

const { ThematicLayer, Sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../utils/validate');

const yearOnlySchema = z.object({
  query: z.object({
    year: z.coerce.number().int().optional(),
  }),
});

const yearWithIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  query: z.object({
    year: z.coerce.number().int().optional(),
  }),
});

const yearWhere = year =>
  year
    ? {
        firstyear: { [Sequelize.Op.lte]: year },
        lastyear: { [Sequelize.Op.gte]: year },
      }
    : {};

module.exports = router => {
  router.get(
    '/thematic',
    validate(yearOnlySchema),
    asyncHandler(async (req, res) => {
      const layers = await ThematicLayer.findAll({
        attributes: ['id', 'title', 'colors'],
        include: {
          association: 'ThematicValues',
          attributes: ['number'],
          required: true,
          where: yearWhere(req.query.year),
        },
      });

      res.send(
        layers.map(layer => {
          const values = layer.ThematicValues.map(v => v.number).filter(v => v !== -999);
          const scale = d3Scale
            .scaleQuantize()
            .domain(d3Array.extent(values))
            .range([0, 1, 2, 3])
            .nice()
            .thresholds();
          return {
            ...omit(layer.dataValues, 'ThematicValues'),
            scale,
          };
        })
      );
    })
  );

  router.get(
    '/thematic/:id',
    validate(yearWithIdSchema),
    asyncHandler(async (req, res) => {
      const layer = await ThematicLayer.findByPk(req.params.id, {
        include: {
          association: 'ThematicValues',
          attributes: ['id', 'number'],
          where: yearWhere(req.query.year),
          include: {
            association: 'ThematicFeature',
            attributes: ['name', 'geom'],
          },
        },
      });

      if (!layer) return res.sendStatus(404);

      return res.send({
        type: 'FeatureCollection',
        features: sortBy(layer.ThematicValues, t => t.ThematicFeature.name).map(val => ({
          type: 'Feature',
          id: val.id,
          properties: {
            value: val.number,
            name: val.ThematicFeature.name,
          },
          geometry: val.ThematicFeature.geom,
        })),
      });
    })
  );
};
