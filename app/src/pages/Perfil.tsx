import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, currentUser, currentUsername, logout, owedByUser, unpaidFines, updateMyName } from '../store'
import { CLUB_FULL_NAME, COTA_CODE, PAY_HINT, PRIZE, fineLabel } from '../types'

const eur = (n: number) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
const fmtDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

export function Perfil() {
  const me = currentUser()!
  const navigate = useNavigate()

  const [name, setName] = useState(me.name)
  const [nameMsg, setNameMsg] = useState('')

  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const divida = me.role === 'admin' ? [] : unpaidFines(me.id)

  async function saveName(e: FormEvent) {
    e.preventDefault()
    setNameMsg('')
    const res = await updateMyName(name)
    setNameMsg(res.ok ? 'Nome atualizado.' : (res.error ?? 'Erro.'))
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault()
    setPwMsg('')
    if (pw1 !== pw2) { setPwMsg('As palavras-passe não coincidem.'); return }
    setBusy(true)
    const res = await changePassword(pw1)
    setBusy(false)
    if (res.ok) { setPw1(''); setPw2(''); setPwMsg('Palavra-passe alterada!') }
    else setPwMsg(res.error ?? 'Erro.')
  }

  return (
    <>
      <h2 className="page-title">O meu perfil</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>Utilizador: <strong>{currentUsername()}</strong></p>

      {me.role === 'adepto' && (
        <div className="card">
          <p className="card-title">Cota de jornada</p>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>{PAY_HINT}, por jornada. Quando o admin confirmar, apostas nessa jornada. Chave certa ganha {PRIZE} €, a levantar na {CLUB_FULL_NAME}.</p>
        </div>
      )}

      {me.role === 'user' && (
        <div className="card" style={divida.length ? { borderColor: 'var(--red)' } : undefined}>
          <div className="spread" style={{ marginBottom: divida.length ? 4 : 0 }}>
            <p className="card-title" style={{ margin: 0 }}>Multas e cotas</p>
            <span className={`badge ${divida.length ? 'badge-red' : 'badge-green'}`}>{divida.length ? `Deves ${eur(owedByUser(me.id))}` : 'Tudo pago'}</span>
          </div>
          {divida.map((f) => (
            <div className="list-item" key={f.id} style={{ padding: '10px 0' }}>
              <span style={{ flex: 1, fontSize: 14 }}>
                {f.code !== COTA_CODE && <strong>{f.code} </strong>}{fineLabel(f.code)}
                <span className="muted" style={{ fontSize: 12 }}> · {fmtDay(f.date)}</span>
              </span>
              <strong style={{ fontSize: 14 }}>{eur(f.amount)}</strong>
            </div>
          ))}
          {divida.length > 0 && <p className="muted" style={{ fontSize: 12, margin: '10px 0 0' }}>Paga ao delegado até à primeira quarta-feira depois do salário, senão o total do mês dobra.</p>}
        </div>
      )}

      <form className="card" onSubmit={saveName}>
        <p className="card-title">Nome</p>
        <div className="field">
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="btn btn-yellow" type="submit">Guardar nome</button>
        {nameMsg && <p className="center" style={{ marginBottom: 0, marginTop: 10, fontSize: 13 }}>{nameMsg}</p>}
      </form>

      <form className="card" onSubmit={savePassword}>
        <p className="card-title">Mudar palavra-passe</p>
        <div className="field">
          <label>Nova palavra-passe</label>
          <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="field">
          <label>Repetir</label>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'A guardar…' : 'Alterar palavra-passe'}</button>
        {pwMsg && <p className="center" style={{ marginBottom: 0, marginTop: 10, fontSize: 13 }}>{pwMsg}</p>}
      </form>

      <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>
        Terminar sessão
      </button>
    </>
  )
}
