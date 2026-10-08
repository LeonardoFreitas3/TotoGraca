export function fmtDeadline(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fmtShort(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
}

// para o <input type="datetime-local"> (hora local, sem timezone)
export function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value: string): string {
  return new Date(value).toISOString()
}

export function countdownText(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'Apostas fechadas'
  const mins = Math.floor(ms / 60000)
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (days > 0) return `Fecha em ${days}d ${hours}h`
  if (hours > 0) return `Fecha em ${hours}h ${m}m`
  return `Fecha em ${m}m`
}
