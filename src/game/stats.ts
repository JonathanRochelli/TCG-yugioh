import type { Card } from '../types'
import { rarityRank } from './rarity'

export interface Stats {
  packsOpened: number
  cardsObtained: number
  supers: number
  ultras: number
  secrets: number
  bestRarityRank: number
}

const KEY = 'ygo.stats.v1'

function empty(): Stats {
  return {
    packsOpened: 0,
    cardsObtained: 0,
    supers: 0,
    ultras: 0,
    secrets: 0,
    bestRarityRank: 0,
  }
}

export function getStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty(), ...(JSON.parse(raw) as Partial<Stats>) }
  } catch {
    /* ignore */
  }
  return empty()
}

function write(s: Stats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

/** Met à jour les stats après une ouverture et renvoie l'état à jour. */
export function recordOpening(packCount: number, cards: Card[]): Stats {
  const s = getStats()
  s.packsOpened += packCount
  s.cardsObtained += cards.length
  for (const c of cards) {
    const r = rarityRank(c.rarity)
    if (r > s.bestRarityRank) s.bestRarityRank = r
    if (c.rarity === 'Super Rare') s.supers++
    else if (c.rarity === 'Ultra Rare') s.ultras++
    else if (c.rarity === 'Secret Rare') s.secrets++
  }
  write(s)
  return s
}
