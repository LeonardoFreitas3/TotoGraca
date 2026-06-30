import {
  currentUser,
  jornadaFinished,
  listJornadas,
  listMatches,
  teamName,
  userScore,
  userTipsForJornada,
} from '../store'
import { PickReview } from '../components/Picks'
import { matchResult, type Pick } from '../types'

export function Historico() {
  const me = currentUser()!
  const jornadas = listJornadas()
  const played = jornadas.filter((j) => Object.keys(userTipsForJornada(me.id, j.id)).length > 0)
  const finishedPlayed = played.filter((j) => jornadaFinished(j.id))

  let totalCorrect = 0
  let totalGames = 0
  finishedPlayed.forEach((j) => {
    const s = userScore(me.id, j.id)
    totalCorrect += s.correct
    totalGames += s.total
  })
  const aproveitamento = totalGames > 0 ? Math.round((totalCorrect / totalGames) * 100) : 0

  return (
    <>
      <h2 className="page-title">O meu histórico</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>O teu desempenho em jornadas passadas</p>

      <div className="bento">
        <div className="stat">
          <div className="stat-label">Total de acertos</div>
          <div className="stat-value">{totalCorrect}</div>
        </div>
        <div className="stat accent">
          <div className="stat-label">Aproveitamento</div>
          <div className="stat-value">{aproveitamento}%</div>
        </div>
      </div>

      {played.length === 0 && (
        <div className="empty">Ainda não fizeste palpites. Vai à jornada atual!</div>
      )}

      {played.map((j) => {
        const matches = listMatches(j.id)
        const tips = userTipsForJornada(me.id, j.id)
        const finished = jornadaFinished(j.id)
        const score = userScore(me.id, j.id)
        return (
          <div className="card" key={j.id}>
            <div className="spread" style={{ marginBottom: 14 }}>
              <strong style={{ fontSize: 16 }}>Jornada {j.number}</strong>
              {finished && (
                score.isWinner
                  ? <span className="badge badge-green">🏆 Chave certa</span>
                  : <span className="badge badge-grey">{score.correct}/{score.total} certos</span>
              )}
            </div>
            {matches.map((m, idx) => (
              <div key={m.id} style={{ marginBottom: 12 }}>
                <div className="spread" style={{ fontSize: 12, marginBottom: 6 }}>
                  <span className="muted">Jogo {idx + 1}</span>
                  {finished && <span style={{ fontWeight: 700 }}>{m.homeScore}–{m.awayScore}</span>}
                </div>
                <PickReview homeName={teamName(m.homeTeamId)} awayName={teamName(m.awayTeamId)} value={tips[m.id] as Pick | undefined} result={matchResult(m)} />
              </div>
            ))}
          </div>
        )
      })}
    </>
  )
}
