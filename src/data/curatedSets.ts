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
  {
    apiName: "Pharaoh's Servant",
    label: "Pharaoh's Servant",
    blurb: 'Les serviteurs du Pharaon et le Jar of Greed. Trésors de l’Égypte antique.',
    colors: ['#d8a53a', '#5a3d0e'],
    emblem: '𓂀',
  },
  {
    apiName: 'Spell Ruler',
    label: 'Spell Ruler',
    blurb: 'La magie règne. Cartes magie puissantes et invocations rapides.',
    colors: ['#9b5cff', '#2a1a55'],
    emblem: '✦',
  },
]

/** Retrouve une définition de set par son nom API. */
export function findSet(apiName: string): SetDef | undefined {
  return CURATED_SETS.find((s) => s.apiName === apiName)
}
