// Types partagés de l'application.

/** Tiers de rareté normalisés utilisés dans tout le jeu. */
export type Rarity =
  | 'Common'
  | 'Rare'
  | 'Super Rare'
  | 'Ultra Rare'
  | 'Secret Rare'

/** Image d'une carte telle que renvoyée par l'API YGOPRODeck. */
export interface CardImage {
  id: number
  image_url: string
  image_url_small: string
}

/** Association carte <-> set, contient la rareté dans ce set précis. */
export interface CardSetInfo {
  set_name: string
  set_code?: string
  set_rarity: string
  set_price?: string
}

/**
 * Carte brute renvoyée par l'API YGOPRODeck (champs utiles seulement).
 * Voir https://ygoprodeck.com/api-guide/
 */
export interface ApiCard {
  id: number
  name: string
  type: string
  desc?: string
  atk?: number
  def?: number
  level?: number
  race?: string
  attribute?: string
  card_images: CardImage[]
  card_sets?: CardSetInfo[]
}

/**
 * Carte normalisée pour un set donné : la rareté est résolue pour CE set.
 * C'est l'unité manipulée par la logique de paquet et la collection.
 */
export interface Card {
  id: number
  name: string
  type: string
  desc?: string
  atk?: number
  def?: number
  level?: number
  race?: string
  attribute?: string
  imageUrl: string
  imageUrlSmall: string
  rarity: Rarity
  /** Nom du set dont provient cette version de la carte. */
  setName: string
}

/** Définition d'un booster curaté. */
export interface SetDef {
  /** Nom exact du set côté API YGOPRODeck (paramètre `cardset`). */
  apiName: string
  /** Libellé affiché à l'utilisateur. */
  label: string
  /** Courte description / accroche. */
  blurb: string
  /** Couleurs du visuel de pack (dégradé CSS). */
  colors: [string, string]
  /** Emoji/symbole décoratif du pack. */
  emblem: string
}

/** Entrée de collection : une carte possédée et sa quantité. */
export interface CollectionEntry {
  card: Card
  count: number
}

/** État persistant de la collection, indexé par `setName::id`. */
export type CollectionState = Record<string, CollectionEntry>
