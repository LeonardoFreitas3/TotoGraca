import { Link } from 'react-router-dom'
import { jornadaLabel } from '../utils'
import { canBet, isLocked, jornadaFinished, listJornadas, seasonRanking, winnersForJornada } from '../store'

export function Jornadas() {
  const jornadas = listJornadas()
  const ranking = seasonRanking().filter((r) => r.wins > 0)

  return (
    <>
      <h2 className="page-title">Vencedores</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>Quem fez chave certa em cada jornada</p>

      {ranking.length > 0 && (
        <div className="card">
          <p className="card-title">Classificação da época</p>
          {ranking.map((r, i) => (
            <div className="list-item" key={r.user.id} style={{ padding: '8px 0' }}>
              <span className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{r.user.name}</span>
              <strong>{r.wins} chave{r.wins > 1 ? 's' : ''}</strong>
            </div>
          ))}
        </div>
      )}

      {jornadas.length === 0 && <div className="empty">Ainda não há jornadas.</div>}

      {jornadas.map((j) => {
        const finished = jornadaFinished(j.id)
        const locked = isLocked(j)
        const winners = finished ? winnersForJornada(j.id) : []
        return (
          <Link to={`/jornada/${j.id}`} key={j.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="spread" style={{ marginBottom: finished ? 12 : 0 }}>
                <strong style={{ fontSize: 18 }}>{jornadaLabel(j)}</strong>
                {finished ? (
                  <span className="badge badge-green">Terminada</span>
                ) : locked ? (
                  <span className="badge badge-grey">Fechada</span>
                ) : canBet(j) ? (
                  <span className="badge badge-yellow">A apostar</span>
                ) : (
                  <span className="badge badge-grey">Em breve</span>
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
