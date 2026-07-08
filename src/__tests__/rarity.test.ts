import { describe, it, expect } from 'vitest'
import { normalizeRarity, rarityRank, isFoil } from '../game/rarity'

describe('normalizeRarity', () => {
  it('mappe les libellés courants vers les tiers connus', () => {
    expect(normalizeRarity('Common')).toBe('Common')
    expect(normalizeRarity('Rare')).toBe('Rare')
    expect(normalizeRarity('Super Rare')).toBe('Super Rare')
    expect(normalizeRarity('Ultra Rare')).toBe('Ultra Rare')
    expect(normalizeRarity('Secret Rare')).toBe('Secret Rare')
  })

  it('rattache les raretés exotiques au tier le plus proche', () => {
    expect(normalizeRarity('Ultimate Rare')).toBe('Secret Rare')
    expect(normalizeRarity('Ghost Rare')).toBe('Secret Rare')
    expect(normalizeRarity('Prismatic Secret Rare')).toBe('Secret Rare')
    expect(normalizeRarity('Short Print')).toBe('Common')
  })

  it('renvoie Common par défaut / valeur absente', () => {
    expect(normalizeRarity(undefined)).toBe('Common')
    expect(normalizeRarity('Inconnu')).toBe('Common')
  })
})

describe('rarityRank / isFoil', () => {
  it('ordonne les raretés', () => {
    expect(rarityRank('Common')).toBeLessThan(rarityRank('Rare'))
    expect(rarityRank('Ultra Rare')).toBeLessThan(rarityRank('Secret Rare'))
  })
  it('Common n’est pas foil, les autres le sont', () => {
    expect(isFoil('Common')).toBe(false)
    expect(isFoil('Rare')).toBe(true)
    expect(isFoil('Secret Rare')).toBe(true)
  })
})
