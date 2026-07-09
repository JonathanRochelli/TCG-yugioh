import { useCallback, useEffect, useState } from 'react'
import type { Card, CollectionState } from '../types'
import { STARTING_COINS } from '../game/economy'

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
 */
export function addCardTo(
  state: CollectionState,
  card: Card,
): CollectionState {
  const key = cardKey(card)
  const existing = state[key]
  return {
    ...state,
    [key]: existing
      ? { card: existing.card, count: existing.count + 1 }
      : { card, count: 1 },
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
