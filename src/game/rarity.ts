import type { Rarity } from '../types'

/** Ordre croissant de rareté (du plus commun au plus rare). */
export const RARITY_ORDER: Rarity[] = [
  'Common',
  'Rare',
  'Super Rare',
  'Ultra Rare',
  'Secret Rare',
]

/** Raretés "foil" (au-dessus de Common) éligibles au slot rare d'un paquet. */
export const FOIL_RARITIES: Rarity[] = RARITY_ORDER.filter((r) => r !== 'Common')

/**
 * Poids relatifs du slot rare d'un paquet.
 * Plus la rareté est haute, plus elle est improbable.
 */
export const FOIL_WEIGHTS: Record<Rarity, number> = {
  Common: 0, // jamais dans le slot foil
  Rare: 60,
  'Super Rare': 25,
  'Ultra Rare': 12,
  'Secret Rare': 3,
}

/** Couleur CSS associée à une rareté (pour bordures/halos). */
export const RARITY_COLOR: Record<Rarity, string> = {
  Common: 'var(--r-common)',
  Rare: 'var(--r-rare)',
  'Super Rare': 'var(--r-super)',
  'Ultra Rare': 'var(--r-ultra)',
  'Secret Rare': 'var(--r-secret)',
}

/** Une rareté est-elle "foil" (holographique) ? */
export function isFoil(rarity: Rarity): boolean {
  return rarity !== 'Common'
}

/** Index de tri d'une rareté (Common = 0). */
export function rarityRank(rarity: Rarity): number {
  return RARITY_ORDER.indexOf(rarity)
}

/**
 * Normalise une chaîne de rareté brute de l'API vers un tier connu.
 * L'API expose de nombreux libellés (« Ultimate Rare », « Ghost Rare »,
 * « Short Print », etc.) qu'on ramène au tier le plus proche.
 */
export function normalizeRarity(raw: string | undefined): Rarity {
  if (!raw) return 'Common'
  const s = raw.toLowerCase()

  // Ordre important : tester les plus spécifiques d'abord.
  if (s.includes('secret') || s.includes('ghost') || s.includes('ultimate')) {
    return 'Secret Rare'
  }
  if (s.includes('ultra')) return 'Ultra Rare'
  if (s.includes('super')) return 'Super Rare'
  if (
    s.includes('short print') ||
    s.includes('super short') ||
    s === 'sp' ||
    s === 'ssp'
  ) {
    return 'Common'
  }
  if (s.includes('rare')) return 'Rare'
  return 'Common'
}
