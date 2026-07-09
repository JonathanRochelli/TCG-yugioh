import { DAILY_BONUS_COINS } from './economy'
import { dayKey } from './dailyLimit'

const KEY = 'ygo.dailyBonus.v1'

/** Le bonus quotidien a-t-il déjà été réclamé aujourd'hui ? (pur) */
export function bonusClaimed(
  storedDate: string | null,
  today: string = dayKey(),
): boolean {
  return storedDate === today
}

/**
 * Réclame le bonus quotidien s'il ne l'a pas déjà été aujourd'hui.
 * Renvoie le nombre de pièces offertes (0 si déjà réclamé).
 */
export function claimDailyBonus(): number {
  try {
    const today = dayKey()
    if (localStorage.getItem(KEY) === today) return 0
    localStorage.setItem(KEY, today)
    return DAILY_BONUS_COINS
  } catch {
    return 0
  }
}
