const fixEncoding = require("../utils/fixEncoding")
// @ponicode
describe("fixEncoding.fixEncoding", () => {
    test("0", () => {
        let result = fixEncoding.fixEncoding('Descripção do Porto do Rio de Janeiro e das obras da Doca d&#039;alfandega')
        expect(result).toBe("Descripção do Porto do Rio de Janeiro e das obras da Doca d'alfandega")
    })

    test("1", () => {
        let result = fixEncoding.fixEncoding("Estação do Pão de Açúcar e bondinho do Caminho Aéreo, ponto final do trecho que se inicia no Morro da Urca. Este segundo trecho foi construído por iniciativa dos industriais Augusto Ferreira Ramos e Manuel Galvão. O projeto foi  do engenheiro Fredolino Cardoso <br />
    Em 27 de outubro de 1912, foi inaugurado um caminho aéreo no Rio de Janeiro, entre a Praia Vermelha e o Morro da Urca, que se tornaria o mundialmente famoso Bondinho do Pão de Açúcar. Em 1º de dezembro, foi inaugurada a iluminação elétrica no caminho aéreo. O bondinho no segundo trecho, entre o Morro da Urca e o Pão de Açúcar, numa extensão de 750 metros e 396 metros de altura, começou a funcionar no dia 18 de janeiro de 1913, completando a ligação até o alto do pico do Pão de Açúcar. é um dos mais famosos cartões postais do Rio de Janeiro.")
        expect(result).toBe('Estação do Pão de Açúcar e bondinho do Caminho Aéreo, ponto final do trecho que se inicia no Morro da Urca. Este segundo trecho foi construído por iniciativa dos industriais Augusto Ferreira Ramos e Manuel Galvão. O projeto foi  do engenheiro Fredolino Cardoso ')
    })

    test("2", () => {
        let result = fixEncoding.fixEncoding('Foo bar')
        expect(result).toBe('Foo bar')
    })
})
