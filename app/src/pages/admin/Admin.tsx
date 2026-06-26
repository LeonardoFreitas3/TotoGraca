import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addJornada,
  addTeam,
  approveUser,
  approvedUsers,
  deleteJornada,
  deleteTeam,
  deleteUser,
  isLocked,
  jornadaFinished,
  listJornadas,
  listTeams,
  nextJornadaNumber,
  nextSaturday9,
  pendingUsers,
  rejectUser,
} from '../../store'
import { fmtDeadline } from '../../utils'

type Tab = 'users' | 'teams' | 'jornadas'

export function Admin() {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Administração</h2>
      <div className="tabs">
        <div className={`tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>Utilizadores</div>
        <div className={`tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>Equipas</div>
        <div className={`tab${tab === 'jornadas' ? ' active' : ''}`} onClick={() => setTab('jornadas')}>Jornadas</div>
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'jornadas' && <JornadasTab />}
    </>
  )
}

function UsersTab() {
  const pending = pendingUsers()
  const approved = approvedUsers()
  return (
    <>
      <div className="card">
        <p className="card-title">Registos por aprovar ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Nada pendente.</p>
        ) : (
          pending.map((u) => (
            <div className="list-item" key={u.id}>
              <div style={{ flex: 1 }}>{u.name}</div>
              <button className="btn btn-yellow btn-sm" onClick={() => approveUser(u.id)}>Aceitar</button>
              <button className="btn btn-danger btn-sm" onClick={() => rejectUser(u.id)}>Recusar</button>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <p className="card-title">Jogadores aprovados ({approved.length})</p>
        {approved.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Ainda ninguém.</p>
        ) : (
          approved.map((u) => (
            <div className="list-item" key={u.id}>
              <div style={{ flex: 1 }}>{u.name}</div>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Remover ${u.name}?`)) deleteUser(u.id) }}>Remover</button>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function TeamsTab() {
  const [name, setName] = useState('')
  const teams = listTeams()
  return (
    <>
      <div className="card">
        <p className="card-title">Adicionar equipa (sorteio 2026/2027)</p>
        <div className="row">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da equipa" />
          <button className="btn btn-yellow btn-sm" onClick={() => { addTeam(name); setName('') }}>Juntar</button>
        </div>
      </div>
      <div className="card">
        <p className="card-title">Equipas ({teams.length})</p>
        {teams.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Sem equipas. Adiciona as da tua série.</p>
        ) : (
          teams.map((t) => (
            <div className="list-item" key={t.id}>
              <span style={{ flex: 1 }}>{t.name}</span>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Remover ${t.name}?`)) deleteTeam(t.id) }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function JornadasTab() {
  const navigate = useNavigate()
  const jornadas = listJornadas()

  async function novaJornada() {
    const j = await addJornada(nextJornadaNumber(), nextSaturday9())
    if (j) navigate(`/admin/jornada/${j.id}`)
  }

  return (
    <>
      <button className="btn" onClick={novaJornada} style={{ marginBottom: 14 }}>
        <i className="ti ti-plus" /> Nova jornada
      </button>
      {jornadas.length === 0 && <div className="empty">Sem jornadas.</div>}
      {jornadas.map((j) => {
        const finished = jornadaFinished(j.id)
        const locked = isLocked(j)
        return (
          <div className="card" key={j.id} style={{ marginBottom: 10 }}>
            <div className="spread">
              <div style={{ flex: 1 }} onClick={() => navigate(`/admin/jornada/${j.id}`)}>
                <strong>Jornada {j.number}</strong>
                <div className="muted" style={{ fontSize: 12 }}>Fecha {fmtDeadline(j.deadline)}</div>
              </div>
              {finished
                ? <span className="badge badge-green">Terminada</span>
                : locked ? <span className="badge badge-grey">Fechada</span>
                : <span className="badge badge-yellow">A apostar</span>}
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/jornada/${j.id}`)}>Gerir</button>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Apagar jornada ${j.number}?`)) deleteJornada(j.id) }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}
