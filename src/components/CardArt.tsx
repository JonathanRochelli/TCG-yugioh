import { useState } from 'react'
import type { Card } from '../types'

interface Props {
  card: Card
  /** Utilise la petite image (grilles) plutôt que la grande. */
  small?: boolean
}

/**
 * Affiche l'illustration d'une carte, avec repli élégant si l'image ne
 * charge pas (fréquent hors-ligne / proxy bloquant les images YGOPRODeck).
 */
export function CardArt({ card, small }: Props) {
  const [broken, setBroken] = useState(false)
  const src = small ? card.imageUrlSmall : card.imageUrl

  if (broken || !src) {
    return (
      <div className="card-art card-art--placeholder">
        <span className="card-art__name">{card.name}</span>
        <span className="card-art__meta">{card.type}</span>
      </div>
    )
  }

  return (
    <img
      className="card-art"
      src={src}
      alt={card.name}
      loading="lazy"
      draggable={false}
      onError={() => setBroken(true)}
    />
  )
}
