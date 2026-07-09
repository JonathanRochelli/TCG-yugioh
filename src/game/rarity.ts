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
 * Poids relatifs du slot rare d'un paquet (un seul slot par paquet de 9).
 * Calé sur les taux du slot « hit » d'un booster Pokémon moderne.
 *
 * Probabilités par PAQUET qui en résultent :
 *   Rare        ≈ 63 %
 *   Super Rare  ≈ 22 %
 *   Ultra Rare  ≈ 12 %   (≈ 1 paquet sur 8)
 *   Secret Rare ≈ 3 %    (≈ 1 paquet sur 33)
 * → Super Rare ou mieux ≈ 37 % ; Ultra ou mieux ≈ 15 %.
 * (Le pity timer garantit en plus une Ultra/Secret tous les 10 paquets secs.)
 */
export const FOIL_WEIGHTS: Record<Rarity, number> = {
  Common: 0, // jamais dans le slot foil
  Rare: 63,
  'Super Rare': 22,
  'Ultra Rare': 12,
  'Secret Rare': 3,
}

/**
 * Poids du slot rare quand le pity timer garantit une carte de haute rareté.
 * On ne tire alors que dans Ultra Rare / Secret Rare.
 */
export const HIGH_FOIL_WEIGHTS: Record<Rarity, number> = {
  Common: 0,
  Rare: 0,
  'Super Rare': 0,
  'Ultra Rare': 80,
  'Secret Rare': 20,
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
  // (anglais + variantes françaises éventuelles : secrète, commune…)
  if (
    s.includes('secret') ||
    s.includes('secrète') ||
    s.includes('ghost') ||
    s.includes('ultimate')
  ) {
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
  if (s.includes('commun')) return 'Common' // commune / commun
  return 'Common'
}
