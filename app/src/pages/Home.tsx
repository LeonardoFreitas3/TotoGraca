import { Link } from 'react-router-dom'
import { currentJornada, currentUser, lastFinishedJornada, userScore, winnersForJornada } from '../store'
import { JornadaPanel } from '../components/JornadaPanel'

function LastJornada() {
  const me = currentUser()!
  const last = lastFinishedJornada()
  if (!last || last.id === currentJornada()?.id) return null
  const winners = winnersForJornada(last.id)
  const s = userScore(me.id, last.id)
  const mine = me.role === 'admin' ? null : s.answered === 0 ? 'Não apostaste.' : s.isWinner ? 'Chave certa! 🏆' : `Fizeste ${s.correct}/${s.total}.`
  return (
    <Link to={`/jornada/${last.id}`} className="admin-cta admin-cta-ghost" style={{ marginBottom: 16 }}>
      <span className="material-symbols-outlined">emoji_events</span>
      <div style={{ flex: 1 }}>
        <strong>Jornada {last.number} terminada{mine && ` · ${mine}`}</strong>
        <div style={{ fontSize: 13 }}>{winners.length ? `Chave certa: ${winners.map((w) => w.name).join(', ')}` : 'Ninguém fez chave certa.'}</div>
      </div>
      <span className="material-symbols-outlined">chevron_right</span>
    </Link>
  )
}

export function Home() {
  const jornada = currentJornada()

  if (!jornada) {
    return (
      <div className="empty">
        <i className="ti ti-ballpen" style={{ fontSize: 34 }} /><br />
        Ainda não há jornadas. O admin tem de criar a primeira.
      </div>
    )
  }

  return (
    <>
      <LastJornada />
      <JornadaPanel jornada={jornada} />
    </>
  )
}
