import { useMemo, useState } from 'react'
import type { Card, CollectionState } from '../types'
import { CURATED_SETS } from '../data/curatedSets'
import { getKnownSetCards } from '../api/ygoprodeck'
import { RARITY_ORDER, rarityRank } from '../game/rarity'
import { rarityLabel, translateAttribute } from '../game/i18n'
import { cardKey, setProgress } from '../store/collection'
import { CardArt } from './CardArt'

interface Props {
  collection: CollectionState
  dust: number
  onInspect: (list: Card[], index: number) => void
  onRecycleDuplicates: () => void
  onGoShop: () => void
}

type Ownership = 'owned' | 'missing'
type SortKey = 'rarity' | 'atk' | 'name'
type TypeFilter = 'all' | 'Monster' | 'Spell' | 'Trap'

const ATTRIBUTES = ['LIGHT', 'DARK', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE']

interface Item {
  card: Card
  count: number
}

function typeCategory(type: string): TypeFilter {
  if (type.includes('Spell')) return 'Spell'
  if (type.includes('Trap')) return 'Trap'
  return 'Monster'
}

export function Collection({
  collection,
  dust,
  onInspect,
  onRecycleDuplicates,
  onGoShop,
}: Props) {
  const entries = useMemo(() => Object.values(collection), [collection])
  const [setFilter, setSetFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [ownership, setOwnership] = useState<Ownership>('owned')
  const [sort, setSort] = useState<SortKey>('rarity')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [attrFilter, setAttrFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const totalUnique = entries.length
  const totalCopies = entries.reduce((s, e) => s + e.count, 0)
  const duplicateCount = entries.filter((e) => e.count > 1).length

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
      .filter((it) => attrFilter === 'all' || it.card.attribute === attrFilter)
      .filter((it) => levelFilter === 'all' || it.card.level === Number(levelFilter))
      .filter((it) => !q || it.card.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'atk') return (b.card.atk ?? -1) - (a.card.atk ?? -1)
        if (sort === 'name') return a.card.name.localeCompare(b.card.name)
        return (
          rarityRank(b.card.rarity) - rarityRank(a.card.rarity) ||
          a.card.name.localeCompare(b.card.name)
        )
      })
  }, [entries, collection, setFilter, query, ownership, sort, typeFilter, attrFilter, levelFilter])

  const cardList = useMemo(() => items.map((it) => it.card), [items])

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
          {totalUnique} cartes uniques · {totalCopies} au total · ✨ {dust}{' '}
          poussière
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

      {/* Barre d'outils */}
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
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Trier par">
          <option value="rarity">Rareté</option>
          <option value="atk">ATK</option>
          <option value="name">Nom</option>
        </select>
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} aria-label="Type">
          <option value="all">Tous types</option>
          <option value="Monster">Monstres</option>
          <option value="Spell">Magies</option>
          <option value="Trap">Pièges</option>
        </select>
        <select className="select" value={attrFilter} onChange={(e) => setAttrFilter(e.target.value)} aria-label="Attribut">
          <option value="all">Tous attributs</option>
          {ATTRIBUTES.map((a) => (
            <option key={a} value={a}>
              {translateAttribute(a)}
            </option>
          ))}
        </select>
        <select className="select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} aria-label="Niveau">
          <option value="all">Tous niveaux</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((lv) => (
            <option key={lv} value={lv}>
              Niveau {lv}
            </option>
          ))}
        </select>
        {duplicateCount > 0 && (
          <button className="secondary" onClick={onRecycleDuplicates}>
            ♻️ Recycler {duplicateCount} doublon{duplicateCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {ownership === 'missing' && setFilter === 'all' ? (
        <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
          Choisis un set ci-dessus pour voir les cartes qu'il te reste à
          obtenir (fabricables avec de la poussière ✨).
        </p>
      ) : (
        <div className="collection-grid">
          {items.map((it, idx) => {
            const rarityClass = `r-${it.card.rarity.replace(/\s+/g, '-')}`
            const missing = it.count === 0
            return (
              <div
                key={`${it.card.setName}-${it.card.id}`}
                className={`coll-card ${missing ? 'coll-card--missing' : ''}`}
                onClick={() => onInspect(cardList, idx)}
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
