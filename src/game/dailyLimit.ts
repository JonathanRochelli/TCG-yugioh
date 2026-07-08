/** Nombre maximum de paquets ouvrables par jour. */
export const MAX_PACKS_PER_DAY = 5

const STORAGE_KEY = 'ygo.dailyLimit.v1'

export interface DailyState {
  /** Date locale AAAA-MM-JJ du dernier suivi. */
  date: string
  /** Nombre de paquets ouverts ce jour-là. */
  opened: number
}

/** Clé de jour locale (AAAA-MM-JJ) pour une date donnée. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Ramène un état au jour courant : si la date stockée diffère d'aujourd'hui,
 * le compteur repart à zéro. Fonction pure (testable).
 */
export function normalizeDaily(
  state: DailyState | null,
  today: string = dayKey(),
): DailyState {
  if (!state || state.date !== today) return { date: today, opened: 0 }
  return state
}

/** Paquets restants pour un état donné (pur). */
export function remainingFrom(
  state: DailyState | null,
  today: string = dayKey(),
): number {
  const norm = normalizeDaily(state, today)
  return Math.max(0, MAX_PACKS_PER_DAY - norm.opened)
}

/** Date/heure de la prochaine remise à zéro (minuit local suivant). */
export function nextReset(now: Date = new Date()): Date {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next
}

// --- Accès localStorage (effets de bord isolés) ---

function read(): DailyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DailyState) : null
  } catch {
    return null
  }
}

function write(state: DailyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* stockage indisponible : on ignore */
  }
}

/** Paquets restants aujourd'hui (lit le localStorage). */
export function packsRemainingToday(): number {
  return remainingFrom(read())
}

/** Peut-on ouvrir un paquet maintenant ? */
export function canOpenToday(): boolean {
  return packsRemainingToday() > 0
}

/**
 * Enregistre l'ouverture d'un paquet et renvoie le nombre restant après.
 * Ne fait rien (renvoie 0) si la limite est déjà atteinte.
 */
export function recordPackOpen(): number {
  const today = dayKey()
  const state = normalizeDaily(read(), today)
  if (state.opened >= MAX_PACKS_PER_DAY) return 0
  const updated: DailyState = { date: today, opened: state.opened + 1 }
  write(updated)
  return remainingFrom(updated, today)
}
