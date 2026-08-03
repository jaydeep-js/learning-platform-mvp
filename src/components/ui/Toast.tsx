import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import Icon from '../icons/Icon'

const ToastContext = createContext<(msg: string) => void>(() => {})

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}

/* Single shared toast, same behavior as the prototype: 2600ms auto-hide,
   one timer, later calls replace the message. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const toast = useCallback((m: string) => {
    setMsg(m)
    setShow(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={show ? 'toast show' : 'toast'} role="status" aria-live="polite">
        <Icon name="check-circle" />
        <span>{msg}</span>
      </div>
    </ToastContext.Provider>
  )
}
