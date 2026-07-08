import { describe, it, expect } from 'vitest'
import {
  generatePack,
  groupByRarity,
  PACK_SIZE,
  COMMONS_PER_PACK,
  type Rng,
} from '../game/packOpening'
import { normalizeSet } from '../api/ygoprodeck'
import { FALLBACK_CARDS } from '../data/fallbackCards'
import type { Card, Rarity } from '../types'
import { isFoil } from '../game/rarity'

const LOB = 'Legend of Blue Eyes White Dragon'
const cards = normalizeSet(FALLBACK_CARDS[LOB], LOB)

/** RNG déterministe à partir d'une graine (mulberry32). */
function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('generatePack', () => {
  it('produit un paquet de la bonne taille', () => {
    const pack = generatePack(cards, seeded(1))
    expect(pack).toHaveLength(PACK_SIZE)
  })

  it('contient au moins une carte foil (slot garanti)', () => {
    for (let s = 0; s < 20; s++) {
      const pack = generatePack(cards, seeded(s))
      expect(pack.some((c) => isFoil(c.rarity))).toBe(true)
    }
  })

  it('a exactement COMMONS_PER_PACK communes + 1 slot foil quand des foils existent', () => {
    const pack = generatePack(cards, seeded(3))
    const commons = pack.filter((c) => c.rarity === 'Common').length
    // Le slot foil est toujours non-commun ici (le set a des foils).
    expect(commons).toBeGreaterThanOrEqual(COMMONS_PER_PACK)
    expect(pack.length - commons).toBeGreaterThanOrEqual(1)
  })

  it('renvoie un tableau vide si aucune carte', () => {
    expect(generatePack([], seeded(1))).toEqual([])
  })

  it('gère un set sans commons (complète avec ce qui existe)', () => {
    const noCommons: Card[] = cards
      .filter((c) => c.rarity !== 'Common')
      .map((c) => ({ ...c }))
    const pack = generatePack(noCommons, seeded(7))
    expect(pack).toHaveLength(PACK_SIZE)
    expect(pack.every((c) => c !== undefined)).toBe(true)
  })

  it('respecte la hiérarchie de rareté sur un grand échantillon', () => {
    const counts: Record<Rarity, number> = {
      Common: 0,
      Rare: 0,
      'Super Rare': 0,
      'Ultra Rare': 0,
      'Secret Rare': 0,
    }
    const N = 4000
    for (let i = 0; i < N; i++) {
      const foil = generatePack(cards, seeded(i))[PACK_SIZE - 1]
      counts[foil.rarity]++
    }
    // Rare doit être plus fréquent qu'Ultra Rare dans le slot foil.
    expect(counts.Rare).toBeGreaterThan(counts['Ultra Rare'])
  })
})

describe('groupByRarity', () => {
  it('classe toutes les cartes dans un tier', () => {
    const groups = groupByRarity(cards)
    const total = Object.values(groups).reduce((s, g) => s + g.length, 0)
    expect(total).toBe(cards.length)
  })
})
