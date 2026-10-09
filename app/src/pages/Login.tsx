import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { currentUser, login, register } from '../store'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [signup, setSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState('')

  if (currentUser()) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = signup ? await register(name, email, password) : await login(username, password)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Erro.')
    else if (signup) { setSignup(false); setPassword(''); setDone('Conta criada. Confirma o email que te enviámos; depois o admin aprova e já podes entrar com o email.') }
    else navigate('/')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <Crest className="crest" />
        <h1>TotoGraça</h1>
        <p>Águias da Graça</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        {signup ? (
          <>
            <div className="field">
              <label>Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" required />
            </div>
          </>
        ) : (
          <div className="field">
            <label>Utilizador ou email</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" />
          </div>
        )}
        <div className="field">
          <label>Palavra-passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={signup ? 'new-password' : 'current-password'} />
        </div>
        {error && <div className="error">{error}</div>}
        {done && <div className="notice">{done}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Aguarda…' : signup ? 'Criar conta' : 'Entrar'}</button>
      </form>

      <p className="center" style={{ marginTop: 16 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setSignup(!signup); setError(''); setDone('') }}>
          {signup ? 'Já tenho conta' : 'Sou adepto, quero criar conta'}
        </a>
      </p>
    </div>
  )
}
