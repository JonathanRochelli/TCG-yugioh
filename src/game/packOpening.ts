import type { Card, Rarity } from '../types'
import { FOIL_WEIGHTS, isFoil } from './rarity'

/** Nombre de cartes par paquet. */
export const PACK_SIZE = 9
/** Nombre de cartes communes garanties (le reste = slot foil). */
export const COMMONS_PER_PACK = PACK_SIZE - 1

/** Source d'aléa injectable (0 <= r < 1), pour des tests déterministes. */
export type Rng = () => number

/** Tire un élément au hasard dans un tableau non vide. */
function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Regroupe les cartes d'un set par rareté. */
export function groupByRarity(cards: Card[]): Record<Rarity, Card[]> {
  const groups: Record<Rarity, Card[]> = {
    Common: [],
    Rare: [],
    'Super Rare': [],
    'Ultra Rare': [],
    'Secret Rare': [],
  }
  for (const c of cards) groups[c.rarity].push(c)
  return groups
}

/**
 * Choisit une rareté foil selon les poids configurés, en ne considérant
 * que les raretés effectivement présentes dans le set.
 */
function pickFoilRarity(
  groups: Record<Rarity, Card[]>,
  rng: Rng,
): Rarity | null {
  const available = (Object.keys(FOIL_WEIGHTS) as Rarity[]).filter(
    (r) => isFoil(r) && groups[r].length > 0,
  )
  if (available.length === 0) return null

  const total = available.reduce((sum, r) => sum + FOIL_WEIGHTS[r], 0)
  let roll = rng() * total
  for (const r of available) {
    roll -= FOIL_WEIGHTS[r]
    if (roll < 0) return r
  }
  return available[available.length - 1]
}

/**
 * Génère un paquet de {@link PACK_SIZE} cartes à partir des cartes d'un set.
 *
 * - {@link COMMONS_PER_PACK} cartes communes (tirage avec remise).
 * - 1 carte "foil" tirée dans un pool pondéré des raretés supérieures.
 *
 * Robustesse : si le set n'a pas de commons, on complète avec n'importe
 * quelle carte disponible ; si aucune foil n'existe, le slot devient commun.
 *
 * @param cards toutes les cartes disponibles du set (déjà normalisées).
 * @param rng   source d'aléa (défaut Math.random) pour tests déterministes.
 */
export function generatePack(cards: Card[], rng: Rng = Math.random): Card[] {
  if (cards.length === 0) return []

  const groups = groupByRarity(cards)
  const commonPool = groups.Common.length > 0 ? groups.Common : cards

  const pack: Card[] = []
  for (let i = 0; i < COMMONS_PER_PACK; i++) {
    pack.push(pick(commonPool, rng))
  }

  const foilRarity = pickFoilRarity(groups, rng)
  const foilPool = foilRarity ? groups[foilRarity] : commonPool
  pack.push(pick(foilPool.length > 0 ? foilPool : commonPool, rng))

  return pack
}
