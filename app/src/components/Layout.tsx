import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Crest } from './Crest'
import { currentUser, logout } from '../store'

function Icon({ name, fill }: { name: string; fill?: boolean }) {
  return <span className={`material-symbols-outlined${fill ? ' ms-fill' : ''}`}>{name}</span>
}

export function Layout({ children }: { children: ReactNode }) {
  const me = currentUser()
  const navigate = useNavigate()

  return (
    <div className="app">
      <header className="topbar">
        <Crest className="crest" />
        <span className="title">TotoGraça</span>
        <button className="icon-btn" aria-label="Sair" onClick={() => { logout(); navigate('/login') }}>
          <Icon name="logout" />
        </button>
      </header>

      <main className="content">{children}</main>

      <nav className="bottomnav">
        <NavLink to="/" end>{({ isActive }) => (<><Icon name="sports_football" fill={isActive} />Jornada</>)}</NavLink>
        <NavLink to="/jornadas">{({ isActive }) => (<><Icon name="emoji_events" fill={isActive} />Vencedores</>)}</NavLink>
        {me?.role !== 'admin' && (
          <NavLink to="/historico">{({ isActive }) => (<><Icon name="history" fill={isActive} />Histórico</>)}</NavLink>
        )}
        {me?.role === 'admin' && (
          <NavLink to="/admin">{({ isActive }) => (<><Icon name="admin_panel_settings" fill={isActive} />Admin</>)}</NavLink>
        )}
      </nav>
    </div>
  )
}
