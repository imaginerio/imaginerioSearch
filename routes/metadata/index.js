const { Document, Sequelize } = require('../../models');
const { processImageMeta } = require('../../utils/attachImageMeta');

module.exports = router => {
  router.get('/metadata/:id', (req, res) =>
    Document.findOne({
      where: {
        [Sequelize.Op.or]: [{ ssid: req.params.id }, { id: req.params.id }],
      },
      include: {
        association: 'ImageMeta',
        attributes: ['label', 'value', 'link'],
      },
    }).then(document => res.send(document.ImageMeta.map(m => processImageMeta(m))))
  );
};
