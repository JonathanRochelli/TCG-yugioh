import { useEffect, useMemo, useState } from 'react'
import type { ApiSetSummary, SetDef } from '../types'
import { fetchAllSets } from '../api/ygoprodeck'
import { setDefFor } from '../data/curatedSets'

interface Props {
  onOpen: (set: SetDef, count: number) => void
  loadingSet: string | null
}

export function Catalog({ onOpen, loadingSet }: Props) {
  const [sets, setSets] = useState<ApiSetSummary[] | null>(null)
  const [offline, setOffline] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    fetchAllSets().then((res) => {
      if (!alive) return
      setSets(res.sets)
      setOffline(res.offline)
    })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!sets) return []
    const q = query.trim().toLowerCase()
    const list = q
      ? sets.filter((s) => s.set_name.toLowerCase().includes(q))
      : sets
    return list.slice(0, 300)
  }, [sets, query])

  return (
    <section>
      <div className="section-head">
        <h1>Catalogue des sets</h1>
        <p className="muted">
          Tous les vrais sets Yu-Gi-Oh. Choisis-en un pour ouvrir un booster à{' '}
          100 🪙.
        </p>
      </div>

      {offline && (
        <div className="banner banner--info">
          Mode hors-ligne : catalogue complet indisponible ici. Dans ton
          navigateur, la liste réelle des sets se charge via l'API.
        </div>
      )}

      <div className="toolbar">
        <input
          className="search"
          placeholder="Rechercher un set…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {sets === null ? (
        <div className="catalog-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="catalog-card skeleton" />
          ))}
        </div>
      ) : (
        <div className="catalog-grid">
          {filtered.map((s) => {
            const def = setDefFor(s.set_name)
            const busy = loadingSet !== null
            return (
              <button
                key={s.set_name}
                className="catalog-card"
                disabled={busy}
                onClick={() => onOpen(def, 1)}
                style={{
                  background: `linear-gradient(160deg, ${def.colors[0]}, ${def.colors[1]})`,
                }}
              >
                <span className="catalog-card__emblem">{def.emblem}</span>
                <span className="catalog-card__name">{s.set_name}</span>
                {typeof s.num_of_cards === 'number' && (
                  <span className="catalog-card__meta">
                    {s.num_of_cards} cartes
                  </span>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="muted">Aucun set ne correspond.</p>
          )}
        </div>
      )}
    </section>
  )
}
