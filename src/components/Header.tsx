import { useState } from 'react'
import type { View } from '../App'
import { isMuted, setMuted } from '../game/sound'

interface Props {
  coins: number
  packsRemaining: number
  maxPacks: number
  view: View
  onNavigate: (view: View) => void
  collectionCount: number
  onOpenSettings: () => void
}

export function Header({
  coins,
  packsRemaining,
  maxPacks,
  view,
  onNavigate,
  collectionCount,
  onOpenSettings,
}: Props) {
  const [muted, setMutedState] = useState(isMuted())

  function toggleSound() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <header className="header">
      <div className="header__brand" onClick={() => onNavigate('sets')}>
        <span className="header__emblem">𓂀</span>
        <div>
          <div className="header__title">Yu-Gi-Oh Boosters</div>
          <div className="header__subtitle muted">Ouvre. Collectionne. Brille.</div>
        </div>
      </div>

      <nav className="header__nav">
        <button
          className={view === 'sets' ? '' : 'secondary'}
          onClick={() => onNavigate('sets')}
        >
          Boutique
        </button>
        <button
          className={view === 'catalog' ? '' : 'secondary'}
          onClick={() => onNavigate('catalog')}
        >
          Catalogue
        </button>
        <button
          className={view === 'collection' ? '' : 'secondary'}
          onClick={() => onNavigate('collection')}
        >
          Collection {collectionCount > 0 && <span className="pill">{collectionCount}</span>}
        </button>
        <button
          className={view === 'profile' ? '' : 'secondary'}
          onClick={() => onNavigate('profile')}
        >
          Profil
        </button>
      </nav>

      <div className="header__stats">
        <div className="stat" title="Pièces">
          <span className="stat__icon">🪙</span>
          <span className="stat__value">{coins}</span>
        </div>
        <div className="stat" title="Paquets restants aujourd'hui">
          <span className="stat__icon">📦</span>
          <span className="stat__value">
            {packsRemaining}/{maxPacks}
          </span>
        </div>
        <button
          className="icon-btn secondary"
          onClick={toggleSound}
          title={muted ? 'Activer le son' : 'Couper le son'}
          aria-label="Son"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="icon-btn secondary"
          onClick={onOpenSettings}
          title="Sauvegarde / réglages"
          aria-label="Réglages"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
