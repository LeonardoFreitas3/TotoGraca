import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  addJornada,
  addStaff,
  addTeam,
  adeptos,
  approveUser,
  approvedUsers,
  cotaPaid,
  currentJornada,
  deleteStaff,
  deleteTeam,
  deleteUser,
  isLocked,
  jornadaFinished,
  listJornadas,
  listMatches,
  listStaff,
  listTeams,
  matchDone,
  nextJornadaNumber,
  nextSaturday9,
  owedByUser,
  pendingUsers,
  players,
  setAdeptoPaid,
} from '../../store'
import { ADEPTO_COTA, CURRENT_SEASON, PAY_HINT } from '../../types'
import { fmtDeadline, jornadaLabel } from '../../utils'
import { MultasTab } from './Multas'

type Tab = 'jornadas' | 'users' | 'adeptos' | 'teams' | 'multas'

const Icon = ({ name }: { name: string }) => <span className="material-symbols-outlined">{name}</span>

function resultsDone(jornadaId: string) {
  const ms = listMatches(jornadaId)
  return { done: ms.filter(matchDone).length, total: ms.length }
}

export function Admin() {
  const [tab, setTab] = useState<Tab>('jornadas')
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
            <strong>Lançar resultados — {jornadaLabel(toScore)}</strong>
            <div style={{ fontSize: 13 }}>{resultsDone(toScore.id).done}/{resultsDone(toScore.id).total} jogos com resultado</div>
          </div>
          <Icon name="chevron_right" />
        </Link>
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
          Plantel
        </button>
        <button type="button" role="tab" aria-selected={tab === 'adeptos'} className={`tab${tab === 'adeptos' ? ' active' : ''}`} onClick={() => setTab('adeptos')}>
          Adeptos{pendingUsers().length > 0 && <span className="notif-dot" style={{ position: 'static', marginLeft: 4 }} />}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'teams'} className={`tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>Equipas</button>
        <button type="button" role="tab" aria-selected={tab === 'multas'} className={`tab${tab === 'multas' ? ' active' : ''}`} onClick={() => setTab('multas')}>Multas</button>
      </div>

      {tab === 'jornadas' && <JornadasTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'adeptos' && <AdeptosTab />}
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
                <strong>{jornadaLabel(j)}</strong>
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
  const [staffName, setStaffName] = useState('')
  const staff = listStaff()
  const approved = players()
    .filter((u) => u.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="card">
        <p className="card-title">Jogadores ({players().length})</p>
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

      <div className="card">
        <p className="card-title">Equipa técnica ({staff.length})</p>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>Sem conta na app. Entram só nas multas e cotas.</p>
        {staff.map((s) => (
          <div className="list-item" key={s.id}>
            <span className="avatar" style={{ background: 'var(--yellow)', color: 'var(--black)' }}>{initials(s.name.replace(/^(Mister|Dir\. Desp\.)\s+/i, ''))}</span>
            <div style={{ flex: 1 }}>{s.name}</div>
            <button className="icon-only" aria-label={`Remover ${s.name}`} onClick={() => { if (confirm(`Remover ${s.name}? As multas dele também são apagadas.`)) deleteStaff(s.id) }}>
              <Icon name="delete" />
            </button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Nome (ex: Mister …)" />
          <button type="button" className="btn btn-yellow btn-sm" style={{ height: 46 }} onClick={() => { addStaff(staffName); setStaffName('') }}><Icon name="add" /></button>
        </div>
      </div>
    </>
  )
}

function AdeptosTab() {
  const [q, setQ] = useState('')
  const league = listJornadas().filter((j) => j.number !== 0) // adeptos não jogam a Taça
  const [jid, setJid] = useState(() => currentJornada(CURRENT_SEASON, true)?.id ?? league[0]?.id ?? '')
  const jornada = league.find((j) => j.id === jid) ?? null
  const idx = league.findIndex((j) => j.id === jid)
  const pending = pendingUsers()
  const fans = adeptos().sort((a, b) => a.name.localeCompare(b.name))
  const shown = fans.filter((u) => u.name.toLowerCase().includes(q.trim().toLowerCase()))
  const paid = jornada ? fans.filter((u) => cotaPaid(u.id, jornada)).length : 0
  return (
    <>
      {pending.length > 0 && (
        <div className="card">
          <p className="card-title">À espera de aprovação ({pending.length})</p>
          {pending.map((u) => (
            <div className="list-item" key={u.id}>
              <span className="avatar" style={{ background: 'var(--yellow)', color: 'var(--black)' }}>{initials(u.name)}</span>
              <div style={{ flex: 1 }}>{u.name}<div className="muted" style={{ fontSize: 12 }}>{u.email}</div></div>
              <button className="icon-only" aria-label={`Aprovar ${u.name}`} onClick={() => approveUser(u.id)}><Icon name="check_circle" /></button>
              <button className="icon-only" aria-label={`Rejeitar ${u.name}`} onClick={() => { if (confirm(`Rejeitar e apagar a conta de ${u.name}?`)) deleteUser(u.id) }}><Icon name="delete" /></button>
            </div>
          ))}
        </div>
      )}

      {jornada && (
        <div className="spread card" style={{ padding: '6px 8px' }}>
          <button type="button" className="icon-only" aria-label="Jornada anterior" disabled={idx <= 0} onClick={() => setJid(league[idx - 1].id)}><Icon name="chevron_left" /></button>
          <div className="center"><strong>{jornadaLabel(jornada)}</strong><div className="muted" style={{ fontSize: 12 }}>{fmtDeadline(jornada.deadline)}</div></div>
          <button type="button" className="icon-only" aria-label="Jornada seguinte" disabled={idx >= league.length - 1} onClick={() => setJid(league[idx + 1].id)}><Icon name="chevron_right" /></button>
        </div>
      )}

      <div className="card">
        <div className="spread" style={{ marginBottom: 8 }}>
          <p className="card-title" style={{ margin: 0 }}>Adeptos ({fans.length})</p>
          {jornada && <span className="badge badge-green">{paid}/{fans.length} pagos · {(paid * ADEPTO_COTA).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>}
        </div>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>Pagam {PAY_HINT}, por jornada. Marca quem pagou a {jornada ? jornadaLabel(jornada).toLowerCase() : 'jornada'}; só depois apostam nela.</p>
        {fans.length > 5 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar adepto…" style={{ marginBottom: 4 }} />}
        {fans.length === 0 && <p className="muted" style={{ margin: 0, fontSize: 14 }}>Ainda ninguém.</p>}
        {shown.map((u) => {
          const ok = jornada ? cotaPaid(u.id, jornada) : false
          return (
            <div className="list-item" key={u.id}>
              {jornada && <input type="checkbox" checked={ok} aria-label={`${u.name} pagou`} onChange={(e) => setAdeptoPaid(u.id, jornada.id, e.target.checked)} />}
              <div style={{ flex: 1 }}>{u.name}<div className="muted" style={{ fontSize: 12 }}>{u.email}{jornada && ` · ${ok ? 'Pagou' : `${ADEPTO_COTA} € por pagar`}`}</div></div>
              <button className="icon-only" aria-label={`Remover ${u.name}`} onClick={() => { if (confirm(`Remover ${u.name}? Os palpites dele também são apagados.`)) deleteUser(u.id) }}>
                <Icon name="delete" />
              </button>
            </div>
          )
        })}
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
