import type { Card, Rarity } from '../types'

/** Pièces de départ à la première ouverture de l'app. */
export const STARTING_COINS = 500
/** Coût d'un paquet en pièces. */
export const PACK_COST = 100
/** Bonus de pièces offert une fois par jour (anti-impasse économique). */
export const DAILY_BONUS_COINS = 200

/**
 * Valeur en « poussière » obtenue quand un DOUBLON est recyclé, selon la
 * rareté. La poussière est une monnaie distincte des pièces.
 */
export const DUST_VALUE: Record<Rarity, number> = {
  Common: 2,
  Rare: 8,
  'Super Rare': 20,
  'Ultra Rare': 50,
  'Secret Rare': 120,
}

/**
 * Coût en poussière pour FABRIQUER (craft) une carte manquante, selon sa
 * rareté. Supérieur à la valeur de recyclage (il faut plusieurs doublons).
 */
export const CRAFT_COST: Record<Rarity, number> = {
  Common: 20,
  Rare: 60,
  'Super Rare': 150,
  'Ultra Rare': 400,
  'Secret Rare': 1000,
}

/**
 * Calcule les pièces gagnées pour un paquet donné : chaque carte qui est un
 * doublon (déjà possédée AVANT ce paquet, ou en double dans le paquet) est
 * recyclée en poussière.
 *
 * @param pack       les cartes du paquet
 * @param ownedIds   ensemble des clés de cartes déjà possédées avant le paquet
 * @param keyOf      fonction produisant la clé unique d'une carte
 */
export function dustFromPack(
  pack: Card[],
  ownedIds: Set<string>,
  keyOf: (c: Card) => string,
): number {
  const seen = new Set(ownedIds)
  let dust = 0
  for (const card of pack) {
    const key = keyOf(card)
    if (seen.has(key)) {
      dust += DUST_VALUE[card.rarity]
    } else {
      seen.add(key)
    }
  }
  return dust
}
