import type { View } from '../App'

interface Props {
  coins: number
  packsRemaining: number
  maxPacks: number
  view: View
  onNavigate: (view: View) => void
  collectionCount: number
}

export function Header({
  coins,
  packsRemaining,
  maxPacks,
  view,
  onNavigate,
  collectionCount,
}: Props) {
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
      </nav>

      <div className="header__stats">
        <div className="stat" title="Pièces">
          <span className="stat__icon">🪙</span>
          <span className="stat__value">{coins}</span>
        </div>
        <div
          className="stat"
          title="Paquets restants aujourd'hui"
        >
          <span className="stat__icon">📦</span>
          <span className="stat__value">
            {packsRemaining}/{maxPacks}
          </span>
        </div>
      </div>
    </header>
  )
}
