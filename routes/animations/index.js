const { omit } = require('lodash');
const { Animation, Sequelize } = require('../../models');

module.exports = router => {
  router.get('/animations', async (req, res) => {
    const { year } = req.query;
    let where = {};
    if (year) {
      where = {
        firstyear: {
          [Sequelize.Op.lte]: parseInt(year, 10),
        },
        lastyear: {
          [Sequelize.Op.gte]: parseInt(year, 10),
        },
      };
    }
    let animations = await Animation.findAll({
      where,
      attributes: ['id', 'name', 'title', 'url', 'minzoom', 'maxzoom'],
      include: {
        association: 'AnimationFrames',
        attributes: ['label', 'directory', 'ordering'],
      },
    });

    animations = animations.map(an => ({
      ...omit(an.dataValues, 'AnimationFrames'),
      frames: an.AnimationFrames.sort((a, b) => a.ordering - b.ordering).map(fr =>
        omit(fr.dataValues, 'ordering')
      ),
    }));

    res.send(animations);
  });
};
