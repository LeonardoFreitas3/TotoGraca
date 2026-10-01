import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, currentUser, currentUsername, logout, updateMyName } from '../store'

export function Perfil() {
  const me = currentUser()!
  const navigate = useNavigate()

  const [name, setName] = useState(me.name)
  const [nameMsg, setNameMsg] = useState('')

  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [busy, setBusy] = useState(false)

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
