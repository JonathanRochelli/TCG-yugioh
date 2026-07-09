import { useEffect } from 'react'
import type { Card } from '../types'
import { RARITY_COLOR, isFoil } from '../game/rarity'
import { rarityLabel, translateAttribute, translateRace, translateType } from '../game/i18n'
import { CRAFT_COST, DUST_VALUE } from '../game/economy'
import { CardArt } from './CardArt'
import { Tilt } from './Tilt'

interface Props {
  list: Card[]
  index: number
  dust: number
  ownedCount: (card: Card) => number
  onNavigate: (index: number) => void
  onCraft: (card: Card) => void
  onRecycle: (card: Card) => void
  onClose: () => void
}

export function CardModal({
  list,
  index,
  dust,
  ownedCount,
  onNavigate,
  onCraft,
  onRecycle,
  onClose,
}: Props) {
  const card = list[index]
  const count = ownedCount(card)
  const craftCost = CRAFT_COST[card.rarity]
  const hasNav = list.length > 1

  const prev = () => onNavigate((index - 1 + list.length) % list.length)
  const next = () => onNavigate((index + 1) % list.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && hasNav) prev()
      else if (e.key === 'ArrowRight' && hasNav) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, list, hasNav])

  const rarityClass = `r-${card.rarity.replace(/\s+/g, '-')}`
  const stats: Array<[string, string | number | undefined]> = [
    ['Type', translateType(card.type)],
    ['Attribut', translateAttribute(card.attribute)],
    ['Race', translateRace(card.race)],
    ['Niveau', card.level],
    ['ATK', card.atk],
    ['DEF', card.def],
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {hasNav && (
        <button
          className="modal-nav modal-nav--prev"
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Carte précédente"
        >
          ‹
        </button>
      )}

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
              <span className="modal__owned">
                {count > 0 ? `Possédée ×${count}` : 'Non possédée'}
              </span>
              {card.price && Number(card.price) > 0 && (
                <span className="modal__price" title="Prix indicatif (marché)">
                  ~${card.price}
                </span>
              )}
            </div>

            <div className="modal__craft">
              {count === 0 ? (
                <button
                  disabled={dust < craftCost}
                  onClick={() => onCraft(card)}
                  title={`Fabriquer cette carte pour ${craftCost} poussière`}
                >
                  Fabriquer · {craftCost} ✨
                </button>
              ) : count > 1 ? (
                <button className="secondary" onClick={() => onRecycle(card)}>
                  Recycler 1 · +{DUST_VALUE[card.rarity]} ✨
                </button>
              ) : (
                <span className="muted modal__craft-hint">
                  Recyclable dès que tu en as un double.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasNav && (
        <button
          className="modal-nav modal-nav--next"
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          aria-label="Carte suivante"
        >
          ›
        </button>
      )}
    </div>
  )
}
