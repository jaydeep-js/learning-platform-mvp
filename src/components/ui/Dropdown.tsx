import { useEffect, useRef, useState, type ReactNode } from 'react'

interface DropdownProps {
  className?: string
  trigger: ReactNode
  children: ReactNode
}

/* .dropdown port: trigger toggles, outside click closes, aria-expanded synced. */
export default function Dropdown({ className, trigger, children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [open])

  return (
    <div ref={ref} className={`dropdown${open ? ' open' : ''}${className ? ` ${className}` : ''}`}>
      <button className="user-chip" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        {trigger}
      </button>
      <div className="dropdown-panel" onClick={() => setOpen(false)}>
        {children}
      </div>
    </div>
  )
}
