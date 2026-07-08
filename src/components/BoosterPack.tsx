import type { KeyboardEvent, ReactNode } from 'react'
import type { SetDef } from '../types'

interface Props {
  set: SetDef
  className?: string
  /** Rend le pack cliquable (rôle bouton + gestion clavier). */
  interactive?: boolean
  onActivate?: () => void
  children?: ReactNode
}

/**
 * Visuel de booster réutilisé dans la boutique et à l'ouverture :
 * bande foil déchirée, reflet holographique, médaillon central et nom du set.
 */
export function BoosterPack({
  set,
  className = '',
  interactive,
  onActivate,
  children,
}: Props) {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate?.()
    }
  }

  return (
    <div
      className={`pack ${className}`}
      style={{
        background: `linear-gradient(160deg, ${set.colors[0]}, ${set.colors[1]})`,
      }}
      onClick={interactive ? onActivate : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
    >
      <div className="pack__foil">
        <span className="pack__foil-text">BOOSTER PACK</span>
      </div>
      <div className="pack__holo" />
      <div className="pack__art">
        <div className="pack__medallion">{set.emblem}</div>
      </div>
      <div className="pack__label">{set.label}</div>
      <div className="pack__shine" />
      {children}
    </div>
  )
}
