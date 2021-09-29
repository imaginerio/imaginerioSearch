const { sequelize } = require('../../models');

module.exports = router => {
  router.get('/health', (req, res) =>
    sequelize
      .authenticate()
      .then(() =>
        res.send({
          uptime: process.uptime(),
          message: 'OK',
          timestamp: Date.now(),
        })
      )
      .catch(e => res.status(503).send(e))
  );
};
