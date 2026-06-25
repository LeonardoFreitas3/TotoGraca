import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { register } from '../store'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = register(name, email, password)
    if (res.ok) setDone(true)
    else setError(res.error ?? 'Erro ao criar conta.')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <Crest className="crest" />
        <h1>Criar conta</h1>
        <p>TotoGraça · Águias da Graça</p>
        <div className="bar-yellow" />
      </div>

      {done ? (
        <>
          <div className="notice center">
            <i className="ti ti-clock" style={{ fontSize: 22 }} /><br />
            Conta criada! Fica à espera que o admin a aprove. Depois já consegues entrar.
          </div>
          <p className="center" style={{ marginTop: 18 }}>
            <Link to="/login">Voltar a entrar</Link>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={submit}>
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
            <button className="btn" type="submit">Criar conta</button>
          </form>
          <p className="center" style={{ marginTop: 18 }}>
            <Link to="/login">Já tens conta? Entrar</Link>
          </p>
        </>
      )}
    </div>
  )
}
