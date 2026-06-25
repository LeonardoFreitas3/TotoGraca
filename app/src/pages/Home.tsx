import { currentJornada } from '../store'
import { JornadaPanel } from '../components/JornadaPanel'

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

  return <JornadaPanel jornada={jornada} />
}
