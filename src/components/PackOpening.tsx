import { useMemo, useRef, useState } from 'react'
import type { Card, SetDef } from '../types'
import { CardReveal } from './CardReveal'
import { BoosterPack } from './BoosterPack'
import { rarityRank } from '../game/rarity'
import { rarityLabel } from '../game/i18n'
import { playFlip, playRareJingle, playTear } from '../game/sound'
import { burstConfetti } from '../game/confetti'

interface Props {
  set: SetDef
  pack: Card[]
  /** Aligné sur `pack` : true si la carte est nouvelle dans la collection. */
  newFlags: boolean[]
  dustEarned: number
  offline: boolean
  /** Nombre de paquets ouverts (ouverture multiple). */
  packCount: number
  canOpenAnother: boolean
  onOpenAnother: () => void
  onGoCollection: () => void
  onInspect: (list: Card[], index: number) => void
}

type Phase = 'pack' | 'reveal'

export function PackOpening({
  set,
  pack,
  newFlags,
  dustEarned,
  offline,
  packCount,
  canOpenAnother,
  onOpenAnother,
  onGoCollection,
  onInspect,
}: Props) {
  const [phase, setPhase] = useState<Phase>('pack')
  const [tearing, setTearing] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const feedbackDone = useRef(false)

  const allRevealed = revealed.size === pack.length
  const newCount = useMemo(() => newFlags.filter(Boolean).length, [newFlags])

  /** Meilleure carte du lot (pour la mettre en avant dans le récap). */
  const best = useMemo(() => {
    let idx = 0
    for (let i = 1; i < pack.length; i++) {
      if (rarityRank(pack[i].rarity) > rarityRank(pack[idx].rarity)) idx = i
    }
    return idx
  }, [pack])

  function tear() {
    setTearing(true)
    playTear()
    window.setTimeout(() => setPhase('reveal'), 1300)
  }

  /** Confettis + jingle sur la meilleure carte du lot (une seule fois). */
  function bestFeedback() {
    if (feedbackDone.current) return
    feedbackDone.current = true
    const card = pack[best]
    playRareJingle(card.rarity)
    if (rarityRank(card.rarity) >= rarityRank('Ultra Rare')) burstConfetti()
  }

  function reveal(i: number) {
    if (!revealed.has(i)) playFlip()
    if (i === best) bestFeedback()
    setRevealed((prev) => new Set(prev).add(i))
  }

  function revealAll() {
    playFlip()
    bestFeedback()
    setRevealed(new Set(pack.map((_, i) => i)))
  }

  if (phase === 'pack') {
    return (
      <section className="opening">
        {packCount > 1 && (
          <div className="opening__count pill">{packCount} paquets</div>
        )}
        <BoosterPack
          set={set}
          interactive
          tearFx
          onActivate={tear}
          className={`pack--booster ${tearing ? 'pack--tear' : ''}`}
        >
          <div className="pack__hint">
            {tearing ? 'Ouverture…' : 'Clique pour déchirer'}
          </div>
        </BoosterPack>
      </section>
    )
  }

  return (
    <section className="opening">
      <div className="opening__head">
        <h2>
          {set.label}
          {packCount > 1 && <span className="muted"> · ×{packCount}</span>}
        </h2>
        {!allRevealed && (
          <button className="secondary" onClick={revealAll}>
            Tout révéler
          </button>
        )}
      </div>

      {offline && (
        <div className="banner banner--info">
          Mode hors-ligne : cartes de démonstration (l'API n'est pas joignable
          ici). Dans ton navigateur, l'app charge les vraies cartes.
        </div>
      )}

      <div className="reveal-grid">
        {pack.map((card, i) => (
          <CardReveal
            key={i}
            card={card}
            index={i}
            revealed={revealed.has(i)}
            isNew={newFlags[i]}
            onReveal={() => reveal(i)}
            onInspect={() => onInspect(pack, i)}
          />
        ))}
      </div>

      {allRevealed && (
        <div className="recap">
          <div className="recap__highlight">
            <span className="muted">Meilleure carte</span>
            <strong>{pack[best].name}</strong>
            <span className={`rarity-chip r-${pack[best].rarity.replace(/\s+/g, '-')}`}>
              {rarityLabel(pack[best].rarity)}
            </span>
          </div>
          <div className="recap__stats muted">
            {pack.length} cartes · {newCount} nouvelle{newCount > 1 ? 's' : ''}
            {dustEarned > 0 && <> · +{dustEarned} ✨ de poussière</>}
          </div>
          <div className="recap__actions">
            <button onClick={onOpenAnother} disabled={!canOpenAnother}>
              {canOpenAnother ? 'Ouvrir encore' : 'Indisponible'}
            </button>
            <button className="secondary" onClick={onGoCollection}>
              Voir la collection
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
