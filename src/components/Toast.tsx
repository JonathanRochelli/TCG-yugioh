import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type ToastKind = 'info' | 'success' | 'reward' | 'error'

interface Toast {
  id: number
  text: string
  kind: ToastKind
}

interface ToastCtx {
  notify: (text: string, kind?: ToastKind) => void
}

const Ctx = createContext<ToastCtx>({ notify: () => {} })

/** Hook pour émettre des notifications éphémères. */
export function useToast(): ToastCtx {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((text: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, kind }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4200)
  }, [])

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="toast-host" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
