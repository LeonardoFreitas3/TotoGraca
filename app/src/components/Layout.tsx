import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Crest } from './Crest'
import { currentUser, logout } from '../store'

export function Layout({ children }: { children: ReactNode }) {
  const me = currentUser()
  const navigate = useNavigate()

  return (
    <div className="app">
      <header className="topbar">
        <Crest className="crest" />
        <div className="title">
          TotoGraça
          <div className="sub">Águias da Graça</div>
        </div>
        <button
          className="icon-btn"
          aria-label="Sair"
          onClick={() => { logout(); navigate('/login') }}
        >
          <i className="ti ti-logout" />
        </button>
      </header>

      <main className="content">{children}</main>

      <nav className="bottomnav">
        <NavLink to="/" end>
          <i className="ti ti-ballpen" />
          Jornada
        </NavLink>
        <NavLink to="/jornadas">
          <i className="ti ti-list-check" />
          Jornadas
        </NavLink>
        {me?.role !== 'admin' && (
          <NavLink to="/historico">
            <i className="ti ti-history" />
            Histórico
          </NavLink>
        )}
        {me?.role === 'admin' && (
          <NavLink to="/admin">
            <i className="ti ti-settings" />
            Admin
          </NavLink>
        )}
      </nav>
    </div>
  )
}
