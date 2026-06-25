import { useParams, Link } from 'react-router-dom'
import { getJornada } from '../store'
import { JornadaPanel } from '../components/JornadaPanel'

export function JornadaView() {
  const { id } = useParams()
  const jornada = id ? getJornada(id) : null

  if (!jornada) {
    return (
      <div className="empty">
        Jornada não encontrada. <br /><Link to="/jornadas">Voltar</Link>
      </div>
    )
  }

  return (
    <>
      <p style={{ marginTop: 0 }}>
        <Link to="/jornadas"><i className="ti ti-arrow-left" /> Todas as jornadas</Link>
      </p>
      <JornadaPanel jornada={jornada} />
    </>
  )
}
