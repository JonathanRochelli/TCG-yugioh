import { useEffect } from 'react'
import type { Card } from '../types'
import { RARITY_COLOR, isFoil } from '../game/rarity'
import { rarityLabel, translateAttribute, translateType } from '../game/i18n'
import { CardArt } from './CardArt'
import { Tilt } from './Tilt'

interface Props {
  card: Card
  ownedCount: number
  onClose: () => void
}

export function CardModal({ card, ownedCount, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rarityClass = `r-${card.rarity.replace(/\s+/g, '-')}`
  const stats: Array<[string, string | number | undefined]> = [
    ['Type', translateType(card.type)],
    ['Attribut', translateAttribute(card.attribute)],
    ['Race', card.race],
    ['Niveau', card.level],
    ['ATK', card.atk],
    ['DEF', card.def],
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ ['--rarity' as string]: RARITY_COLOR[card.rarity] }}
      >
        <button className="modal__close secondary" onClick={onClose}>
          ✕
        </button>
        <div className="modal__body">
          <Tilt className={`modal__art ${isFoil(card.rarity) ? 'modal__art--foil' : ''}`}>
            {isFoil(card.rarity) && <div className="reveal__holo" />}
            <CardArt card={card} />
          </Tilt>
          <div className="modal__info">
            <h2>{card.name}</h2>
            <div className="modal__chips">
              <span className={`rarity-chip ${rarityClass}`}>{rarityLabel(card.rarity)}</span>
              <span className="rarity-chip r-Common">{card.setName}</span>
            </div>
            <dl className="modal__stats">
              {stats
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            {card.desc && <p className="modal__desc muted">{card.desc}</p>}
            <div className="modal__footer">
              <span className="modal__owned">Possédée ×{ownedCount}</span>
              {card.price && Number(card.price) > 0 && (
                <span className="modal__price" title="Prix indicatif (marché)">
                  ~${card.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
