import type { SetDef } from '../types'

/**
 * Boosters curatés. `apiName` doit correspondre EXACTEMENT au nom du set
 * côté API YGOPRODeck (paramètre `cardset` de cardinfo.php).
 * Ce sont de vrais sets classiques du jeu Yu-Gi-Oh.
 */
export const CURATED_SETS: SetDef[] = [
  {
    apiName: 'Legend of Blue Eyes White Dragon',
    label: 'Legend of Blue Eyes White Dragon',
    blurb: 'Le tout premier booster. Le mythique Dragon Blanc aux Yeux Bleus.',
    colors: ['#3b6fe0', '#0b1f4d'],
    emblem: '🐉',
  },
  {
    apiName: 'Metal Raiders',
    label: 'Metal Raiders',
    blurb: 'Pièges et monstres emblématiques : le Cylindre Magique, Summoned Skull...',
    colors: ['#8a8f9c', '#2b2f3a'],
    emblem: '⚙️',
  },
]

/** Retrouve une définition de set par son nom API. */
export function findSet(apiName: string): SetDef | undefined {
  return CURATED_SETS.find((s) => s.apiName === apiName)
}

/**
 * Renvoie une définition de set : celle curatée si elle existe, sinon une
 * définition générée (couleurs dérivées du nom) pour un set du catalogue.
 */
export function setDefFor(apiName: string): SetDef {
  const found = findSet(apiName)
  if (found) return found
  let h = 0
  for (let i = 0; i < apiName.length; i++) h = (h * 31 + apiName.charCodeAt(i)) >>> 0
  const hue = h % 360
  return {
    apiName,
    label: apiName,
    blurb: '',
    colors: [`hsl(${hue} 55% 42%)`, `hsl(${(hue + 28) % 360} 55% 16%)`],
    emblem: '🎴',
  }
}
