import { useMemo, useState } from 'react'
import type { Card, CollectionState } from '../types'
import { CURATED_SETS } from '../data/curatedSets'
import { getKnownSetCards } from '../api/ygoprodeck'
import { RARITY_ORDER, rarityRank } from '../game/rarity'
import { rarityLabel } from '../game/i18n'
import { cardKey, setProgress } from '../store/collection'
import { CardArt } from './CardArt'

interface Props {
  collection: CollectionState
  onInspect: (card: Card) => void
  onGoShop: () => void
}

type Ownership = 'owned' | 'missing'
type SortKey = 'rarity' | 'atk' | 'name'
type TypeFilter = 'all' | 'Monster' | 'Spell' | 'Trap'

interface Item {
  card: Card
  count: number
}

function typeCategory(type: string): TypeFilter {
  if (type.includes('Spell')) return 'Spell'
  if (type.includes('Trap')) return 'Trap'
  return 'Monster'
}

export function Collection({ collection, onInspect, onGoShop }: Props) {
  const entries = useMemo(() => Object.values(collection), [collection])
  const [setFilter, setSetFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [ownership, setOwnership] = useState<Ownership>('owned')
  const [sort, setSort] = useState<SortKey>('rarity')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const totalUnique = entries.length
  const totalCopies = entries.reduce((s, e) => s + e.count, 0)

  const items = useMemo<Item[]>(() => {
    let base: Item[]
    if (ownership === 'missing') {
      if (setFilter === 'all') return []
      const owned = new Set(Object.keys(collection))
      base = getKnownSetCards(setFilter)
        .filter((c) => !owned.has(cardKey(c)))
        .map((c) => ({ card: c, count: 0 }))
    } else {
      base = entries.filter(
        (e) => setFilter === 'all' || e.card.setName === setFilter,
      )
    }

    const q = query.trim().toLowerCase()
    return base
      .filter((it) => typeFilter === 'all' || typeCategory(it.card.type) === typeFilter)
      .filter((it) => !q || it.card.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'atk') return (b.card.atk ?? -1) - (a.card.atk ?? -1)
        if (sort === 'name') return a.card.name.localeCompare(b.card.name)
        return (
          rarityRank(b.card.rarity) - rarityRank(a.card.rarity) ||
          a.card.name.localeCompare(b.card.name)
        )
      })
  }, [entries, collection, setFilter, query, ownership, sort, typeFilter])

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

      {/* Progression par set (clic = filtrer) */}
      <div className="progress-row">
        {CURATED_SETS.map((set) => {
          const { owned, size, pct } = setProgress(set.apiName, collection)
          const total = Math.max(size, owned)
          return (
            <button
              key={set.apiName}
              className={`progress-pill ${setFilter === set.apiName ? 'progress-pill--active' : ''}`}
              onClick={() => setSetFilter(setFilter === set.apiName ? 'all' : set.apiName)}
              title={`${owned}/${total} cartes`}
            >
              <span className="progress-pill__label">
                {set.emblem} {set.label}
              </span>
              <span className="progress-pill__bar">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="progress-pill__pct">{pct}%</span>
            </button>
          )
        })}
      </div>

      {/* Barre d'outils : recherche, possédées/manquantes, tri, type */}
      <div className="toolbar toolbar--wrap">
        <input
          className="search"
          placeholder="Rechercher une carte…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="segmented">
          <button
            className={ownership === 'owned' ? 'seg seg--on' : 'seg'}
            onClick={() => setOwnership('owned')}
          >
            Possédées
          </button>
          <button
            className={ownership === 'missing' ? 'seg seg--on' : 'seg'}
            onClick={() => setOwnership('missing')}
          >
            Manquantes
          </button>
        </div>
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Trier par"
        >
          <option value="rarity">Rareté</option>
          <option value="atk">ATK</option>
          <option value="name">Nom</option>
        </select>
        <select
          className="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          aria-label="Filtrer par type"
        >
          <option value="all">Tous types</option>
          <option value="Monster">Monstres</option>
          <option value="Spell">Magies</option>
          <option value="Trap">Pièges</option>
        </select>
      </div>

      {ownership === 'missing' && setFilter === 'all' ? (
        <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
          Choisis un set ci-dessus pour voir les cartes qu'il te reste à
          obtenir.
        </p>
      ) : (
        <div className="collection-grid">
          {items.map((it) => {
            const rarityClass = `r-${it.card.rarity.replace(/\s+/g, '-')}`
            const missing = it.count === 0
            return (
              <div
                key={`${it.card.setName}-${it.card.id}`}
                className={`coll-card ${missing ? 'coll-card--missing' : ''}`}
                onClick={() => onInspect(it.card)}
              >
                <CardArt card={it.card} small />
                {it.count > 1 && <span className="coll-card__count">×{it.count}</span>}
                <span className={`rarity-chip coll-card__rarity ${rarityClass}`}>
                  {rarityLabel(it.card.rarity)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {ownership !== 'missing' && items.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
          Aucune carte ne correspond.
        </p>
      )}

      <div className="legend">
        {RARITY_ORDER.map((r) => (
          <span key={r} className={`rarity-chip r-${r.replace(/\s+/g, '-')}`}>
            {rarityLabel(r)}
          </span>
        ))}
      </div>
    </section>
  )
}
