import type { Card, Rarity } from '../types'
import { rarityRank } from './rarity'

/**
 * Pity timer : après {@link PITY_THRESHOLD} paquets ouverts sans carte
 * Ultra Rare ou mieux, le prochain paquet en garantit une.
 */
export const PITY_THRESHOLD = 10

/** Raretés considérées comme "haute" pour le pity. */
export const HIGH_RARITIES: Rarity[] = ['Ultra Rare', 'Secret Rare']

const KEY = 'ygo.pity.v1'

/** Un paquet contient-il une carte Ultra Rare ou mieux ? */
export function packHasHighRarity(pack: Card[]): boolean {
  const min = rarityRank('Ultra Rare')
  return pack.some((c) => rarityRank(c.rarity) >= min)
}

function read(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0
  } catch {
    return 0
  }
}

function write(n: number): void {
  try {
    localStorage.setItem(KEY, String(n))
  } catch {
    /* ignore */
  }
}

/** Nombre de paquets consécutifs sans carte haute rareté. */
export function pityCount(): number {
  return read()
}

/** Le prochain paquet doit-il garantir une carte haute rareté ? */
export function isPityDue(): boolean {
  return read() >= PITY_THRESHOLD
}

/**
 * Met à jour le compteur après l'ouverture d'un paquet : remise à zéro si le
 * paquet contenait une haute rareté, sinon incrément.
 */
export function registerPack(pack: Card[]): void {
  write(packHasHighRarity(pack) ? 0 : read() + 1)
}
