import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addMatch,
  deleteJornada,
  deleteMatch,
  getJornada,
  isLocked,
  jornadaFinished,
  listMatches,
  listTeams,
  matchDone,
  setMatchPostponed,
  setMatchScore,
  teamName,
  updateJornadaDeadline,
} from '../../store'
import { CLUB_TEAM, type Match } from '../../types'
import { fromLocalInput, jornadaLabel, toLocalInput } from '../../utils'

const Icon = ({ name }: { name: string }) => <span className="material-symbols-outlined">{name}</span>

const parse = (v: string) => (v.trim() === '' ? null : Math.max(0, Math.floor(Number(v))))

// Valor local; só grava ao sair do campo (evita uma escrita na BD por cada tecla)
function ScoreRow({ m }: { m: Match }) {
  const [h, setH] = useState(m.homeScore?.toString() ?? '')
  const [a, setA] = useState(m.awayScore?.toString() ?? '')
  const save = () => {
    const nh = parse(h), na = parse(a)
    if (nh !== m.homeScore || na !== m.awayScore) setMatchScore(m.id, nh, na)
  }
  const done = matchDone(m)

  return (
    <div className={`admin-match${done ? ' done' : ''}`}>
      <span className="admin-team right">{teamName(m.homeTeamId)}</span>
      {m.postponed ? (
        <span className="badge badge-grey" style={{ gridColumn: 'span 2', justifySelf: 'center' }}>Adiado</span>
      ) : (
        <>
          <input className="score-input" inputMode="numeric" aria-label={`Golos ${teamName(m.homeTeamId)}`}
            value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, ''))} onBlur={save} placeholder="–" />
          <input className="score-input" inputMode="numeric" aria-label={`Golos ${teamName(m.awayTeamId)}`}
            value={a} onChange={(e) => setA(e.target.value.replace(/\D/g, ''))} onBlur={save} placeholder="–" />
        </>
      )}
      <span className="admin-team">{teamName(m.awayTeamId)}</span>
      <button type="button" className={`link-btn admin-postpone${m.postponed ? ' on' : ''}`} onClick={() => setMatchPostponed(m.id, !m.postponed)}>
        {m.postponed ? 'Afinal joga-se: voltar a contar' : 'Jogo adiado, não conta'}
      </button>
    </div>
  )
}

export function AdminJornada() {
  const { id } = useParams()
  const navigate = useNavigate()
  const jornada = id ? getJornada(id) : null
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  if (!jornada) {
    return <div className="empty">Jornada não encontrada. <Link to="/admin">Voltar</Link></div>
  }

  const teams = listTeams().filter((t) => t.name !== CLUB_TEAM) // a nossa equipa nunca entra
  const matches = listMatches(jornada.id)
  const done = matches.filter(matchDone).length
  const finished = jornadaFinished(jornada.id)
  const locked = isLocked(jornada)

  function add() {
    if (!home || !away || home === away) { alert('Escolhe duas equipas diferentes.'); return }
    addMatch(jornada!.id, home, away)
    setHome(''); setAway('')
  }

  return (
    <>
      <Link to="/admin" className="back-link"><Icon name="arrow_back" /> Administração</Link>

      <div className="spread" style={{ margin: '8px 0 20px' }}>
        <h2 className="page-title">{jornadaLabel(jornada)}</h2>
        {finished
          ? <span className="badge badge-green">Terminada</span>
          : locked ? <span className="badge badge-grey">Por lançar</span>
          : <span className="badge badge-yellow">A apostar</span>}
      </div>

      <div className="card">
        <div className="spread" style={{ marginBottom: 12 }}>
          <p className="card-title" style={{ margin: 0 }}>Resultados</p>
          <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{done}/{matches.length}</span>
        </div>
        <div className="progress"><div style={{ width: matches.length ? `${(done / matches.length) * 100}%` : 0 }} /></div>

        {matches.length === 0 ? (
          <p className="muted" style={{ fontSize: 14, margin: '12px 0 0' }}>Sem jogos nesta jornada.</p>
        ) : (
          matches.map((m) => <ScoreRow key={m.id} m={m} />)
        )}

        {finished ? (
          <div className="notice" style={{ marginTop: 14, borderColor: 'var(--green)', color: 'var(--green)' }}>
            <Icon name="check_circle" /> Jornada terminada — vencedores já apurados.
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 12, margin: '14px 0 0' }}>
            Mete os golos de cada equipa. Grava sozinho ao sair do campo. Com todos preenchidos, a jornada fica terminada.
          </p>
        )}
      </div>

      <div className="card">
        <p className="card-title">Fecho das apostas</p>
        <input
          type="datetime-local"
          value={toLocalInput(jornada.deadline)}
          onChange={(e) => e.target.value && updateJornadaDeadline(jornada.id, fromLocalInput(e.target.value))}
        />
        <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>Por norma sábado às 09:00. Depois disto ninguém altera palpites.</p>
      </div>

      <div className="card">
        <button type="button" className="spread link-btn" onClick={() => setShowAdd((v) => !v)} aria-expanded={showAdd}>
          <span className="card-title" style={{ margin: 0 }}>Jogos ({matches.length})</span>
          <Icon name={showAdd ? 'expand_less' : 'expand_more'} />
        </button>
        {showAdd && (
          <div style={{ marginTop: 12 }}>
            {matches.map((m) => (
              <div className="list-item" key={m.id}>
                <span style={{ flex: 1, fontSize: 14 }}>{teamName(m.homeTeamId)} <span className="muted">vs</span> {teamName(m.awayTeamId)}</span>
                <button className="icon-only" aria-label="Apagar jogo" onClick={() => { if (confirm('Apagar este jogo?')) deleteMatch(m.id) }}>
                  <Icon name="delete" />
                </button>
              </div>
            ))}
            <div className="field" style={{ marginTop: 12 }}>
              <label>Casa</label>
              <select value={home} onChange={(e) => setHome(e.target.value)}>
                <option value="">— escolher —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Fora</label>
              <select value={away} onChange={(e) => setAway(e.target.value)}>
                <option value="">— escolher —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button className="btn btn-yellow" onClick={add}>Adicionar jogo</button>
          </div>
        )}
      </div>

      <button className="btn btn-danger" onClick={async () => {
        if (confirm(`Apagar ${jornadaLabel(jornada)} e todos os palpites dela?`)) { await deleteJornada(jornada.id); navigate('/admin') }
      }}>
        Apagar jornada
      </button>
    </>
  )
}
