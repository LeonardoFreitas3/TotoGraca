import { currentUser } from '../store'
import type { User } from '../types'

// Etiqueta "Adepto" ao lado do nome, só para o admin (para saber a quem pagar o prémio)
export function AdeptoTag({ user }: { user: User }) {
  if (user.role !== 'adepto' || currentUser()?.role !== 'admin') return null
  return <span className="badge badge-yellow" style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', verticalAlign: 1 }}>Adepto</span>
}
// versão em texto (para frases): " (adepto)" só para o admin
export const adeptoSuffix = (user: User) => (user.role === 'adepto' && currentUser()?.role === 'admin' ? ' (adepto)' : '')
