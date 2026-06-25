import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addMatch,
  deleteMatch,
  getJornada,
  listMatches,
  listTeams,
  setMatchScore,
  teamName,
  updateJornadaDeadline,
} from '../../store'
import { fromLocalInput, toLocalInput } from '../../utils'

export function AdminJornada() {
  const { id } = useParams()
  const jornada = id ? getJornada(id) : null
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')

  if (!jornada) {
    return <div className="empty">Jornada não encontrada. <Link to="/admin">Voltar</Link></div>
  }

  const teams = listTeams()
  const matches = listMatches(jornada.id)

  function add() {
    if (!home || !away || home === away) { alert('Escolhe duas equipas diferentes.'); return }
    addMatch(jornada!.id, home, away)
    setHome(''); setAway('')
  }

  return (
    <>
      <p style={{ marginTop: 0 }}>
        <Link to="/admin"><i className="ti ti-arrow-left" /> Administração</Link>
      </p>
      <h2 style={{ marginTop: 0 }}>Jornada {jornada.number}</h2>

      <div className="card">
        <p className="card-title">Fecho das apostas</p>
        <input
          type="datetime-local"
          value={toLocalInput(jornada.deadline)}
          onChange={(e) => updateJornadaDeadline(jornada.id, fromLocalInput(e.target.value))}
        />
        <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
          Por norma é sábado às 09:00. Depois desta hora ninguém pode alterar os palpites.
        </p>
      </div>

      <div className="card">
        <p className="card-title">Adicionar jogo</p>
        {teams.length < 2 ? (
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            Primeiro adiciona equipas no separador <strong>Equipas</strong>.
          </p>
        ) : (
          <>
            <div className="field">
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
            <button className="btn btn-yellow" onClick={add}><i className="ti ti-plus" /> Adicionar jogo</button>
          </>
        )}
      </div>

      <div className="card">
        <p className="card-title">Jogos e resultados ({matches.length})</p>
        {matches.length === 0 ? (
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>Sem jogos nesta jornada.</p>
        ) : (
          matches.map((m) => (
            <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div className="spread" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {teamName(m.homeTeamId)} <span className="muted">vs</span> {teamName(m.awayTeamId)}
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Apagar jogo?')) deleteMatch(m.id) }}>
                  <i className="ti ti-trash" />
                </button>
              </div>
              <div className="row">
                <input
                  type="number" min={0} placeholder="–" style={{ width: 64, textAlign: 'center' }}
                  value={m.homeScore ?? ''}
                  onChange={(e) => setMatchScore(m.id, e.target.value === '' ? null : Number(e.target.value), m.awayScore)}
                />
                <span>–</span>
                <input
                  type="number" min={0} placeholder="–" style={{ width: 64, textAlign: 'center' }}
                  value={m.awayScore ?? ''}
                  onChange={(e) => setMatchScore(m.id, m.homeScore, e.target.value === '' ? null : Number(e.target.value))}
                />
                <span className="muted" style={{ fontSize: 12 }}>resultado final</span>
              </div>
            </div>
          ))
        )}
        <p className="muted" style={{ fontSize: 12, margin: '12px 0 0' }}>
          Preenche os resultados de <strong>todos</strong> os jogos para a jornada ficar terminada e apurar quem acertou a chave.
        </p>
      </div>
    </>
  )
}
