import { useMemo, useState } from 'react'
import type { Card, CollectionState } from '../types'
import { CURATED_SETS } from '../data/curatedSets'
import { knownSetSize } from '../api/ygoprodeck'
import { RARITY_ORDER, rarityRank } from '../game/rarity'
import { CardArt } from './CardArt'

interface Props {
  collection: CollectionState
  onInspect: (card: Card) => void
  onGoShop: () => void
}

export function Collection({ collection, onInspect, onGoShop }: Props) {
  const entries = useMemo(() => Object.values(collection), [collection])
  const [setFilter, setSetFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries
      .filter((e) => setFilter === 'all' || e.card.setName === setFilter)
      .filter((e) => !q || e.card.name.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          rarityRank(b.card.rarity) - rarityRank(a.card.rarity) ||
          a.card.name.localeCompare(b.card.name),
      )
  }, [entries, setFilter, query])

  const totalUnique = entries.length
  const totalCopies = entries.reduce((s, e) => s + e.count, 0)

  if (totalUnique === 0) {
    return (
      <section className="empty">
        <div className="empty__emblem">📭</div>
        <h2>Ta collection est vide</h2>
        <p className="muted">Ouvre ton premier booster pour commencer à collectionner.</p>
        <button onClick={onGoShop}>Aller à la boutique</button>
      </section>
    )
  }

  return (
    <section>
      <div className="section-head">
        <h1>Ma collection</h1>
        <p className="muted">
          {totalUnique} cartes uniques · {totalCopies} au total
        </p>
      </div>

      {/* Progression par set */}
      <div className="progress-row">
        {CURATED_SETS.map((set) => {
          const size = knownSetSize(set.apiName)
          const owned = entries.filter(
            (e) => e.card.setName === set.apiName,
          ).length
          const pct = size > 0 ? Math.round((owned / size) * 100) : 0
          return (
            <button
              key={set.apiName}
              className={`progress-pill ${
                setFilter === set.apiName ? 'progress-pill--active' : ''
              }`}
              onClick={() =>
                setSetFilter(setFilter === set.apiName ? 'all' : set.apiName)
              }
              title={`${owned}/${size} cartes`}
            >
              <span className="progress-pill__label">{set.emblem} {set.label}</span>
              <span className="progress-pill__bar">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="progress-pill__pct">
                {size > 0 ? `${pct}%` : `${owned}`}
              </span>
            </button>
          )
        })}
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Rechercher une carte…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {setFilter !== 'all' && (
          <button className="secondary" onClick={() => setSetFilter('all')}>
            Tous les sets
          </button>
        )}
      </div>

      <div className="collection-grid">
        {filtered.map((entry) => {
          const rarityClass = `r-${entry.card.rarity.replace(/\s+/g, '-')}`
          return (
            <div
              key={`${entry.card.setName}-${entry.card.id}`}
              className="coll-card"
              onClick={() => onInspect(entry.card)}
            >
              <CardArt card={entry.card} small />
              {entry.count > 1 && (
                <span className="coll-card__count">×{entry.count}</span>
              )}
              <span className={`rarity-chip coll-card__rarity ${rarityClass}`}>
                {entry.card.rarity}
              </span>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
          Aucune carte ne correspond.
        </p>
      )}

      {/* Ordre de rareté rappelé en légende */}
      <div className="legend">
        {RARITY_ORDER.map((r) => (
          <span key={r} className={`rarity-chip r-${r.replace(/\s+/g, '-')}`}>
            {r}
          </span>
        ))}
      </div>
    </section>
  )
}
