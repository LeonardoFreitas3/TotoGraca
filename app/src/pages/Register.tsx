import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { register } from '../store'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await register(name, email, password)
    setBusy(false)
    if (res.ok) setDone(true)
    else setError(res.error ?? 'Erro ao criar conta.')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <Crest className="crest" />
        <h1>Criar conta</h1>
        <p>TotoGraça</p>
      </div>

      {done ? (
        <>
          <div className="auth-card center">
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--yellow)' }}>schedule</span>
            <p style={{ marginBottom: 0 }}>Conta criada! Fica à espera que o admin a aprove. Depois já consegues entrar.</p>
          </div>
          <p className="center" style={{ marginTop: 18 }}><Link to="/login">Voltar a entrar</Link></p>
        </>
      ) : (
        <>
          <form className="auth-card" onSubmit={submit}>
            <div className="field">
              <label>Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="field">
              <label>Palavra-passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <div className="error">{error}</div>}
            <button className="btn" type="submit" disabled={busy}>{busy ? 'A criar…' : 'Criar conta'}</button>
          </form>
          <p className="center" style={{ marginTop: 18 }}><Link to="/login">Já tens conta? Entrar</Link></p>
        </>
      )}
    </div>
  )
}
