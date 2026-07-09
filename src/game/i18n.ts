import type { Rarity } from '../types'

/**
 * Traductions côté client pour les champs que l'API YGOPRODeck ne localise
 * pas (type, attribut) et le libellé de rareté "Common".
 */

const TYPE_FR: Record<string, string> = {
  'Normal Monster': 'Monstre Normal',
  'Effect Monster': 'Monstre à Effet',
  'Flip Effect Monster': 'Monstre à Effet Flip',
  'Union Effect Monster': 'Monstre à Effet Union',
  'Spirit Monster': 'Monstre Esprit',
  'Gemini Monster': 'Monstre Gémeau',
  'Toon Monster': 'Monstre Toon',
  'Tuner Monster': 'Monstre Syntoniseur',
  'Normal Tuner Monster': 'Monstre Syntoniseur Normal',
  'Pendulum Effect Monster': 'Monstre à Effet Pendule',
  'Pendulum Normal Monster': 'Monstre Normal Pendule',
  'Fusion Monster': 'Monstre Fusion',
  'Ritual Monster': 'Monstre Rituel',
  'Ritual Effect Monster': 'Monstre à Effet Rituel',
  'Synchro Monster': 'Monstre Synchro',
  'Synchro Tuner Monster': 'Monstre Syntoniseur Synchro',
  'XYZ Monster': 'Monstre Xyz',
  'Link Monster': 'Monstre Lien',
  'Spell Card': 'Carte Magie',
  'Trap Card': 'Carte Piège',
  'Token': 'Jeton',
  'Skill Card': 'Carte Compétence',
}

const ATTRIBUTE_FR: Record<string, string> = {
  DARK: 'TÉNÈBRES',
  LIGHT: 'LUMIÈRE',
  EARTH: 'TERRE',
  WATER: 'EAU',
  FIRE: 'FEU',
  WIND: 'VENT',
  DIVINE: 'DIVIN',
}

const RACE_FR: Record<string, string> = {
  // Types de monstres
  Aqua: 'Aqua',
  Beast: 'Bête',
  'Beast-Warrior': 'Bête-Guerrier',
  'Creator-God': 'Dieu Créateur',
  Cyberse: 'Cyberse',
  Dinosaur: 'Dinosaure',
  'Divine-Beast': 'Bête Divine',
  Dragon: 'Dragon',
  Fairy: 'Elfe',
  Fiend: 'Démon',
  Fish: 'Poisson',
  Illusion: 'Illusion',
  Insect: 'Insecte',
  Machine: 'Machine',
  Plant: 'Plante',
  Psychic: 'Psychique',
  Pyro: 'Pyro',
  Reptile: 'Reptile',
  Rock: 'Rocher',
  'Sea Serpent': 'Serpent de Mer',
  Spellcaster: 'Magicien',
  Thunder: 'Tonnerre',
  Warrior: 'Guerrier',
  'Winged Beast': 'Bête Ailée',
  Wyrm: 'Wyrm',
  Zombie: 'Zombie',
  // Propriétés des Magies / Pièges
  Normal: 'Normale',
  Continuous: 'Continue',
  Equip: 'Équipement',
  'Quick-Play': 'Jeu-Rapide',
  Field: 'Terrain',
  Ritual: 'Rituelle',
  Counter: 'Contre',
}

const RARITY_FR: Record<Rarity, string> = {
  Common: 'Commune',
  Rare: 'Rare',
  'Super Rare': 'Super Rare',
  'Ultra Rare': 'Ultra Rare',
  'Secret Rare': 'Secret Rare',
}

/** Traduit le type d'une carte (avec repli générique si inconnu). */
export function translateType(type: string | undefined): string {
  if (!type) return ''
  if (TYPE_FR[type]) return TYPE_FR[type]
  return type
    .replace('Spell Card', 'Carte Magie')
    .replace('Trap Card', 'Carte Piège')
    .replace('Effect Monster', 'Monstre à Effet')
    .replace('Normal Monster', 'Monstre Normal')
    .replace('Monster', 'Monstre')
}

/** Traduit l'attribut d'une carte (inchangé si inconnu). */
export function translateAttribute(attr: string | undefined): string {
  if (!attr) return ''
  return ATTRIBUTE_FR[attr.toUpperCase()] ?? attr
}

/** Traduit la race / propriété d'une carte (inchangée si inconnue). */
export function translateRace(race: string | undefined): string {
  if (!race) return ''
  return RACE_FR[race] ?? race
}

/** Libellé français d'une rareté (pour l'affichage). */
export function rarityLabel(r: Rarity): string {
  return RARITY_FR[r] ?? r
}
