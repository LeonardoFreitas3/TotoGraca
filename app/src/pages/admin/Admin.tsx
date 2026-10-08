import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  addJornada,
  addTeam,
  approveUser,
  approvedUsers,
  deleteTeam,
  deleteUser,
  isLocked,
  jornadaFinished,
  listJornadas,
  listMatches,
  listTeams,
  matchDone,
  nextJornadaNumber,
  nextSaturday9,
  owedByUser,
  pendingUsers,
  rejectUser,
} from '../../store'
import { fmtDeadline } from '../../utils'
import { MultasTab } from './Multas'

type Tab = 'jornadas' | 'users' | 'teams' | 'multas'

const Icon = ({ name }: { name: string }) => <span className="material-symbols-outlined">{name}</span>

function resultsDone(jornadaId: string) {
  const ms = listMatches(jornadaId)
  return { done: ms.filter(matchDone).length, total: ms.length }
}

export function Admin() {
  const [tab, setTab] = useState<Tab>('jornadas')
  const pending = pendingUsers()
  const jornadas = listJornadas()
  // jornada fechada mas ainda sem resultados todos → é o que o admin tem de fazer
  const toScore = jornadas.find((j) => isLocked(j) && !jornadaFinished(j.id) && listMatches(j.id).length > 0)
  const open = jornadas.find((j) => !isLocked(j))

  return (
    <>
      <h2 className="page-title">Administração</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>Gere jornadas, resultados e jogadores</p>

      {toScore && (
        <Link to={`/admin/jornada/${toScore.id}`} className="admin-cta">
          <Icon name="scoreboard" />
          <div style={{ flex: 1 }}>
            <strong>Lançar resultados — Jornada {toScore.number}</strong>
            <div style={{ fontSize: 13 }}>{resultsDone(toScore.id).done}/{resultsDone(toScore.id).total} jogos com resultado</div>
          </div>
          <Icon name="chevron_right" />
        </Link>
      )}

      {pending.length > 0 && (
        <button type="button" className="admin-cta admin-cta-ghost" onClick={() => setTab('users')}>
          <Icon name="person_add" />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <strong>{pending.length} registo{pending.length > 1 ? 's' : ''} por aprovar</strong>
          </div>
          <Icon name="chevron_right" />
        </button>
      )}

      <div className="bento">
        <div className="stat">
          <div className="stat-label">Jogadores</div>
          <div className="stat-value">{approvedUsers().length}</div>
        </div>
        <div className="stat accent">
          <div className="stat-label">A apostar</div>
          <div className="stat-value">{open ? `J${open.number}` : '—'}</div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'jornadas'} className={`tab${tab === 'jornadas' ? ' active' : ''}`} onClick={() => setTab('jornadas')}>Jornadas</button>
        <button type="button" role="tab" aria-selected={tab === 'users'} className={`tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
          Jogadores{pending.length > 0 && <span className="tab-dot">{pending.length}</span>}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'teams'} className={`tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>Equipas</button>
        <button type="button" role="tab" aria-selected={tab === 'multas'} className={`tab${tab === 'multas' ? ' active' : ''}`} onClick={() => setTab('multas')}>Multas</button>
      </div>

      {tab === 'jornadas' && <JornadasTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'multas' && <MultasTab />}
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
      <button className="btn btn-ghost" onClick={novaJornada} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon name="add" /> Nova jornada
      </button>
      {jornadas.length === 0 && <div className="empty">Sem jornadas.</div>}
      <div className="card" style={{ padding: '4px 16px' }}>
        {jornadas.map((j) => {
          const finished = jornadaFinished(j.id)
          const locked = isLocked(j)
          const r = resultsDone(j.id)
          return (
            <Link to={`/admin/jornada/${j.id}`} key={j.id} className="list-item row-link">
              <div style={{ flex: 1 }}>
                <strong>Jornada {j.number}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  Fecha {fmtDeadline(j.deadline)}{locked && !finished && r.total > 0 && ` · ${r.done}/${r.total} resultados`}
                </div>
              </div>
              {finished
                ? <span className="badge badge-green">Terminada</span>
                : locked ? <span className="badge badge-grey">Por lançar</span>
                : <span className="badge badge-yellow">A apostar</span>}
              <Icon name="chevron_right" />
            </Link>
          )
        })}
      </div>
    </>
  )
}

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

function UsersTab() {
  const [q, setQ] = useState('')
  const pending = pendingUsers()
  const approved = approvedUsers()
    .filter((u) => u.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      {pending.length > 0 && (
        <div className="card">
          <p className="card-title">Por aprovar ({pending.length})</p>
          {pending.map((u) => (
            <div className="list-item" key={u.id}>
              <span className="avatar">{initials(u.name)}</span>
              <div style={{ flex: 1 }}>{u.name}</div>
              <button className="btn btn-yellow btn-sm" onClick={() => approveUser(u.id)}>Aceitar</button>
              <button className="btn btn-danger btn-sm" aria-label={`Recusar ${u.name}`} onClick={() => rejectUser(u.id)}><Icon name="close" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <p className="card-title">Jogadores ({approvedUsers().length})</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar jogador…" style={{ marginBottom: 4 }} />
        {approved.length === 0 ? (
          <p className="muted" style={{ margin: '12px 0 0', fontSize: 14 }}>Ninguém encontrado.</p>
        ) : (
          approved.map((u) => (
            <div className="list-item" key={u.id}>
              <span className="avatar">{initials(u.name)}</span>
              <div style={{ flex: 1 }}>{u.name}</div>
              {owedByUser(u.id) > 0 && <span className="badge badge-red">Deve {owedByUser(u.id).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>}
              <button className="icon-only" aria-label={`Remover ${u.name}`} onClick={() => { if (confirm(`Remover ${u.name}? Os palpites dele também são apagados.`)) deleteUser(u.id) }}>
                <Icon name="delete" />
              </button>
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

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addTeam(name)
    setName('')
  }

  return (
    <>
      <form className="card" onSubmit={submit}>
        <p className="card-title">Adicionar equipa</p>
        <div className="row">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da equipa" />
          <button className="btn btn-yellow btn-sm" type="submit" style={{ height: 46 }}><Icon name="add" /></button>
        </div>
      </form>
      <div className="card">
        <p className="card-title">Equipas da série ({teams.length})</p>
        {teams.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Sem equipas.</p>
        ) : (
          teams.map((t) => (
            <div className="list-item" key={t.id}>
              <span style={{ flex: 1 }}>{t.name}</span>
              <button className="icon-only" aria-label={`Remover ${t.name}`} onClick={() => { if (confirm(`Remover ${t.name}?`)) deleteTeam(t.id) }}>
                <Icon name="delete" />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  )
}
