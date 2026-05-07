const { sequelize } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');

module.exports = router => {
  router.get('/health', (req, res) => {
    res.json({
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
    });
  });

  router.get(
    '/ready',
    asyncHandler(async (req, res) => {
      try {
        await sequelize.authenticate();
        res.json({ ready: true, timestamp: Date.now() });
      } catch (err) {
        req.log.warn({ err: err.message }, 'database not ready');
        res.status(503).json({ ready: false, error: err.message });
      }
    })
  );
};
