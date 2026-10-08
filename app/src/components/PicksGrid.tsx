import { approvedUsers, scoredMatches, userScore, userTipsForJornada } from '../store'
import { matchResult, type Jornada } from '../types'

// Palpites de toda a gente numa tabela: admin vê sempre, jogadores só depois do fecho
export function PicksGrid({ jornada }: { jornada: Jornada }) {
  const matches = scoredMatches(jornada.id)
  const results = matches.map(matchResult)
  const hasResults = results.some((r) => r !== null)
  const rows = approvedUsers()
    .map((u) => ({ u, tips: userTipsForJornada(u.id, jornada.id), score: userScore(u.id, jornada.id) }))
    .sort((a, b) => b.score.correct - a.score.correct || a.u.name.localeCompare(b.u.name))

  return (
    <div className="card">
      <p className="card-title">Palpites de todos</p>
      <div className="pgrid-wrap">
        <table className="pgrid">
          <thead>
            <tr>
              <th>Jogador</th>
              {matches.map((_, i) => <th key={i}>J{i + 1}</th>)}
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
