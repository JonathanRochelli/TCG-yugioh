import type { Card } from '../types'
import { RARITY_COLOR, isFoil } from '../game/rarity'
import { CardArt } from './CardArt'
import cardBack from '../assets/card-back.svg'

interface Props {
  card: Card
  revealed: boolean
  isNew: boolean
  onReveal: () => void
  onInspect: () => void
}

/**
 * Carte à retourner : dos tant que `revealed` est faux, face + effet foil
 * (pour les raretés supérieures) une fois révélée.
 */
export function CardReveal({ card, revealed, isNew, onReveal, onInspect }: Props) {
  const foil = isFoil(card.rarity)
  const rarityClass = `r-${card.rarity.replace(/\s+/g, '-')}`

  return (
    <div
      className={`reveal ${revealed ? 'reveal--open' : ''} ${
        foil ? 'reveal--foil' : ''
      }`}
      style={{ ['--rarity' as string]: RARITY_COLOR[card.rarity] }}
      onClick={() => (revealed ? onInspect() : onReveal())}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          revealed ? onInspect() : onReveal()
        }
      }}
      aria-label={revealed ? `${card.name} (${card.rarity})` : 'Carte face cachée'}
    >
      <div className="reveal__inner">
        <div className="reveal__back">
          <img className="reveal__back-img" src={cardBack} alt="" draggable={false} />
        </div>
        <div className="reveal__front">
          {foil && <div className="reveal__holo" />}
          <CardArt card={card} small />
          <div className="reveal__badges">
            {isNew && <span className="badge badge--new">NOUVEAU</span>}
            <span className={`rarity-chip ${rarityClass}`}>{card.rarity}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
