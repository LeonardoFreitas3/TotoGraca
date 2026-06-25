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

  return (
    <>
      <h2 style={{ marginTop: 0 }}>O meu histórico</h2>
      <p className="muted" style={{ marginTop: -8, fontSize: 13 }}>Tudo o que apostaste esta época</p>

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
            <div className="spread" style={{ marginBottom: 10 }}>
              <strong>Jornada {j.number}</strong>
              {finished && (
                score.isWinner
                  ? <span className="badge badge-green"><i className="ti ti-trophy" /> Chave certa</span>
                  : <span className="badge badge-grey">{score.correct}/{score.total} certos</span>
              )}
            </div>
            {matches.map((m) => (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <div className="spread" style={{ fontSize: 13, marginBottom: 6 }}>
                  <span>{teamName(m.homeTeamId)} <span className="muted">vs</span> {teamName(m.awayTeamId)}</span>
                  {finished && <span className="muted">{m.homeScore}–{m.awayScore}</span>}
                </div>
                <PickReview value={tips[m.id] as Pick | undefined} result={matchResult(m)} />
              </div>
            ))}
          </div>
        )
      })}
    </>
  )
}
