import type { Stats } from './stats'

/** Contexte évalué pour débloquer les succès. */
export interface AchievementCtx {
  stats: Stats
  uniqueCount: number
  completedSets: number
}

export interface Achievement {
  id: string
  label: string
  desc: string
  reward: number
  test: (ctx: AchievementCtx) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-pack', label: 'Premier paquet', desc: 'Ouvre ton premier booster.', reward: 50, test: (c) => c.stats.packsOpened >= 1 },
  { id: 'packs-10', label: 'Habitué', desc: 'Ouvre 10 boosters.', reward: 100, test: (c) => c.stats.packsOpened >= 10 },
  { id: 'packs-50', label: 'Accro aux boosters', desc: 'Ouvre 50 boosters.', reward: 300, test: (c) => c.stats.packsOpened >= 50 },
  { id: 'packs-100', label: 'Ouvreur légendaire', desc: 'Ouvre 100 boosters.', reward: 500, test: (c) => c.stats.packsOpened >= 100 },
  { id: 'first-ultra', label: 'Éclat doré', desc: 'Obtiens une Ultra Rare.', reward: 100, test: (c) => c.stats.ultras >= 1 },
  { id: 'first-secret', label: 'Trésor caché', desc: 'Obtiens une Secret Rare.', reward: 300, test: (c) => c.stats.secrets >= 1 },
  { id: 'collector-50', label: 'Collectionneur', desc: 'Possède 50 cartes uniques.', reward: 200, test: (c) => c.uniqueCount >= 50 },
  { id: 'collector-150', label: 'Grand collectionneur', desc: 'Possède 150 cartes uniques.', reward: 500, test: (c) => c.uniqueCount >= 150 },
  { id: 'set-complete', label: 'Set complet !', desc: 'Complète un set à 100 %.', reward: 500, test: (c) => c.completedSets >= 1 },
]

const KEY = 'ygo.achievements.v1'
const SETS_KEY = 'ygo.setsRewarded.v1'

/** Bonus de pièces pour la première complétion d'un set. */
export const SET_COMPLETION_REWARD = 500

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeList(key: string, list: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** Ensemble des succès déjà débloqués. */
export function unlockedIds(): Set<string> {
  return new Set(readList(KEY))
}

/**
 * Débloque les succès nouvellement atteints, les persiste, et renvoie la
 * liste des nouveaux succès + le total de pièces gagnées.
 */
export function checkAchievements(ctx: AchievementCtx): {
  newly: Achievement[]
  reward: number
} {
  const unlocked = unlockedIds()
  const newly = ACHIEVEMENTS.filter((a) => !unlocked.has(a.id) && a.test(ctx))
  if (newly.length > 0) {
    newly.forEach((a) => unlocked.add(a.id))
    writeList(KEY, [...unlocked])
  }
  return { newly, reward: newly.reduce((s, a) => s + a.reward, 0) }
}

/**
 * Récompense la première complétion (100 %) des sets fournis. Renvoie les
 * noms nouvellement complétés + le total de pièces.
 */
export function rewardNewlyCompletedSets(completedSetNames: string[]): {
  newly: string[]
  reward: number
} {
  const done = new Set(readList(SETS_KEY))
  const newly = completedSetNames.filter((n) => !done.has(n))
  if (newly.length > 0) {
    newly.forEach((n) => done.add(n))
    writeList(SETS_KEY, [...done])
  }
  return { newly, reward: newly.length * SET_COMPLETION_REWARD }
}
