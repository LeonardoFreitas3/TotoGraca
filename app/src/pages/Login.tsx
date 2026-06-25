import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { currentUser, login } from '../store'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (currentUser()) return <Navigate to="/" replace />

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = login(email, password)
    if (res.ok) navigate('/')
    else setError(res.error ?? 'Erro ao entrar.')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <Crest className="crest" />
        <h1>TotoGraça</h1>
        <p>Águias da Graça</p>
        <div className="bar-yellow" />
      </div>

      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="field">
          <label>Palavra-passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">Entrar</button>
      </form>

      <p className="center" style={{ marginTop: 18 }}>
        <Link to="/registo">Ainda não tens conta? Criar conta</Link>
      </p>

      <div className="notice" style={{ marginTop: 18, fontSize: 12 }}>
        <strong>Demonstração:</strong> admin@totograca.pt / <code>admin</code> &nbsp;·&nbsp; toze@graca.pt / <code>123</code>
      </div>
    </div>
  )
}
