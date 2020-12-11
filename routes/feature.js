const { Feature } = require('../models');

module.exports = router => {
  router.get('/feature/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.sendStatus(500);
    return Feature.findByPk(id, { attributes: ['id', 'name', 'geom'] }).then(geometry =>
      res.send({
        type: 'Feature',
        geometry: geometry.geom,
        properties: {
          id: geometry.id,
          name: geometry.name,
        },
      })
    );
  });
};
