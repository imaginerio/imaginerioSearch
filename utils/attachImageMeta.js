const { some } = require('lodash');

exports.processImageMeta = meta => {
  let value = meta.value.length > 1 ? meta.value : meta.value[0];
  if (value && !Array.isArray(value) && value.match(/^-?\d+\.?\d*$/)) {
    value = parseFloat(value);
  }
  const link = !meta.link || meta.link.length > 1 ? meta.link : meta.link[0];
  return { label: meta.label, value, link, key: meta.key };
};

exports.attachImageMeta = imageMeta => {
  const document = {};
  imageMeta.forEach(meta => {
    const { value, link } = exports.processImageMeta(meta);
    const [label] = meta.label.split(' ');
    document[label.toLowerCase()] = link ? { value, link } : value;
  });

  if (
    some(imageMeta, ({ label }) => label === 'Width') &&
    some(imageMeta, ({ label }) => label === 'Height')
  ) {
    document.width = parseInt(imageMeta.find(({ label }) => label === 'Width').value[0], 10);
    document.height = parseInt(imageMeta.find(({ label }) => label === 'Height').value[0], 10);
  } else if (
    some(imageMeta, ({ label }) => label.match(/Width \(.*\)/gi)) &&
    some(imageMeta, ({ label }) => label.match(/Height \(.*\)/gi))
  ) {
    document.width = parseInt(
      imageMeta.find(({ label }) => label.match(/Width \(.*\)/gi)).value[0],
      10
    );
    document.height = parseInt(
      imageMeta.find(({ label }) => label.match(/Height \(.*\)/gi)).value[0],
      10
    );
  }

  return document;
};
