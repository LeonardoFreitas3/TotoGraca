import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { InstallHint, isStandalone } from '../components/InstallHint'
import { currentUser, login, register } from '../store'

// Cloudflare Turnstile (anti-robô). Só aparece se VITE_TURNSTILE_SITE_KEY estiver definido no Vercel;
// o Supabase valida o token quando "Captcha protection" está ligado (ver supabase/seguranca.sql).
const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
declare global { interface Window { turnstile?: { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; 'expired-callback'?: () => void }) => string; reset: (id: string) => void } } }

function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!TURNSTILE_KEY || !ref.current) return
    let widgetId: string | undefined
    const render = () => { if (ref.current && window.turnstile && !widgetId) widgetId = window.turnstile.render(ref.current, { sitekey: TURNSTILE_KEY, callback: onToken, 'expired-callback': () => onToken('') }) }
    if (window.turnstile) render()
    else {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true; s.onload = render
      document.head.appendChild(s)
    }
  }, [onToken])
  return <div ref={ref} style={{ marginBottom: 12 }} />
}

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
  const [captcha, setCaptcha] = useState('')
  const [install, setInstall] = useState(false)

  if (currentUser()) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    if (TURNSTILE_KEY && !captcha) { setBusy(false); setError('Confirma que não és um robô.'); return }
    const res = signup ? await register(name, email, password, captcha || undefined) : await login(username, password, captcha || undefined)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Erro.')
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
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} />
        </div>
        {TURNSTILE_KEY && <Turnstile onToken={setCaptcha} />}
        {error && <div className="error">{error}</div>}
        {done && <div className="notice">{done}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Aguarda…' : signup ? 'Criar conta' : 'Entrar'}</button>
      </form>

      <p className="center" style={{ marginTop: 16 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setSignup(!signup); setError(''); setDone('') }}>
          {signup ? 'Já tenho conta' : 'Sou adepto, quero criar conta'}
        </a>
      </p>

      {!isStandalone() && (
        <p className="center muted" style={{ marginTop: 8, fontSize: 13 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setInstall(true) }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3 }}>install_mobile</span> Como instalar a app no telemóvel
          </a>
        </p>
      )}
      {install && <InstallHint open onClose={() => setInstall(false)} />}
    </div>
  )
}
