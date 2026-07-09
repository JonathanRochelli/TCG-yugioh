import type { Card, Rarity } from '../types'
import { FOIL_WEIGHTS, HIGH_FOIL_WEIGHTS } from './rarity'

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
 * Choisit une rareté selon des poids, en ne considérant que les raretés
 * effectivement présentes dans le set (poids > 0 et cartes disponibles).
 */
function pickRarityByWeight(
  groups: Record<Rarity, Card[]>,
  rng: Rng,
  weights: Record<Rarity, number>,
): Rarity | null {
  const available = (Object.keys(weights) as Rarity[]).filter(
    (r) => weights[r] > 0 && groups[r].length > 0,
  )
  if (available.length === 0) return null

  const total = available.reduce((sum, r) => sum + weights[r], 0)
  let roll = rng() * total
  for (const r of available) {
    roll -= weights[r]
    if (roll < 0) return r
  }
  return available[available.length - 1]
}

/** Options de génération d'un paquet. */
export interface PackOptions {
  /**
   * Garantit une carte de haute rareté (Ultra/Secret) dans le slot foil,
   * si le set en contient. Utilisé par le pity timer.
   */
  guaranteeHighRarity?: boolean
}

/**
 * Génère un paquet de {@link PACK_SIZE} cartes à partir des cartes d'un set.
 *
 * - {@link COMMONS_PER_PACK} cartes communes (tirage avec remise).
 * - 1 carte "foil" tirée dans un pool pondéré des raretés supérieures.
 *   Si `guaranteeHighRarity` est vrai, le slot ne tire que dans Ultra/Secret.
 *
 * Robustesse : si le set n'a pas de commons, on complète avec n'importe
 * quelle carte disponible ; si aucune foil n'existe, le slot devient commun.
 *
 * @param cards   toutes les cartes disponibles du set (déjà normalisées).
 * @param rng     source d'aléa (défaut Math.random) pour tests déterministes.
 * @param options garanties optionnelles (pity timer).
 */
export function generatePack(
  cards: Card[],
  rng: Rng = Math.random,
  options: PackOptions = {},
): Card[] {
  if (cards.length === 0) return []

  const groups = groupByRarity(cards)
  const commonPool = groups.Common.length > 0 ? groups.Common : cards

  const pack: Card[] = []
  for (let i = 0; i < COMMONS_PER_PACK; i++) {
    pack.push(pick(commonPool, rng))
  }

  // Slot foil : haute rareté garantie si demandé (et possible), sinon normal.
  const foilRarity =
    (options.guaranteeHighRarity &&
      pickRarityByWeight(groups, rng, HIGH_FOIL_WEIGHTS)) ||
    pickRarityByWeight(groups, rng, FOIL_WEIGHTS)
  const foilPool = foilRarity ? groups[foilRarity] : commonPool
  pack.push(pick(foilPool.length > 0 ? foilPool : commonPool, rng))

  return pack
}
