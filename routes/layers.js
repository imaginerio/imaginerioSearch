const { Layer } = require('../models');

module.exports = router => {
  router.get('/layers', (req, res) => {
    return Layer.findAll({
      attributes: ['id', 'name', 'title'],
    }).then(layers => res.send(layers));
  });
};
