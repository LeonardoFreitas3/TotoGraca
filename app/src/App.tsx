import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useDB, currentUser } from './store'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { Jornadas } from './pages/Jornadas'
import { JornadaView } from './pages/JornadaView'
import { Historico } from './pages/Historico'
import { Admin } from './pages/admin/Admin'
import { AdminJornada } from './pages/admin/AdminJornada'

function Protected({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) {
  const me = currentUser()
  if (!me) return <Navigate to="/login" replace />
  if (adminOnly && me.role !== 'admin') return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

export function App() {
  useDB() // subscreve ao estado para re-render em login/logout/alterações

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registo" element={<Register />} />

      <Route path="/" element={<Protected><Home /></Protected>} />
      <Route path="/jornadas" element={<Protected><Jornadas /></Protected>} />
      <Route path="/jornada/:id" element={<Protected><JornadaView /></Protected>} />
      <Route path="/historico" element={<Protected><Historico /></Protected>} />

      <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
      <Route path="/admin/jornada/:id" element={<Protected adminOnly><AdminJornada /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
