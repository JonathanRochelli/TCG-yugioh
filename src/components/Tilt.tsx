import { useRef, type PointerEvent, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Amplitude d'inclinaison en degrés. */
  max?: number
}

/**
 * Enveloppe une carte d'un effet d'inclinaison 3D + reflet qui suit le
 * pointeur (souris ou doigt). Purement visuel.
 */
export function Tilt({ children, className = '', max = 12 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - py) * 2 * max}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 2 * max}deg`)
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
    el.classList.add('tilt--active')
  }

  function reset() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.classList.remove('tilt--active')
  }

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
      <div className="tilt__glare" />
    </div>
  )
}
