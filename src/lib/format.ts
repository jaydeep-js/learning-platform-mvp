/* Duration formatting — identical output to New-Design/assets/js/data.js fmtMins:
   "45m", "3h 20m" (zero-padded minutes < 10), "5h". */
export function fmtMins(m: number): string {
  const h = Math.floor(m / 60)
  const r = m % 60
  if (!h) return `${r}m`
  return `${h}h${r ? ` ${r < 10 ? '0' : ''}${r}m` : ''}`
}

/* Relative timestamps in the dashboard's "Recently viewed" style:
   "Today, 2:14 PM" · "Yesterday" · "2 days ago" · "Jul 12, 2026". */
export function fmtRelative(iso: string): string {
  const then = new Date(iso)
  const now = new Date()
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dayDiff = Math.round((startOf(now) - startOf(then)) / 86_400_000)
  if (dayDiff <= 0) {
    const time = then.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `Today, ${time}`
  }
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return `${dayDiff} days ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
