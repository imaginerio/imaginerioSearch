const htmlCodes = {
  '&#39;': "'",
  '&#039,': "'",
  '&#039;': "'",
  '&quot;': '"',
  '&gt;': '>',
  '&lt;': '<',
  '&amp;': '&',
  '&amp,': '&',
  ',amp;': '&',
  'd&#039;': '&',
  '<br />\n': ' ',
};

exports.fixEncoding = text => {
  let cleaned = text;
  Object.keys(htmlCodes).forEach(code => {
    cleaned = cleaned.replace(new RegExp(code, 'g'), htmlCodes[code]);
  });
  return cleaned;
};
