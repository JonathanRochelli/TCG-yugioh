import { useCallback, useEffect, useState } from 'react'
import type { Card, CollectionState } from '../types'
import { CRAFT_COST, DUST_VALUE, STARTING_COINS } from '../game/economy'
import { getKnownSetCards } from '../api/ygoprodeck'

const COLLECTION_KEY = 'ygo.collection.v1'
const COINS_KEY = 'ygo.coins.v2'
const DUST_KEY = 'ygo.dust.v1'

/** Clé unique d'une carte dans la collection (set + id). */
export function cardKey(card: Card): string {
  return `${card.setName}::${card.id}`
}

function loadCollection(): CollectionState {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY)
    return raw ? (JSON.parse(raw) as CollectionState) : {}
  } catch {
    return {}
  }
}

function loadCoins(): number {
  try {
    const raw = localStorage.getItem(COINS_KEY)
    if (raw === null) return STARTING_COINS
    const n = Number(JSON.parse(raw))
    return Number.isFinite(n) ? n : STARTING_COINS
  } catch {
    return STARTING_COINS
  }
}

/**
 * Ajoute une carte à un état de collection (pur) et renvoie un NOUVEL état.
 * En cas de doublon, on conserve la version la plus récente de la carte
 * (utile pour que les données FR remplacent d'anciennes données EN).
 */
export function addCardTo(
  state: CollectionState,
  card: Card,
): CollectionState {
  const key = cardKey(card)
  const existing = state[key]
  return {
    ...state,
    [key]: existing ? { card, count: existing.count + 1 } : { card, count: 1 },
  }
}

/**
 * Progression d'un set, robuste au cache manquant.
 *
 * - `owned` = max(cartes du set connu possédées, cartes possédées portant le
 *   nom du set) → jamais 0 si tu possèdes des cartes du set.
 * - `pct` utilise un dénominateur ≥ `owned` → toujours entre 0 et 100 %.
 * - `complete` = true seulement si toutes les cartes du set CONNU sont
 *   possédées (évite les fausses complétions sur le jeu de secours).
 */
export function setProgress(
  setName: string,
  collection: CollectionState,
): { owned: number; size: number; pct: number; complete: boolean } {
  const known = getKnownSetCards(setName)
  const size = known.length

  let inKnown = 0
  for (const c of known) if (collection[cardKey(c)]) inKnown++

  let byName = 0
  for (const key of Object.keys(collection)) {
    if (collection[key].card.setName === setName) byName++
  }

  const owned = Math.max(inKnown, byName)
  const denom = Math.max(size, owned, 1)
  return {
    owned,
    size,
    pct: Math.round((owned / denom) * 100),
    complete: size > 0 && inKnown >= size,
  }
}

export interface CollectionStore {
  collection: CollectionState
  coins: number
  /** Poussière (monnaie de craft, distincte des pièces). */
  dust: number
  /** Clés des cartes possédées (pour le calcul des doublons). */
  ownedKeys: Set<string>
  /** Ajoute plusieurs cartes (un paquet) à la collection. */
  addCards: (cards: Card[]) => void
  /** Ajoute (ou retire) des pièces. */
  addCoins: (delta: number) => void
  /** Ajoute (ou retire) de la poussière. */
  addDust: (delta: number) => void
  /** Fabrique une carte (déduit le coût en poussière, l'ajoute). */
  craftCard: (card: Card) => void
  /** Recycle 1 exemplaire en trop d'une carte en poussière. */
  recycleOne: (card: Card) => void
  /** Recycle tous les doublons en poussière ; renvoie la poussière gagnée. */
  recycleDuplicates: () => number
  ownedCount: (card: Card) => number
}

/**
 * Hook central : collection + pièces, persistés dans le localStorage.
 */
function loadNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const n = Number(JSON.parse(raw))
    return Number.isFinite(n) ? n : fallback
  } catch {
    return fallback
  }
}

export function useCollection(): CollectionStore {
  const [collection, setCollection] = useState<CollectionState>(loadCollection)
  const [coins, setCoins] = useState<number>(loadCoins)
  const [dust, setDust] = useState<number>(() => loadNumber(DUST_KEY, 0))

  useEffect(() => {
    try {
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection))
    } catch {
      /* ignore */
    }
  }, [collection])

  useEffect(() => {
    try {
      localStorage.setItem(COINS_KEY, JSON.stringify(coins))
    } catch {
      /* ignore */
    }
  }, [coins])

  useEffect(() => {
    try {
      localStorage.setItem(DUST_KEY, JSON.stringify(dust))
    } catch {
      /* ignore */
    }
  }, [dust])

  const addCards = useCallback((cards: Card[]) => {
    setCollection((prev) => {
      let next = prev
      for (const card of cards) next = addCardTo(next, card)
      return next
    })
  }, [])

  const addCoins = useCallback((delta: number) => {
    if (delta !== 0) setCoins((c) => c + delta)
  }, [])

  const addDust = useCallback((delta: number) => {
    if (delta !== 0) setDust((d) => d + delta)
  }, [])

  // Fabrique une carte : le coût est vérifié côté UI (bouton désactivé).
  const craftCard = useCallback((card: Card) => {
    setDust((d) => d - CRAFT_COST[card.rarity])
    setCollection((prev) => addCardTo(prev, card))
  }, [])

  const recycleOne = useCallback((card: Card) => {
    const key = cardKey(card)
    setCollection((prev) => {
      const e = prev[key]
      if (!e || e.count <= 1) return prev
      return { ...prev, [key]: { card: e.card, count: e.count - 1 } }
    })
    setDust((d) => d + DUST_VALUE[card.rarity])
  }, [])

  // Recycle tous les doublons (garde 1 exemplaire de chaque carte).
  const recycleDuplicates = useCallback((): number => {
    let gained = 0
    for (const key of Object.keys(collection)) {
      const e = collection[key]
      if (e.count > 1) gained += (e.count - 1) * DUST_VALUE[e.card.rarity]
    }
    if (gained > 0) {
      setCollection((prev) => {
        const next: CollectionState = {}
        for (const key of Object.keys(prev)) {
          next[key] = { card: prev[key].card, count: 1 }
        }
        return next
      })
      setDust((d) => d + gained)
    }
    return gained
  }, [collection])

  const ownedKeys = new Set(Object.keys(collection))
  const ownedCount = useCallback(
    (card: Card) => collection[cardKey(card)]?.count ?? 0,
    [collection],
  )

  return {
    collection,
    coins,
    dust,
    ownedKeys,
    addCards,
    addCoins,
    addDust,
    craftCard,
    recycleOne,
    recycleDuplicates,
    ownedCount,
  }
}
