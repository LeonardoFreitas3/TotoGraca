import { Link } from 'react-router-dom'
import { isLocked, jornadaFinished, listJornadas, winnersForJornada } from '../store'

export function Jornadas() {
  const jornadas = listJornadas()

  return (
    <>
      <h2 className="page-title">Vencedores</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>Quem fez chave certa em cada jornada</p>

      {jornadas.length === 0 && <div className="empty">Ainda não há jornadas.</div>}

      {jornadas.map((j) => {
        const finished = jornadaFinished(j.id)
        const locked = isLocked(j)
        const winners = finished ? winnersForJornada(j.id) : []
        return (
          <Link to={`/jornada/${j.id}`} key={j.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="spread" style={{ marginBottom: finished ? 12 : 0 }}>
                <strong style={{ fontSize: 18 }}>Jornada {j.number}</strong>
                {finished ? (
                  <span className="badge badge-green">Terminada</span>
                ) : locked ? (
                  <span className="badge badge-grey">Fechada</span>
                ) : (
                  <span className="badge badge-yellow">A apostar</span>
                )}
              </div>

              {finished && (
                winners.length === 0 ? (
                  <p className="muted" style={{ margin: 0, fontSize: 14 }}>Ninguém acertou todos os jogos.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {winners.map((w) => (
                      <span className="winner-chip" key={w.id}>
                        <span className="material-symbols-outlined ms-fill">emoji_events</span>
                        {w.name}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>
          </Link>
        )
      })}
    </>
  )
}
