import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Crest } from './Crest'
import { currentUser, owedByUser } from '../store'

function Icon({ name, fill }: { name: string; fill?: boolean }) {
  return <span className={`material-symbols-outlined${fill ? ' ms-fill' : ''}`}>{name}</span>
}

export function Layout({ children }: { children: ReactNode }) {
  const me = currentUser()
  const deve = me ? owedByUser(me.id) > 0 : false

  return (
    <div className="app">
      <header className="topbar">
        <Crest className="crest" />
        <span className="title">TotoGraça</span>
        <Link to="/perfil" className="icon-btn" aria-label={deve ? 'O meu perfil (tens multas por pagar)' : 'O meu perfil'}>
          <Icon name="account_circle" />
          {deve && <span className="notif-dot" />}
        </Link>
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
