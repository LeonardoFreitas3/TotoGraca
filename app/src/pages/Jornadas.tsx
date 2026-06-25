import { Link } from 'react-router-dom'
import {
  isLocked,
  jornadaFinished,
  listJornadas,
  seasonRanking,
} from '../store'
import { CURRENT_SEASON } from '../types'
import { fmtDeadline } from '../utils'

export function Jornadas() {
  const jornadas = listJornadas()
  const ranking = seasonRanking()

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Classificação da época</h2>
      <p className="muted" style={{ marginTop: -8, fontSize: 13 }}>
        {CURRENT_SEASON} · jornadas ganhas (chave certa)
      </p>

      <div className="card">
        {ranking.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Sem jogadores aprovados ainda.</p>
        ) : (
          ranking.map((row, i) => (
            <div className="list-item" key={row.user.id}>
              <span style={{ width: 18, color: i === 0 ? 'var(--yellow)' : 'var(--muted)', fontWeight: 600 }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{row.user.name}</span>
              <span className="badge badge-yellow">
                <i className="ti ti-trophy" /> {row.wins}
              </span>
            </div>
          ))
        )}
      </div>

      <h2>Jornadas</h2>
      {jornadas.length === 0 && <div className="empty">Ainda não há jornadas.</div>}
      {jornadas.map((j) => {
        const finished = jornadaFinished(j.id)
        const locked = isLocked(j)
        return (
          <Link to={`/jornada/${j.id}`} key={j.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ marginBottom: 10 }}>
              <div className="spread">
                <div>
                  <strong>Jornada {j.number}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{fmtDeadline(j.deadline)}</div>
                </div>
                {finished ? (
                  <span className="badge badge-green">Terminada</span>
                ) : locked ? (
                  <span className="badge badge-grey">Fechada</span>
                ) : (
                  <span className="badge badge-yellow">A apostar</span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </>
  )
}
