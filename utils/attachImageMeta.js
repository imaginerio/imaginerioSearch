exports.processImageMeta = meta => {
  let value = meta.value.length > 1 ? meta.value : meta.value[0];
  if (value && !Array.isArray(value) && value.match(/^-?\d+\.?\d*$/)) {
    value = parseFloat(value);
  }
  const link = !meta.link || meta.link.length > 1 ? meta.link : meta.link[0];
  return { label: meta.label, value, link };
};

exports.attachImageMeta = imageMeta => {
  const document = {};
  imageMeta.forEach(meta => {
    const { value, link } = exports.processImageMeta(meta);
    const [label] = meta.label.split(' ');
    document[label.toLowerCase()] = link ? { value, link } : value;
  });
  return document;
};
