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
  '<br \\/>\n': ' ',
};

exports.fixEncoding = text => {
  let cleaned = text;
  Object.keys(htmlCodes).forEach(code => {
    cleaned = cleaned.replace(new RegExp(code, 'gm'), htmlCodes[code]);
  });
  return cleaned;
};
