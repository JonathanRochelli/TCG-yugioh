import { useState, type KeyboardEvent, type ReactNode } from 'react'
import type { SetDef } from '../types'
import { packImageFor } from '../config/customArt'

interface Props {
  set: SetDef
  className?: string
  /** Rend le pack cliquable (rôle bouton + gestion clavier). */
  interactive?: boolean
  /** Affiche les éléments d'effet de déchirure (éclat + étincelles). */
  tearFx?: boolean
  onActivate?: () => void
  children?: ReactNode
}

const SPARKS = Array.from({ length: 14 })

/**
 * Visuel de booster réutilisé dans la boutique et à l'ouverture :
 * bande foil déchirée, reflet holographique, médaillon central et nom du set.
 * Si `set.packImageUrl` est fourni (et charge), il remplace le visuel généré.
 */
export function BoosterPack({
  set,
  className = '',
  interactive,
  tearFx,
  onActivate,
  children,
}: Props) {
  const [photoBroken, setPhotoBroken] = useState(false)
  const photoUrl = set.packImageUrl ?? packImageFor(set.apiName)
  const usePhoto = Boolean(photoUrl) && !photoBroken

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
      {usePhoto ? (
        <img
          className="pack__photo"
          src={photoUrl}
          alt={set.label}
          draggable={false}
          onError={() => setPhotoBroken(true)}
        />
      ) : (
        <>
          <div className="pack__foil">
            <span className="pack__foil-text">BOOSTER PACK</span>
          </div>
          <div className="pack__holo" />
          <div className="pack__art">
            <div className="pack__medallion">{set.emblem}</div>
          </div>
          <div className="pack__label">{set.label}</div>
        </>
      )}
      <div className="pack__shine" />

      {tearFx && (
        <>
          <div className="pack__flash" />
          <div className="pack__sparks">
            {SPARKS.map((_, i) => (
              <span
                key={i}
                className="spark"
                style={{ ['--a' as string]: `${(360 / SPARKS.length) * i}deg` }}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  )
}
