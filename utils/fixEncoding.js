const htmlCodes = [
  { code: '&#39;', replacement: "'" },
  { code: '&#039,', replacement: "'" },
  { code: '&#039;', replacement: "'" },
  { code: '&quot;', replacement: '"' },
  { code: '&gt;', replacement: '>' },
  { code: '&lt;', replacement: '<' },
  { code: '&amp;', replacement: '&' },
  { code: '&amp,', replacement: '&' },
  { code: ',amp;', replacement: '&' },
  { code: '<br \\/>\n', replacement: ' ' },
];

exports.fixEncoding = text => {
  let cleaned = text;
  htmlCodes.forEach((code, replacement) => {
    if (cleaned.match(new RegExp(code, 'gm'))) console.log(code, cleaned);
    cleaned = cleaned.replace(new RegExp(code, 'gm'), replacement);
  });
  return cleaned;
};
