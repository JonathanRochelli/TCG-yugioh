import { useCallback, useEffect, useState } from 'react'
import type { Card, CollectionState } from '../types'
import { STARTING_COINS } from '../game/economy'
import { getKnownSetCards } from '../api/ygoprodeck'

const COLLECTION_KEY = 'ygo.collection.v1'
const COINS_KEY = 'ygo.coins.v2'

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
  /** Clés des cartes possédées (pour le calcul des doublons). */
  ownedKeys: Set<string>
  /** Ajoute plusieurs cartes (un paquet) et applique un delta de pièces. */
  addCards: (cards: Card[], coinDelta: number) => void
  /** Ajoute (ou retire) des pièces. */
  addCoins: (delta: number) => void
  ownedCount: (card: Card) => number
}

/**
 * Hook central : collection + pièces, persistés dans le localStorage.
 */
export function useCollection(): CollectionStore {
  const [collection, setCollection] = useState<CollectionState>(loadCollection)
  const [coins, setCoins] = useState<number>(loadCoins)

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

  const addCards = useCallback((cards: Card[], coinDelta: number) => {
    setCollection((prev) => {
      let next = prev
      for (const card of cards) next = addCardTo(next, card)
      return next
    })
    if (coinDelta !== 0) setCoins((c) => c + coinDelta)
  }, [])

  const addCoins = useCallback((delta: number) => {
    if (delta !== 0) setCoins((c) => c + delta)
  }, [])

  const ownedKeys = new Set(Object.keys(collection))
  const ownedCount = useCallback(
    (card: Card) => collection[cardKey(card)]?.count ?? 0,
    [collection],
  )

  return { collection, coins, ownedKeys, addCards, addCoins, ownedCount }
}
