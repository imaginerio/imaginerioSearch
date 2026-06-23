const { Document, Sequelize } = require('../../models');
const { processImageMeta } = require('../../utils/attachImageMeta');
const asyncHandler = require('../../utils/asyncHandler');

module.exports = router => {
  router.get(
    '/metadata/:id',
    asyncHandler(async (req, res) => {
      const lang = req.query.lang === 'pt-BR' ? 'pt-BR' : 'en';

      const document = await Document.findOne({
        where: {
          [Sequelize.Op.or]: [{ ssid: req.params.id }, { id: req.params.id }],
        },
        include: {
          association: 'ImageMeta',
          attributes: ['label', 'value', 'link', 'key'],
          where: { language: [lang, 'none'] },
        },
      });

      if (!document) return res.send([]);
      return res.send(document.ImageMeta.map(m => processImageMeta(m)));
    })
  );
};
