// Verificação rápida da lógica do robô:  node scripts/zz.check.mjs
import assert from 'node:assert/strict'
import { findGame, parseGames, similarity } from './zz.js'

// nomes FPF vs zerozero têm de bater
assert.equal(similarity('Fc Tadim', 'FC Tadim'), 1)
assert.equal(similarity('Dr Estrelas Faro', 'Estrelas do Faro'), 1)
assert.equal(similarity('Cf Os Ceramistas', '«Os Ceramistas»'), 1)
assert.equal(similarity('Dumiense Fc "B"', 'Dumiense FC B'), 1)
assert.ok(similarity('Dumiense FC B', 'Dumiense FC') < 1, 'a equipa B não pode bater com a A')
assert.ok(similarity('Granja FC', 'Antas FC') === 0)

// parser: um jogo jogado e um por jogar
const row = (id, cls, txt, h, a) =>
  `<td class="text" style="x"><a href="/equipa/h/1?e=1">${h}</a></td><td><img></td>` +
  `<td id="tdl_${id}" class="${cls}"><a href="/jogo/2026-10-18-x/${id}">${txt}</a></td>` +
  `<td><img></td><td class="text"><a href="/equipa/a/2?e=1"><b>${a}</b></a></td>`
const games = parseGames(row(1, 'result', '2-1', 'Fc Tadim', 'Granja FC') + row(2, 'vs', '16:00', 'Fão', 'Antas FC'))
assert.equal(games.length, 2)
assert.deepEqual([games[0].homeScore, games[0].awayScore], [2, 1])
assert.equal(games[1].homeScore, null)

// emparelhar: ordem casa/fora importa
assert.equal(findGame('FC Tadim', 'Granja Fc', games)?.gameId, '1')
assert.equal(findGame('Granja Fc', 'FC Tadim', games), null)

console.log('ok — robô de resultados')
