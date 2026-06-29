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
import { countdownText, fmtDeadline } from '../utils'

export function JornadaPanel({ jornada }: { jornada: Jornada }) {
  const me = currentUser()!
  const isAdmin = me.role === 'admin'
  const matches = listMatches(jornada.id)
  const locked = isLocked(jornada)
  const finished = jornadaFinished(jornada.id)
  const tips = userTipsForJornada(me.id, jornada.id)

  if (matches.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <i className="ti ti-calendar-off" style={{ fontSize: 30 }} /><br />
          Ainda não há jogos nesta jornada.
        </div>
      </div>
    )
  }

  // ----- estado de cabeçalho -----
  const header = (
    <div className="spread" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
      <h2 style={{ margin: 0, fontSize: 20, flex: 1, minWidth: 0 }}>Jornada {jornada.number}</h2>
      {!locked ? (
        <span className="badge badge-yellow deadline">
          <i className="ti ti-lock-clock" /> {countdownText(jornada.deadline)}
        </span>
      ) : finished ? (
        <span className="badge badge-green">Terminada</span>
      ) : (
        <span className="badge badge-grey">Apostas fechadas</span>
      )}
    </div>
  )

  // ----- resumo (resultados) -----
  const score = userScore(me.id, jornada.id)
  const winners = finished ? winnersForJornada(jornada.id) : []

  return (
    <>
      {header}

      {isAdmin && (
        <div className="notice" style={{ marginBottom: 14 }}>
          <i className="ti ti-eye" /> Vista de gestão — como admin não apostas, só geres.
        </div>
      )}

      {!isAdmin && !locked && (
        <div className="notice" style={{ marginBottom: 14 }}>
          <i className="ti ti-info-circle" /> Escolhe V1, X ou V2 em cada jogo. Podes alterar até {fmtDeadline(jornada.deadline)}.
        </div>
      )}

      {!isAdmin && locked && !finished && (
        <div className="notice" style={{ marginBottom: 14 }}>
          <i className="ti ti-hourglass" /> As apostas estão fechadas. Aguarda os resultados do admin.
        </div>
      )}

      {!isAdmin && finished && (
        <div className="card" style={{ background: score.isWinner ? 'var(--green-soft)' : 'var(--yellow-soft)', borderColor: score.isWinner ? 'var(--green)' : 'var(--yellow)' }}>
          {score.isWinner ? (
            <div className="center" style={{ color: 'var(--green)' }}>
              <i className="ti ti-trophy" style={{ fontSize: 26 }} /><br />
              <strong>Chave certa!</strong> Acertaste todos os jogos.
            </div>
          ) : (
            <div className="center" style={{ color: '#7a5c00' }}>
              Acertaste {score.correct} de {score.total}. {score.total - score.correct === 0 ? '' : `Falhaste ${score.total - score.correct} — sem chave esta semana.`}
            </div>
          )}
        </div>
      )}

      {/* jogos */}
      {matches.map((m) => {
        const res = matchResult(m)
        const pick = tips[m.id] as Pick | undefined
        return (
          <div className="match" key={m.id}>
            <div className="spread">
              <div className="match-teams">
                {teamName(m.homeTeamId)} <span className="vs">vs</span> {teamName(m.awayTeamId)}
              </div>
              {finished && (
                <span className="badge badge-grey">{m.homeScore}–{m.awayScore}</span>
              )}
            </div>
            {!isAdmin && !locked ? (
              <PickSelector value={pick} onChange={(p) => setTip(me.id, m.id, p)} />
            ) : (
              <PickReview value={pick} result={res} />
            )}
          </div>
        )
      })}

      {/* vencedores da jornada */}
      {finished && (
        <div className="card" style={{ marginTop: 4 }}>
          <p className="card-title">Chave certa esta jornada</p>
          {winners.length === 0 ? (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>Ninguém acertou tudo desta vez.</p>
          ) : (
            winners.map((w) => (
              <div className="list-item" key={w.id}>
                <i className="ti ti-trophy" style={{ color: 'var(--yellow)', fontSize: 18 }} />
                <span style={{ flex: 1 }}>{w.name}</span>
              </div>
            ))
          )}
        </div>
      )}

      {!isAdmin && (
        <p className="center" style={{ marginTop: 8 }}>
          <Link to="/historico">Ver histórico da época</Link>
        </p>
      )}
    </>
  )
}
