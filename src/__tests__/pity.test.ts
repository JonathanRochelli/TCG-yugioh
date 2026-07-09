import { describe, it, expect, beforeEach } from 'vitest'
import { generatePack, PACK_SIZE, type Rng } from '../game/packOpening'
import { normalizeSet } from '../api/ygoprodeck'
import { FALLBACK_CARDS } from '../data/fallbackCards'
import { rarityRank } from '../game/rarity'
import {
  isPityDue,
  registerPack,
  packHasHighRarity,
  PITY_THRESHOLD,
} from '../game/pity'
import type { Card } from '../types'

const LOB = 'Legend of Blue Eyes White Dragon'
const cards = normalizeSet(FALLBACK_CARDS[LOB], LOB)

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

const commonCard: Card = cards.find((c) => c.rarity === 'Common')!
const commonPack: Card[] = Array.from({ length: PACK_SIZE }, () => commonCard)

describe('generatePack guaranteeHighRarity', () => {
  it('force une carte Ultra Rare ou mieux dans le slot foil', () => {
    const minUltra = rarityRank('Ultra Rare')
    for (let s = 0; s < 25; s++) {
      const pack = generatePack(cards, seeded(s), { guaranteeHighRarity: true })
      const foil = pack[PACK_SIZE - 1]
      expect(rarityRank(foil.rarity)).toBeGreaterThanOrEqual(minUltra)
    }
  })
})

describe('pity timer', () => {
  beforeEach(() => localStorage.clear())

  it('devient dû après PITY_THRESHOLD paquets sans haute rareté', () => {
    expect(isPityDue()).toBe(false)
    for (let i = 0; i < PITY_THRESHOLD; i++) {
      expect(isPityDue()).toBe(false)
      registerPack(commonPack)
    }
    expect(isPityDue()).toBe(true)
  })

  it('se réinitialise quand un paquet contient une haute rareté', () => {
    for (let i = 0; i < PITY_THRESHOLD; i++) registerPack(commonPack)
    expect(isPityDue()).toBe(true)
    const highPack = generatePack(cards, seeded(1), { guaranteeHighRarity: true })
    expect(packHasHighRarity(highPack)).toBe(true)
    registerPack(highPack)
    expect(isPityDue()).toBe(false)
  })
})
