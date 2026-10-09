import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PickReview, PickSelector } from './Picks'
import { PicksGrid } from './PicksGrid'
import {
  canBet,
  cotaPaid,
  currentUser,
  isLocked,
  jornadaFinished,
  matchesFor,
  refresh,
  setTip,
  teamName,
  userScore,
  userTipsForJornada,
  winnersForJornada,
} from '../store'
import { CLUB_FULL_NAME, PAY_HINT, PRIZE, matchResult, type Jornada, type Pick } from '../types'
import { countdownText, jornadaLabel } from '../utils'

// Como funciona: mostrado a quem ainda espera aprovação
function Regras() {
  const rules = [
    ['calendar_month', 'Todas as semanas há uma jornada com os jogos da série. Os adeptos apostam também no jogo das Águias da Graça.'],
    ['sports_soccer', 'Em cada jogo escolhes 1 (ganha a casa), X (empate) ou 2 (ganha o visitante).'],
    ['timer', 'Os palpites fecham automaticamente antes dos jogos, normalmente sábado às 09:00. Até lá podes alterar.'],
    ['emoji_events', `Chave certa: quem acertar todos os jogos ganha ${PRIZE} €. O prémio é por jornada, todas as semanas há um novo.`],
    ['storefront', `O prémio levanta-se na ${CLUB_FULL_NAME}.`],
    ['payments', `Adeptos pagam ${PAY_HINT}, por jornada. Quando o admin confirmar, a jornada aparece aqui. Não há Taça para adeptos.`],
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

export function JornadaPanel({ jornada }: { jornada: Jornada }) {
  const me = currentUser()!
  const isAdmin = me.role === 'admin'
  const matches = matchesFor(me.id, jornada.id) // jogadores não veem o jogo das Águias
  const locked = isLocked(jornada)
  const adeptoTaca = me.role === 'adepto' && jornada.number === 0 // adeptos não jogam a Taça
  // adepto sem a jornada paga não vê os jogos (só as regras) até o admin confirmar; jornadas já fechadas ficam visíveis
  const semCota = me.role === 'adepto' && !adeptoTaca && !locked && !cotaPaid(me.id, jornada)
  const pending = me.status === 'pending' && me.role !== 'adepto'
  const bettable = canBet(jornada) && !semCota && !pending && !adeptoTaca
  // enquanto espera que o admin confirme o pagamento, vai ao servidor de 15 em 15 s
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

  if (pending || semCota) {
    return (
      <>
        <h2 className="page-title center" style={{ marginBottom: 16 }}>{jornadaLabel(jornada)}</h2>
        <div className="notice" style={{ marginBottom: 16, borderColor: 'var(--yellow)' }}>
          <span className="material-symbols-outlined">{semCota ? 'payments' : 'hourglass_top'}</span>
          <span>
            {semCota
              ? <>Paga {PAY_HINT}. Assim que o admin confirmar, a {jornadaLabel(jornada).toLowerCase()} aparece aqui.</>
              : <>Conta à espera de aprovação do admin. Entretanto podes alterar o nome e a palavra-passe no <Link to="/perfil">perfil</Link>.</>}
          </span>
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
      {bettable && (
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

      {adeptoTaca && !finished && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <span className="material-symbols-outlined">block</span>
          Adeptos não apostam na Taça.
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

      {!isAdmin && !adeptoTaca && !locked && !bettable && (
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

      {me.role === 'adepto' && <div style={{ marginTop: 16 }}><Regras /></div>}

      {!isAdmin && (
        <p className="center" style={{ marginTop: 16 }}>
          <Link to="/jornadas">Ver vencedores de todas as jornadas</Link>
        </p>
      )}
    </>
  )
}
