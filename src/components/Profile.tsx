import { useMemo } from 'react'
import type { CollectionState } from '../types'
import { getStats } from '../game/stats'
import { ACHIEVEMENTS, unlockedIds } from '../game/achievements'
import { CURATED_SETS } from '../data/curatedSets'
import { knownSetSize } from '../api/ygoprodeck'

interface Props {
  collection: CollectionState
}

export function Profile({ collection }: Props) {
  const stats = useMemo(() => getStats(), [])
  const unlocked = useMemo(() => unlockedIds(), [])
  const entries = useMemo(() => Object.values(collection), [collection])

  const completedSets = useMemo(
    () =>
      CURATED_SETS.filter((s) => {
        const size = knownSetSize(s.apiName)
        const owned = entries.filter((e) => e.card.setName === s.apiName).length
        return size > 0 && owned >= size
      }).length,
    [entries],
  )

  const totalCopies = entries.reduce((s, e) => s + e.count, 0)

  const tiles: Array<[string, string | number]> = [
    ['Paquets ouverts', stats.packsOpened],
    ['Cartes obtenues', stats.cardsObtained],
    ['Cartes uniques', entries.length],
    ['Total (doublons)', totalCopies],
    ['Super Rares', stats.supers],
    ['Ultra Rares', stats.ultras],
    ['Secret Rares', stats.secrets],
    ['Sets complétés', completedSets],
  ]

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length

  return (
    <section>
      <div className="section-head">
        <h1>Profil</h1>
        <p className="muted">
          {unlockedCount}/{ACHIEVEMENTS.length} succès débloqués.
        </p>
      </div>

      <div className="stat-tiles">
        {tiles.map(([label, value]) => (
          <div key={label} className="stat-tile">
            <span className="stat-tile__value">{value}</span>
            <span className="stat-tile__label muted">{label}</span>
          </div>
        ))}
      </div>

      <h2 className="ach-title">Succès</h2>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id)
          return (
            <div key={a.id} className={`ach-card ${done ? 'ach-card--done' : ''}`}>
              <span className="ach-card__icon">{done ? '🏆' : '🔒'}</span>
              <div className="ach-card__body">
                <strong>{a.label}</strong>
                <span className="muted">{a.desc}</span>
              </div>
              <span className="ach-card__reward">+{a.reward} 🪙</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
