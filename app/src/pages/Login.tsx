import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { currentUser, login } from '../store'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (currentUser()) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await login(email, password)
    setBusy(false)
    if (res.ok) navigate('/')
    else setError(res.error ?? 'Erro ao entrar.')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <Crest className="crest" />
        <h1>TotoGraça</h1>
        <p>Águias da Graça</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" autoComplete="email" />
        </div>
        <div className="field">
          <label>Palavra-passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
      </form>

      <p className="center" style={{ marginTop: 18 }}>
        <Link to="/registo">Ainda não tens conta? Criar conta</Link>
      </p>
      <div className="notice center" style={{ marginTop: 16, justifyContent: 'center' }}>
        <span className="material-symbols-outlined">info</span>
        O registo precisa de aprovação do administrador.
      </div>
    </div>
  )
}
