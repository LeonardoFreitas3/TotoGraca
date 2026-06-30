import { Link } from 'react-router-dom'
import { PickReview, PickSelector } from './Picks'
import {
  currentUser,
  isLocked,
  jornadaFinished,
  listMatches,
  setTip,
  teamName,
  userScore,
  userTipsForJornada,
  winnersForJornada,
} from '../store'
import { matchResult, type Jornada, type Pick } from '../types'
import { countdownText } from '../utils'

export function JornadaPanel({ jornada }: { jornada: Jornada }) {
  const me = currentUser()!
  const isAdmin = me.role === 'admin'
  const matches = listMatches(jornada.id)
  const locked = isLocked(jornada)
  const finished = jornadaFinished(jornada.id)
  const tips = userTipsForJornada(me.id, jornada.id)
  const score = userScore(me.id, jornada.id)
  const winners = finished ? winnersForJornada(jornada.id) : []
  const counting = countdownText(jornada.deadline).replace('Fecha em ', '')

  if (matches.length === 0) {
    return (
      <>
        <h2 className="page-title center">Jornada {jornada.number}</h2>
        <div className="empty">
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>event_busy</span>
          <div>Ainda não há jogos nesta jornada.</div>
        </div>
      </>
    )
  }

  return (
    <>
      {!locked && (
        <div className="center" style={{ marginBottom: 16 }}>
          <span className="deadline-pill">
            <span className="material-symbols-outlined ms-fill">timer</span>
            Fecha sáb 09:00
            <span className="sep">{counting}</span>
          </span>
        </div>
      )}

      <h2 className="page-title center" style={{ marginBottom: 20 }}>Jornada {jornada.number}</h2>

      {isAdmin && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <span className="material-symbols-outlined">visibility</span>
          Vista de gestão — como admin não apostas, só geres.
        </div>
      )}

      {!isAdmin && finished && (
        <div className="result-banner">
          <span className="pill">Jornada terminada</span>
          {score.isWinner ? (
            <>
              <h2>Chave certa! 🏆</h2>
              <p>Acertaste os {score.total} jogos. Performance perfeita!</p>
            </>
          ) : (
            <>
              <h2>{score.correct}/{score.total} certos</h2>
              <p>Falhaste {score.total - score.correct} — sem chave esta semana.</p>
            </>
          )}
        </div>
      )}

      {!isAdmin && locked && !finished && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <span className="material-symbols-outlined">hourglass_top</span>
          As apostas estão fechadas. Aguarda os resultados.
        </div>
      )}

      {matches.map((m, idx) => {
        const res = matchResult(m)
        const pick = tips[m.id] as Pick | undefined
        const home = teamName(m.homeTeamId)
        const away = teamName(m.awayTeamId)
        return (
          <div className="match" key={m.id}>
            <div className="match-num">Jogo {idx + 1}</div>
            {finished && (
              <div className="score-wrap">
                <span className="score-chip">{m.homeScore} - {m.awayScore}</span>
              </div>
            )}
            {!isAdmin && !locked ? (
              <PickSelector homeName={home} awayName={away} value={pick} onChange={(p) => setTip(me.id, m.id, p)} />
            ) : (
              <PickReview homeName={home} awayName={away} value={pick} result={res} />
            )}
          </div>
        )
      })}

      {!isAdmin && !locked && (
        <p className="center muted" style={{ fontSize: 13, marginTop: 16 }}>
          Os palpites são guardados automaticamente. Podes alterar até ao fecho.
        </p>
      )}

      {finished && (
        <div className="card" style={{ marginTop: 8 }}>
          <p className="card-title">Chave certa esta jornada</p>
          {winners.length === 0 ? (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>Ninguém acertou tudo desta vez.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {winners.map((w) => (
                <span className="winner-chip" key={w.id}>
                  <span className="material-symbols-outlined ms-fill">emoji_events</span>
                  {w.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {!isAdmin && (
        <p className="center" style={{ marginTop: 16 }}>
          <Link to="/jornadas">Ver vencedores de todas as jornadas</Link>
        </p>
      )}
    </>
  )
}
