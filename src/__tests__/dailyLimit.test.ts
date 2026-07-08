import { describe, it, expect } from 'vitest'
import {
  MAX_PACKS_PER_DAY,
  normalizeDaily,
  remainingFrom,
  dayKey,
  nextReset,
} from '../game/dailyLimit'

describe('normalizeDaily', () => {
  it('réinitialise quand la date change', () => {
    const state = { date: '2020-01-01', opened: 4 }
    expect(normalizeDaily(state, '2020-01-02')).toEqual({
      date: '2020-01-02',
      opened: 0,
    })
  })

  it('conserve le compteur le même jour', () => {
    const state = { date: '2020-01-01', opened: 3 }
    expect(normalizeDaily(state, '2020-01-01')).toEqual(state)
  })

  it('gère un état absent', () => {
    expect(normalizeDaily(null, '2020-01-01').opened).toBe(0)
  })
})

describe('remainingFrom', () => {
  it('renvoie le max pour un nouveau jour', () => {
    expect(remainingFrom(null, '2020-01-01')).toBe(MAX_PACKS_PER_DAY)
  })

  it('décompte les paquets ouverts', () => {
    expect(remainingFrom({ date: '2020-01-01', opened: 2 }, '2020-01-01')).toBe(
      MAX_PACKS_PER_DAY - 2,
    )
  })

  it('ne descend jamais sous zéro', () => {
    expect(
      remainingFrom({ date: '2020-01-01', opened: 999 }, '2020-01-01'),
    ).toBe(0)
  })
})

describe('dayKey / nextReset', () => {
  it('formate la date en AAAA-MM-JJ', () => {
    expect(dayKey(new Date(2020, 0, 5))).toBe('2020-01-05')
  })

  it('nextReset est à minuit le lendemain', () => {
    const now = new Date(2020, 0, 5, 14, 30)
    const next = nextReset(now)
    expect(next.getDate()).toBe(6)
    expect(next.getHours()).toBe(0)
    expect(next.getMinutes()).toBe(0)
  })
})
