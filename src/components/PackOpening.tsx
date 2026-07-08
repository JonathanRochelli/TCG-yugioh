import { useMemo, useState } from 'react'
import type { Card, SetDef } from '../types'
import { CardReveal } from './CardReveal'
import { BoosterPack } from './BoosterPack'
import { rarityRank } from '../game/rarity'

interface Props {
  set: SetDef
  pack: Card[]
  /** Aligné sur `pack` : true si la carte est nouvelle dans la collection. */
  newFlags: boolean[]
  dustEarned: number
  offline: boolean
  canOpenAnother: boolean
  onOpenAnother: () => void
  onGoCollection: () => void
  onInspect: (card: Card) => void
}

type Phase = 'pack' | 'reveal'

export function PackOpening({
  set,
  pack,
  newFlags,
  dustEarned,
  offline,
  canOpenAnother,
  onOpenAnother,
  onGoCollection,
  onInspect,
}: Props) {
  const [phase, setPhase] = useState<Phase>('pack')
  const [tearing, setTearing] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const allRevealed = revealed.size === pack.length

  /** Meilleure carte du paquet (pour la mettre en avant dans le récap). */
  const best = useMemo(() => {
    let idx = 0
    for (let i = 1; i < pack.length; i++) {
      if (rarityRank(pack[i].rarity) > rarityRank(pack[idx].rarity)) idx = i
    }
    return idx
  }, [pack])

  function tear() {
    setTearing(true)
    window.setTimeout(() => setPhase('reveal'), 650)
  }

  function reveal(i: number) {
    setRevealed((prev) => new Set(prev).add(i))
  }

  function revealAll() {
    setRevealed(new Set(pack.map((_, i) => i)))
  }

  if (phase === 'pack') {
    return (
      <section className="opening">
        <BoosterPack
          set={set}
          interactive
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
        <h2>{set.label}</h2>
        {!allRevealed ? (
          <button className="secondary" onClick={revealAll}>
            Tout révéler
          </button>
        ) : (
          <span className="pill pill--ok">Paquet ouvert !</span>
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
            revealed={revealed.has(i)}
            isNew={newFlags[i]}
            onReveal={() => reveal(i)}
            onInspect={() => onInspect(card)}
          />
        ))}
      </div>

      {allRevealed && (
        <div className="recap">
          <div className="recap__highlight">
            <span className="muted">Meilleure carte</span>
            <strong>{pack[best].name}</strong>
            <span className={`rarity-chip r-${pack[best].rarity.replace(/\s+/g, '-')}`}>
              {pack[best].rarity}
            </span>
          </div>
          {dustEarned > 0 && (
            <div className="recap__dust">
              +{dustEarned} 🪙 de poussière (doublons recyclés)
            </div>
          )}
          <div className="recap__actions">
            <button onClick={onOpenAnother} disabled={!canOpenAnother}>
              {canOpenAnother ? 'Ouvrir un autre' : 'Limite atteinte'}
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
