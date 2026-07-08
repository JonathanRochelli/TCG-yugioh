import type { ApiCard } from '../types'

/**
 * Jeu de données de SECOURS (hors-ligne / dev).
 *
 * L'application récupère normalement les cartes en direct depuis l'API
 * YGOPRODeck (côté navigateur). Mais dans certains environnements (proxy
 * bloquant, hors-ligne) le fetch échoue : on se rabat alors sur ces cartes.
 *
 * Ce sont de vraies cartes (IDs et images YGOPRODeck réels). La répartition
 * par set et les raretés sont une approximation raisonnable ; les données
 * live font foi. Chaque entrée respecte la forme `ApiCard` afin d'être
 * normalisée par le même code que les données live.
 */

function img(id: number) {
  return {
    id,
    image_url: `https://images.ygoprodeck.com/images/cards/${id}.jpg`,
    image_url_small: `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
  }
}

/** Fabrique compacte d'une ApiCard mono-image, mono-set. */
function card(
  id: number,
  name: string,
  type: string,
  setName: string,
  rarity: string,
  extra: Partial<ApiCard> = {},
): ApiCard {
  return {
    id,
    name,
    type,
    card_images: [img(id)],
    card_sets: [{ set_name: setName, set_rarity: rarity }],
    ...extra,
  }
}

const LOB = 'Legend of Blue Eyes White Dragon'
const MRD = 'Metal Raiders'
const PSV = "Pharaoh's Servant"
const SRL = 'Spell Ruler'
const IOC = 'Invasion of Chaos'
const LOD = 'Legacy of Darkness'
const MFC = "Magician's Force"

export const FALLBACK_CARDS: Record<string, ApiCard[]> = {
  [LOB]: [
    card(89631139, 'Blue-Eyes White Dragon', 'Normal Monster', LOB, 'Ultra Rare', { atk: 3000, def: 2500, level: 8, attribute: 'LIGHT', race: 'Dragon' }),
    card(46986414, 'Dark Magician', 'Normal Monster', LOB, 'Ultra Rare', { atk: 2500, def: 2100, level: 7, attribute: 'DARK', race: 'Spellcaster' }),
    card(6368038, 'Gaia The Fierce Knight', 'Normal Monster', LOB, 'Super Rare', { atk: 2300, def: 2100, level: 7, attribute: 'EARTH', race: 'Warrior' }),
    card(91152256, 'Celtic Guardian', 'Normal Monster', LOB, 'Rare', { atk: 1400, def: 1200, level: 4, attribute: 'EARTH', race: 'Warrior' }),
    card(15025844, 'Mystical Elf', 'Normal Monster', LOB, 'Rare', { atk: 800, def: 2000, level: 4, attribute: 'LIGHT', race: 'Spellcaster' }),
    card(40640057, 'Kuriboh', 'Effect Monster', LOB, 'Rare', { atk: 300, def: 200, level: 1, attribute: 'DARK', race: 'Fiend' }),
    card(97590747, 'La Jinn the Mystical Genie of the Lamp', 'Normal Monster', LOB, 'Common', { atk: 1800, def: 1000, level: 4, attribute: 'DARK', race: 'Fiend' }),
    card(13039848, 'Giant Soldier of Stone', 'Normal Monster', LOB, 'Common', { atk: 1300, def: 2000, level: 3, attribute: 'EARTH', race: 'Rock' }),
    card(32452818, 'Beaver Warrior', 'Normal Monster', LOB, 'Common', { atk: 1200, def: 1500, level: 4, attribute: 'EARTH', race: 'Beast-Warrior' }),
    card(41392891, 'Feral Imp', 'Normal Monster', LOB, 'Common', { atk: 1300, def: 1400, level: 4, attribute: 'DARK', race: 'Fiend' }),
    card(88819587, 'Baby Dragon', 'Normal Monster', LOB, 'Common', { atk: 1200, def: 700, level: 3, attribute: 'WIND', race: 'Dragon' }),
    card(71625222, 'Time Wizard', 'Effect Monster', LOB, 'Common', { atk: 500, def: 400, level: 2, attribute: 'WIND', race: 'Spellcaster' }),
  ],
  [MRD]: [
    card(70781052, 'Summoned Skull', 'Normal Monster', MRD, 'Ultra Rare', { atk: 2500, def: 1200, level: 6, attribute: 'DARK', race: 'Fiend' }),
    card(44095762, 'Mirror Force', 'Trap Card', MRD, 'Ultra Rare'),
    card(62279055, 'Magic Cylinder', 'Trap Card', MRD, 'Super Rare'),
    card(26202165, 'Sangan', 'Effect Monster', MRD, 'Super Rare', { atk: 1000, def: 600, level: 3, attribute: 'DARK', race: 'Fiend' }),
    card(78010363, 'Witch of the Black Forest', 'Effect Monster', MRD, 'Rare', { atk: 1100, def: 1200, level: 4, attribute: 'DARK', race: 'Spellcaster' }),
    card(53129443, 'Dark Hole', 'Spell Card', MRD, 'Rare'),
    card(54652250, 'Man-Eater Bug', 'Effect Monster', MRD, 'Rare', { atk: 450, def: 600, level: 2, attribute: 'EARTH', race: 'Insect' }),
    card(4206964, 'Trap Hole', 'Trap Card', MRD, 'Common'),
    card(12607053, 'Waboku', 'Trap Card', MRD, 'Common'),
    card(95727991, 'Catapult Turtle', 'Effect Monster', MRD, 'Common', { atk: 1000, def: 2000, level: 5, attribute: 'WATER', race: 'Aqua' }),
    card(28933734, 'Mask of Darkness', 'Effect Monster', MRD, 'Common', { atk: 900, def: 400, level: 2, attribute: 'DARK', race: 'Fiend' }),
    card(50045299, 'Dragon Capture Jar', 'Trap Card', MRD, 'Common'),
  ],
  [PSV]: [
    card(74677422, 'Red-Eyes B. Dragon', 'Normal Monster', PSV, 'Ultra Rare', { atk: 2400, def: 2000, level: 7, attribute: 'DARK', race: 'Dragon' }),
    card(72302403, 'Swords of Revealing Light', 'Spell Card', PSV, 'Super Rare'),
    card(83968380, 'Jar of Greed', 'Trap Card', PSV, 'Rare'),
    card(41420027, 'Solemn Judgment', 'Trap Card', PSV, 'Super Rare'),
    card(76812113, 'Harpie Lady', 'Normal Monster', PSV, 'Rare', { atk: 1300, def: 1400, level: 4, attribute: 'WIND', race: 'Winged Beast' }),
    card(33396948, 'Exodia the Forbidden One', 'Effect Monster', PSV, 'Ultra Rare', { atk: 1000, def: 1000, level: 3, attribute: 'DARK', race: 'Spellcaster' }),
    card(8124921, 'Right Leg of the Forbidden One', 'Normal Monster', PSV, 'Common', { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster' }),
    card(44519536, 'Left Leg of the Forbidden One', 'Normal Monster', PSV, 'Common', { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster' }),
    card(70903634, 'Right Arm of the Forbidden One', 'Normal Monster', PSV, 'Common', { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster' }),
    card(7902349, 'Left Arm of the Forbidden One', 'Normal Monster', PSV, 'Common', { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster' }),
    card(4031928, 'Change of Heart', 'Spell Card', PSV, 'Common'),
    card(83764718, 'Monster Reborn', 'Spell Card', PSV, 'Common'),
  ],
  [SRL]: [
    card(45986603, 'Snatch Steal', 'Spell Card', SRL, 'Ultra Rare'),
    card(5318639, 'Mystical Space Typhoon', 'Spell Card', SRL, 'Super Rare'),
    card(69140098, 'Gemini Elf', 'Normal Monster', SRL, 'Super Rare', { atk: 1900, def: 900, level: 4, attribute: 'EARTH', race: 'Spellcaster' }),
    card(44763025, 'Delinquent Duo', 'Spell Card', SRL, 'Rare'),
    card(93013676, 'Maha Vailo', 'Effect Monster', SRL, 'Rare', { atk: 1550, def: 1400, level: 4, attribute: 'LIGHT', race: 'Spellcaster' }),
    card(55144522, 'Pot of Greed', 'Spell Card', SRL, 'Rare'),
    card(70828912, 'Cost Down', 'Spell Card', SRL, 'Common'),
    card(20358081, 'Nimble Momonga', 'Effect Monster', SRL, 'Common', { atk: 1000, def: 100, level: 2, attribute: 'EARTH', race: 'Beast' }),
    card(97077563, 'Dark Elf', 'Effect Monster', SRL, 'Common', { atk: 2000, def: 800, level: 4, attribute: 'DARK', race: 'Spellcaster' }),
    card(46448938, 'Rush Recklessly', 'Spell Card', SRL, 'Common'),
    card(3549275, 'The Reliable Guardian', 'Spell Card', SRL, 'Common'),
    card(29401950, 'Mystical Sheep #1', 'Normal Monster', SRL, 'Common', { atk: 1150, def: 900, level: 4, attribute: 'EARTH', race: 'Beast' }),
  ],
  [IOC]: [
    card(72989439, 'Black Luster Soldier - Envoy of the Beginning', 'Effect Monster', IOC, 'Ultra Rare', { atk: 3000, def: 2500, level: 8, attribute: 'LIGHT', race: 'Warrior' }),
    card(82301904, 'Chaos Emperor Dragon - Envoy of the End', 'Effect Monster', IOC, 'Secret Rare', { atk: 3000, def: 2500, level: 8, attribute: 'DARK', race: 'Dragon' }),
    card(40737112, 'Dark Magician of Chaos', 'Effect Monster', IOC, 'Ultra Rare', { atk: 2800, def: 2600, level: 8, attribute: 'DARK', race: 'Spellcaster' }),
    card(9596126, 'Chaos Sorcerer', 'Effect Monster', IOC, 'Super Rare', { atk: 2300, def: 2000, level: 6, attribute: 'DARK', race: 'Spellcaster' }),
    card(16226786, 'Night Assailant', 'Effect Monster', IOC, 'Rare', { atk: 200, def: 300, level: 3, attribute: 'FIRE', race: 'Fiend' }),
    card(4208759, 'Manticore of Darkness', 'Effect Monster', IOC, 'Rare', { atk: 2300, def: 1000, level: 6, attribute: 'FIRE', race: 'Beast' }),
    card(7572887, 'D.D. Warrior Lady', 'Effect Monster', IOC, 'Common', { atk: 1500, def: 1600, level: 4, attribute: 'LIGHT', race: 'Warrior' }),
    card(8131171, 'Sinister Serpent', 'Effect Monster', IOC, 'Common', { atk: 300, def: 250, level: 1, attribute: 'WATER', race: 'Reptile' }),
    card(39507162, 'Mad Sword Beast', 'Effect Monster', IOC, 'Common', { atk: 1400, def: 1200, level: 4, attribute: 'EARTH', race: 'Dinosaur' }),
  ],
  [LOD]: [
    card(3078576, 'Yata-Garasu', 'Effect Monster', LOD, 'Secret Rare', { atk: 200, def: 100, level: 2, attribute: 'WIND', race: 'Winged Beast' }),
    card(46231121, 'Dark Ruler Ha Des', 'Effect Monster', LOD, 'Ultra Rare', { atk: 2450, def: 1600, level: 6, attribute: 'DARK', race: 'Fiend' }),
    card(77585513, 'Jinzo', 'Effect Monster', LOD, 'Ultra Rare', { atk: 2400, def: 1500, level: 6, attribute: 'DARK', race: 'Machine' }),
    card(18036057, 'Airknight Parshath', 'Effect Monster', LOD, 'Super Rare', { atk: 1900, def: 1400, level: 5, attribute: 'LIGHT', race: 'Fairy' }),
    card(79575620, 'Injection Fairy Lily', 'Effect Monster', LOD, 'Super Rare', { atk: 400, def: 1500, level: 3, attribute: 'EARTH', race: 'Spellcaster' }),
    card(43586926, 'Twin-Headed Behemoth', 'Effect Monster', LOD, 'Rare', { atk: 1500, def: 1200, level: 3, attribute: 'WIND', race: 'Dragon' }),
    card(39507162, 'Mad Sword Beast', 'Effect Monster', LOD, 'Common', { atk: 1400, def: 1200, level: 4, attribute: 'EARTH', race: 'Dinosaur' }),
    card(8131171, 'Sinister Serpent', 'Effect Monster', LOD, 'Common', { atk: 300, def: 250, level: 1, attribute: 'WATER', race: 'Reptile' }),
    card(7572887, 'D.D. Warrior Lady', 'Effect Monster', LOD, 'Common', { atk: 1500, def: 1600, level: 4, attribute: 'LIGHT', race: 'Warrior' }),
  ],
  [MFC]: [
    card(98502113, 'Dark Paladin', 'Fusion Monster', MFC, 'Secret Rare', { atk: 2900, def: 2400, level: 8, attribute: 'DARK', race: 'Spellcaster' }),
    card(78706415, 'Reflect Bounder', 'Effect Monster', MFC, 'Ultra Rare', { atk: 1700, def: 1000, level: 4, attribute: 'LIGHT', race: 'Machine' }),
    card(71413901, 'Breaker the Magical Warrior', 'Effect Monster', MFC, 'Super Rare', { atk: 1600, def: 1000, level: 4, attribute: 'DARK', race: 'Spellcaster' }),
    card(21598948, 'Big Shield Gardna', 'Effect Monster', MFC, 'Rare', { atk: 100, def: 2600, level: 4, attribute: 'EARTH', race: 'Warrior' }),
    card(18036057, 'Airknight Parshath', 'Effect Monster', MFC, 'Rare', { atk: 1900, def: 1400, level: 5, attribute: 'LIGHT', race: 'Fairy' }),
    card(39507162, 'Mad Sword Beast', 'Effect Monster', MFC, 'Common', { atk: 1400, def: 1200, level: 4, attribute: 'EARTH', race: 'Dinosaur' }),
    card(7572887, 'D.D. Warrior Lady', 'Effect Monster', MFC, 'Common', { atk: 1500, def: 1600, level: 4, attribute: 'LIGHT', race: 'Warrior' }),
    card(8131171, 'Sinister Serpent', 'Effect Monster', MFC, 'Common', { atk: 300, def: 250, level: 1, attribute: 'WATER', race: 'Reptile' }),
  ],
}
