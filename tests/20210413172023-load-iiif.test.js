const rewire = require("rewire")

const _20210413172023_load_iiif = rewire("../seeders/20210413172023-load-iiif")
const getSeeAlso = _20210413172023_load_iiif.__get__("getSeeAlso")
const parseIIIF = _20210413172023_load_iiif.__get__("parseIIIF")
// @ponicode
describe("getSeeAlso", () => {
    test("Valid data", () => {
        let param1 = [{ id: 'https://images.imaginerio.org/api/items/24', type: 'Dataset', label: { none: ['application/ld+json'] }, format: 'application/ld+json', profile: 'https://images.imaginerio.org/api-context' }]
        let result = getSeeAlso(param1)
        expect(result).toBe('https://images.imaginerio.org/api/items/24')
    })

    test("Empty array", () => {
        let result = getSeeAlso([])
        expect(result).toBe(null)
    })

    test("Object", () => {
        let result = getSeeAlso({})
        expect(result).toBe(null)
    })
})

// @ponicode
describe("parseIIIF", () => {
    test("0", () => {
        let param1 = [{ label: { none: ['Identifier'] }, value: { none: ['001AAN005126'] } }, { label: { 'pt-br': ['Title'] }, value: { 'pt-br': ['Quartel Central do Corpo de Bombeiros'] } }, { label: { 'pt-br': ['Description'] }, value: { 'pt-br': ['Aspecto de uma das edificações do Corpo de Bombeiros. <br />\nFotografia integra &quot;Álbum de amador navegante &quot;, formado por 200 fotografias, que retratam uma viagem de navio pelo Brasil e por outros países da América do Sul e Central.'] } }, { label: { none: ['Creator'] }, value: { none: ['Anônimo'] } }, { label: { none: ['Date (Circa)'] }, value: { none: ['1905 – 1915'] } }, { label: { none: ['Type'] }, value: { none: ['FOTOGRAFIA/ Papel'] } }, { label: { none: ['Width'] }, value: { none: ['14.1'] } }, { label: { none: ['Height'] }, value: { none: ['8.3'] } }]
        let result = parseIIIF(param1, 1)
        let object = [{ DocumentId: 1, label: "Identifier", value: ["001AAN005126"], language: null }, { DocumentId: 1, label: "Title", value: ["Quartel Central do Corpo de Bombeiros"], language: "pt-br" }, { DocumentId: 1, label: "Description", value: ["Aspecto de uma das edificações do Corpo de Bombeiros. <br />\nFotografia integra &quot;Álbum de amador navegante &quot;, formado por 200 fotografias, que retratam uma viagem de navio pelo Brasil e por outros países da América do Sul e Central."], language: "pt-br" }, { DocumentId: 1, label: "Creator", value: ["Anônimo"], language: null }, { DocumentId: 1, label: "Date (Circa)", value: ["1905 – 1915"], language: null }, { DocumentId: 1, label: "Type", value: ["FOTOGRAFIA/ Papel"], language: null }, { DocumentId: 1, label: "Width", value: ["14.1"], language: null }, { DocumentId: 1, label: "Height", value: ["8.3"], language: null }]
        expect(result).toEqual(object)
    })

    test("1", () => {
        let result = parseIIIF([], 1)
        expect(result).toEqual([])
    })

    test("2", () => {
        let result = parseIIIF({}, 1)
        expect(result).toBe(null)
    })
})
