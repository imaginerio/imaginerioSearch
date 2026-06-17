/* eslint-disable no-underscore-dangle, camelcase, no-unused-vars */
const rewire = require('rewire');

const loadIiif = rewire('../seeders/20201113172023-load-iiif');
const parseIIIF = loadIiif.__get__('parseIIIF');
const parseLink = loadIiif.__get__('parseLink');

describe('parseIIIF', () => {
  test('0', () => {
    const param1 = [
      { label: { none: ['Identifier'] }, value: { none: ['001AAN005126'] } },
      {
        label: { 'pt-br': ['Title'] },
        value: { 'pt-br': ['Quartel Central do Corpo de Bombeiros'] },
      },
      {
        label: { 'pt-br': ['Description'] },
        value: {
          'pt-br': [
            'Aspecto de uma das edificações do Corpo de Bombeiros. <br />\nFotografia integra &quot;Álbum de amador navegante &quot;, formado por 200 fotografias, que retratam uma viagem de navio pelo Brasil e por outros países da América do Sul e Central.',
          ],
        },
      },
      { label: { none: ['Creator'] }, value: { none: ['Anônimo'] } },
      { label: { none: ['Date (Circa)'] }, value: { none: ['1905 – 1915'] } },
      { label: { none: ['Type'] }, value: { none: ['FOTOGRAFIA/ Papel'] } },
      { label: { none: ['Width'] }, value: { none: ['14.1'] } },
      { label: { none: ['Height'] }, value: { none: ['8.3'] } },
    ];
    const result = parseIIIF(param1, 1);
    const object = [
      {
        DocumentId: 1,
        label: 'Identifier',
        key: 'Identifier',
        value: ['001AAN005126'],
        language: 'none',
      },
      {
        DocumentId: 1,
        label: 'Title',
        key: 'Title',
        value: ['Quartel Central do Corpo de Bombeiros'],
        language: 'pt-br',
      },
      {
        DocumentId: 1,
        label: 'Description',
        key: 'Description',
        // fixEncoding collapses `<br />\n` to a space and decodes `&quot;`.
        value: [
          'Aspecto de uma das edificações do Corpo de Bombeiros.  Fotografia integra "Álbum de amador navegante ", formado por 200 fotografias, que retratam uma viagem de navio pelo Brasil e por outros países da América do Sul e Central.',
        ],
        language: 'pt-br',
      },
      { DocumentId: 1, label: 'Creator', key: 'Creator', value: ['Anônimo'], language: 'none' },
      {
        DocumentId: 1,
        label: 'Date (Circa)',
        key: 'Date (Circa)',
        value: ['1905 – 1915'],
        language: 'none',
      },
      { DocumentId: 1, label: 'Type', key: 'Type', value: ['FOTOGRAFIA/ Papel'], language: 'none' },
      { DocumentId: 1, label: 'Width', key: 'Width', value: ['14.1'], language: 'none' },
      { DocumentId: 1, label: 'Height', key: 'Height', value: ['8.3'], language: 'none' },
    ];
    expect(result).toEqual(object);
  });

  test('1', () => {
    const result = parseIIIF([], 1);
    expect(result).toEqual([]);
  });

  test('2', () => {
    const result = parseIIIF({}, 1);
    expect(result).toBe(null);
  });

  test('falls back to the first available language when no English label exists', () => {
    const result = parseIIIF(
      [{ label: { 'pt-br': ['Título'] }, value: { 'pt-br': ['Valor'] } }],
      7
    );
    expect(result).toEqual([
      { DocumentId: 7, label: 'Título', key: 'Título', value: ['Valor'], language: 'pt-br' },
    ]);
  });
});

describe('parseLink', () => {
  test('builds a structured link from a valid seeAlso entry', () => {
    const param1 = [
      {
        id: 'https://images.imaginerio.org/api/items/24',
        type: 'Dataset',
        label: { none: ['application/ld+json'] },
        format: 'application/ld+json',
        profile: 'https://images.imaginerio.org/api-context',
      },
    ];
    const result = parseLink(param1, 'See Also', 1);
    expect(result).toEqual({
      DocumentId: 1,
      label: 'See Also',
      key: 'See Also',
      value: ['application/ld+json'],
      link: ['https://images.imaginerio.org/api/items/24'],
    });
  });

  test('nulls the link when an id is not a valid URL', () => {
    const result = parseLink([{ id: 'not a url', label: { none: ['bad'] } }], 'Source', 2);
    expect(result).toEqual({
      DocumentId: 2,
      label: 'Source',
      key: 'Source',
      value: ['bad'],
      link: null,
    });
  });
});
