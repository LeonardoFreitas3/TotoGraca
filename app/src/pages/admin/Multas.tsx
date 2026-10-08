import { Fragment, useState, type FormEvent } from 'react'
import { addCotaToAll, addFine, approvedUsers, deleteFine, listFines, setFinePaid } from '../../store'
import { COTA_CODE, COTA_VALUE, FINE_TABLE, fineLabel, type Fine, type User } from '../../types'

const Icon = ({ name }: { name: string }) => <span className="material-symbols-outlined">{name}</span>

const eur = (n: number) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
const pad = (n: number) => String(n).padStart(2, '0')
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
const monthLabel = (m: string) => {
  const [y, mo] = m.split('-').map(Number)
  const s = new Date(y, mo - 1, 1).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  return s[0].toUpperCase() + s.slice(1)
}
const shiftMonth = (m: string, by: number) => {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 1 + by, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}
const fmtDay = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7)
const sum = (fs: Fine[]) => fs.reduce((t, f) => t + f.amount, 0)

interface Group { user: User; fines: Fine[]; total: number; paid: number }

export function MultasTab() {
  const [month, setMonth] = useState(todayISO().slice(0, 7))
  const [userId, setUserId] = useState('')
  const [code, setCode] = useState('A')
  const [date, setDate] = useState(todayISO())

  const users = approvedUsers().sort((a, b) => a.name.localeCompare(b.name))
  const fines = listFines(month)
  const groups: Group[] = users
    .map((user) => { const fs = fines.filter((f) => f.userId === user.id); return { user, fines: fs, total: sum(fs), paid: sum(fs.filter((f) => f.paid)) } })
    .filter((g) => g.fines.length > 0)
  const total = sum(fines), paid = sum(fines.filter((f) => f.paid))
  const semCota = users.length - new Set(fines.filter((f) => f.code === COTA_CODE).map((f) => f.userId)).size

  function changeMonth(by: number) {
    const m = shiftMonth(month, by)
    setMonth(m)
    setDate(m === todayISO().slice(0, 7) ? todayISO() : `${m}-01`)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!userId || !date) return
    await addFine(userId, code, FINE_TABLE[code].value, date)
    if (date.slice(0, 7) !== month) setMonth(date.slice(0, 7))
  }

  return (
    <>
      <div className="spread card" style={{ padding: '6px 8px' }}>
        <button type="button" className="icon-only" aria-label="Mês anterior" onClick={() => changeMonth(-1)}><Icon name="chevron_left" /></button>
        <strong>{monthLabel(month)}</strong>
        <button type="button" className="icon-only" aria-label="Mês seguinte" onClick={() => changeMonth(1)}><Icon name="chevron_right" /></button>
      </div>

      {semCota > 0 && (
        <button type="button" className="admin-cta admin-cta-ghost" onClick={() => { if (confirm(`Lançar a cota de ${eur(COTA_VALUE)} de ${monthLabel(month)} a ${semCota} jogador${semCota > 1 ? 'es' : ''}?`)) addCotaToAll(month) }}>
          <Icon name="payments" />
          <div style={{ flex: 1, textAlign: 'left' }}><strong>Lançar cota mensal</strong><div style={{ fontSize: 13 }}>{semCota} jogador{semCota > 1 ? 'es' : ''} sem cota em {monthLabel(month)}</div></div>
          <Icon name="chevron_right" />
        </button>
      )}

      <form className="card" onSubmit={submit}>
        <p className="card-title">Nova multa</p>
        <div className="field">
          <label>Jogador</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">— escolher —</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Multa</label>
          <select value={code} onChange={(e) => setCode(e.target.value)}>
            {Object.entries(FINE_TABLE).map(([c, f]) => <option key={c} value={c}>{c} · {eur(f.value)} · {f.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <button className="btn btn-yellow" type="submit" disabled={!userId}>Adicionar multa</button>
      </form>

      <div className="bento">
        <div className="stat"><div className="stat-label">Total do mês</div><div className="stat-value" style={{ fontSize: 24 }}>{eur(total)}</div></div>
        <div className="stat accent"><div className="stat-label">Em dívida</div><div className="stat-value" style={{ fontSize: 24 }}>{eur(total - paid)}</div></div>
      </div>

      {groups.length === 0 && <div className="empty">Sem multas em {monthLabel(month)}.</div>}
      {groups.map((g) => (
        <div className="card" key={g.user.id}>
          <div className="spread" style={{ marginBottom: 4 }}>
            <p className="card-title" style={{ margin: 0 }}>{g.user.name}</p>
            <span className={`badge ${g.paid >= g.total ? 'badge-green' : 'badge-red'}`}>
              {g.paid >= g.total ? 'Pago' : `Deve ${eur(g.total - g.paid)}`} · {eur(g.total)}
            </span>
          </div>
          {g.fines.map((f) => (
            <div className="list-item" key={f.id} style={{ padding: '10px 0' }}>
              <label className="row" style={{ flex: 1, gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={f.paid} onChange={(e) => setFinePaid(f.id, e.target.checked)} aria-label="Paga" style={{ width: 20, height: 20, padding: 0 }} />
                <span style={{ flex: 1, fontSize: 14, textDecoration: f.paid ? 'line-through' : 'none', color: f.paid ? 'var(--muted)' : 'inherit' }}>
                  {f.code !== COTA_CODE && <strong>{f.code} </strong>}{fineLabel(f.code)}
                  <span className="muted" style={{ fontSize: 12 }}> · {fmtDay(f.date)}</span>
                </span>
                <strong style={{ fontSize: 14 }}>{eur(f.amount)}</strong>
              </label>
              <button className="icon-only" aria-label="Apagar multa" onClick={() => { if (confirm('Apagar esta multa?')) deleteFine(f.id) }}><Icon name="delete" /></button>
            </div>
          ))}
        </div>
      ))}

      {groups.length > 0 && (
        <button className="btn btn-ghost" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="picture_as_pdf" /> Descarregar PDF
        </button>
      )}

      {/* Folha só visível ao imprimir (window.print → "Guardar como PDF") */}
      <div className="print-sheet">
        <h1>Águias da Graça — Multas</h1>
        <p className="print-sub">{monthLabel(month)} · emitido a {fmtDay(todayISO())}/{todayISO().slice(0, 4)}</p>
        <table>
          <thead><tr><th>Jogador</th><th>Data</th><th>Multa</th><th className="num">Valor</th><th>Pago</th></tr></thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.user.id}>
                {g.fines.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i === 0 ? g.user.name : ''}</td>
                    <td>{fmtDay(f.date)}</td>
                    <td>{f.code === COTA_CODE ? fineLabel(f.code) : `${f.code} — ${fineLabel(f.code)}`}</td>
                    <td className="num">{eur(f.amount)}</td>
                    <td>{f.paid ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
                <tr className="subtotal">
                  <td colSpan={3}>Total {g.user.name}{g.paid < g.total && ` · em dívida ${eur(g.total - g.paid)}`}</td>
                  <td className="num">{eur(g.total)}</td>
                  <td>{g.paid >= g.total ? 'Sim' : 'Não'}</td>
                </tr>
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Total do mês</td><td className="num">{eur(total)}</td><td /></tr>
            <tr><td colSpan={3}>Pago</td><td className="num">{eur(paid)}</td><td /></tr>
            <tr><td colSpan={3}>Em dívida</td><td className="num">{eur(total - paid)}</td><td /></tr>
          </tfoot>
        </table>
        <p className="print-note">Todas as multas devem ser pagas na primeira quarta-feira após o clube ter pago o salário de cada um, caso contrário o somatório total das multas do mês dobra.</p>
      </div>
    </>
  )
}
