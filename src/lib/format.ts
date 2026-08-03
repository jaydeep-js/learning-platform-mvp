/* Duration formatting — identical output to New-Design/assets/js/data.js fmtMins:
   "45m", "3h 20m" (zero-padded minutes < 10), "5h". */
export function fmtMins(m: number): string {
  const h = Math.floor(m / 60)
  const r = m % 60
  if (!h) return `${r}m`
  return `${h}h${r ? ` ${r < 10 ? '0' : ''}${r}m` : ''}`
}
