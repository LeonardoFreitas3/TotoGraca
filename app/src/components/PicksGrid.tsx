import { adeptos, isFansOnly, players, scoredMatches, userScore, userTipsForJornada } from '../store'
import { matchResult, type Jornada, type Match, type User } from '../types'

function Grid({ title, label, users, matches, jornada }: { title: string; label: string; users: User[]; matches: Match[]; jornada: Jornada }) {
  const results = matches.map(matchResult)
  const hasResults = results.some((r) => r !== null)
  const rows = users
    .map((u) => ({ u, tips: userTipsForJornada(u.id, jornada.id), score: userScore(u.id, jornada.id) }))
    .sort((a, b) => b.score.correct - a.score.correct || a.u.name.localeCompare(b.u.name))

  return (
    <div className="card">
      <p className="card-title">{title}</p>
      <div className="pgrid-wrap">
        <table className="pgrid">
          <thead>
            <tr>
              <th>{label}</th>
              {matches.map((m, i) => <th key={i} title={isFansOnly(m) ? 'Jogo das Águias' : undefined}>{isFansOnly(m) ? 'ADAG' : `J${i + 1}`}</th>)}
              {hasResults && <th>Certos</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ u, tips, score }) => (
              <tr key={u.id} className={score.isWinner ? 'winner' : undefined}>
                <td>{u.name}</td>
                {matches.map((m, i) => {
                  const p = tips[m.id]
                  const r = results[i]
                  const cls = p && r ? (p === r ? 'ok' : 'ko') : undefined
                  return <td key={m.id} className={cls}>{p ?? '—'}</td>
                })}
                {hasResults && <td><strong>{score.correct}</strong>/{score.total}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: 11, margin: '10px 0 0' }}>V1 casa · X empate · V2 fora. Verde certo, vermelho falhado.</p>
    </div>
  )
}

// Palpites em tabela: plantel numa, adeptos noutra (com o jogo das Águias). Admin vê sempre, os outros só depois do fecho.
export function PicksGrid({ jornada }: { jornada: Jornada }) {
  const all = scoredMatches(jornada.id)
  const fans = adeptos()
  return (
    <>
      <Grid title="Palpites de todos" label="Jogador" users={players()} matches={all.filter((m) => !isFansOnly(m))} jornada={jornada} />
      {fans.length > 0 && jornada.number !== 0 && (
        <Grid title="Palpites dos adeptos" label="Adepto" users={fans} matches={all} jornada={jornada} />
      )}
    </>
  )
}
