import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PickReview, PickSelector } from './Picks'
import { PicksGrid } from './PicksGrid'
import {
  adeptos,
  canBet,
  cotaPaid,
  currentUser,
  isLocked,
  jornadaFinished,
  listMatches,
  refresh,
  setAdeptoPaid,
  setTip,
  teamName,
  userScore,
  userTipsForJornada,
  winnersForJornada,
} from '../store'
import { ADEPTO_COTA, MBWAY_PHONE, matchResult, type Jornada, type Pick } from '../types'
import { countdownText, jornadaLabel } from '../utils'

// Como funciona: mostrado a quem ainda espera aprovação
function Regras() {
  const rules = [
    ['calendar_month', 'Todas as semanas há uma jornada com os jogos da série, sem o jogo das Águias.'],
    ['sports_soccer', 'Em cada jogo escolhes 1 (ganha a casa), X (empate) ou 2 (ganha o visitante).'],
    ['timer', 'Os palpites fecham automaticamente antes dos jogos, normalmente sábado às 09:00. Até lá podes alterar.'],
    ['emoji_events', 'Chave certa: ganha quem acertar todos os jogos da jornada. Na época conta quem tem mais chaves certas.'],
    ['payments', `Adeptos pagam ${ADEPTO_COTA} € por jornada, por MBWay para ${MBWAY_PHONE}. Quando o admin confirmar, os palpites dessa jornada abrem.`],
    ['visibility', 'Depois do fecho vês os palpites de toda a gente e, no fim, quem fez chave certa.'],
  ]
  return (
    <div className="card">
      <p className="card-title">Como funciona</p>
      {rules.map(([icon, text]) => (
        <div className="list-item" key={icon} style={{ padding: '10px 0', alignItems: 'flex-start' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--muted)' }}>{icon}</span>
          <span style={{ flex: 1, fontSize: 14 }}>{text}</span>
        </div>
      ))}
    </div>
  )
}

// Admin: marca os adeptos que pagaram os 2 € desta jornada por MBWay
function AdeptosCota({ jornada }: { jornada: Jornada }) {
  const fans = adeptos().sort((a, b) => a.name.localeCompare(b.name))
  const paid = fans.filter((u) => cotaPaid(u.id, jornada)).length
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="spread">
        <p className="card-title" style={{ margin: 0 }}>Adeptos · cota da jornada</p>
        <span className="badge badge-green">{paid}/{fans.length} · {(paid * ADEPTO_COTA).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
      </div>
      {fans.map((u) => {
        const ok = cotaPaid(u.id, jornada)
        return (
          <label className="list-item" key={u.id} style={{ padding: '10px 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={ok} onChange={(e) => setAdeptoPaid(u.id, jornada.id, e.target.checked)} />
            <span style={{ flex: 1 }}>{u.name}</span>
            <span className="muted" style={{ fontSize: 12 }}>{ok ? 'Pagou' : `${ADEPTO_COTA} € MBWay`}</span>
          </label>
        )
      })}
    </div>
  )
}

export function JornadaPanel({ jornada }: { jornada: Jornada }) {
  const me = currentUser()!
  const isAdmin = me.role === 'admin'
  const matches = listMatches(jornada.id)
  const locked = isLocked(jornada)
  const pending = me.status === 'pending'
  const semCota = !pending && me.role === 'adepto' && canBet(jornada) && !cotaPaid(me.id, jornada)
  const bettable = canBet(jornada) && !semCota && !pending
  // enquanto espera que o admin confirme o MBWay (ou a aprovação), vai ao servidor de 15 em 15 s
  useEffect(() => {
    if (!semCota && !pending) return
    const t = setInterval(refresh, 15_000)
    return () => clearInterval(t)
  }, [semCota, pending])
  const finished = jornadaFinished(jornada.id)
  const tips = userTipsForJornada(me.id, jornada.id)
  const score = userScore(me.id, jornada.id)
  const winners = finished ? winnersForJornada(jornada.id) : []
  const counting = countdownText(jornada.deadline).replace('Fecha em ', '')

  if (pending) {
    return (
      <>
        <h2 className="page-title center" style={{ marginBottom: 16 }}>{jornadaLabel(jornada)}</h2>
        <div className="notice" style={{ marginBottom: 16, borderColor: 'var(--yellow)' }}>
          <span className="material-symbols-outlined">hourglass_top</span>
          <span>Conta à espera de aprovação do admin. Entretanto podes alterar o nome e a palavra-passe no <Link to="/perfil">perfil</Link>.</span>
        </div>
        <Regras />
      </>
    )
  }

  if (matches.length === 0) {
    return (
      <>
        <h2 className="page-title center">{jornadaLabel(jornada)}</h2>
        <div className="empty">
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>event_busy</span>
          <div>Ainda não há jogos nesta jornada.</div>
        </div>
      </>
    )
  }

  return (
    <>
      {(bettable || semCota) && (
        <div className="center" style={{ marginBottom: 16 }}>
          <span className="deadline-pill">
            <span className="material-symbols-outlined ms-fill">timer</span>
            Fecha {new Date(jornada.deadline).toLocaleString('pt-PT', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
            <span className="sep">{counting}</span>
          </span>
        </div>
      )}

      <h2 className="page-title center" style={{ marginBottom: 20 }}>{jornadaLabel(jornada)}</h2>

      {isAdmin && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <span className="material-symbols-outlined">visibility</span>
          Vista de gestão — como admin não apostas, só geres.
        </div>
      )}

      {isAdmin && adeptos().length > 0 && <AdeptosCota jornada={jornada} />}

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

      {semCota && (
        <div className="notice" style={{ marginBottom: 16, borderColor: 'var(--red)' }}>
          <span className="material-symbols-outlined">payments</span>
          <span>
            Cota desta jornada por pagar. Envia {ADEPTO_COTA} € por MBWay para <strong>{MBWAY_PHONE}</strong>; quando o admin confirmar, já podes apostar.
          </span>
        </div>
      )}

      {!isAdmin && !pending && !locked && !bettable && !semCota && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <span className="material-symbols-outlined">lock_clock</span>
          Esta jornada ainda não abriu. Só se aposta na jornada da semana.
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
            {m.postponed ? (
              <div className="score-wrap"><span className="badge badge-grey">Adiado, não conta</span></div>
            ) : finished && (
              <div className="score-wrap">
                <span className="score-chip">{m.homeScore} - {m.awayScore}</span>
              </div>
            )}
            {m.postponed ? null : !isAdmin && bettable ? (
              <PickSelector homeName={home} awayName={away} value={pick} onChange={(p) => setTip(me.id, m.id, p)} />
            ) : (
              <PickReview homeName={home} awayName={away} value={pick} result={res} />
            )}
          </div>
        )
      })}

      {!isAdmin && bettable && (
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

      {(isAdmin || locked) && <PicksGrid jornada={jornada} />}

      {!isAdmin && (
        <p className="center" style={{ marginTop: 16 }}>
          <Link to="/jornadas">Ver vencedores de todas as jornadas</Link>
        </p>
      )}
    </>
  )
}
