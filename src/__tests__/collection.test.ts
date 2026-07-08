import { describe, it, expect } from 'vitest'
import { addCardTo, cardKey } from '../store/collection'
import { dustFromPack, DUST_VALUE } from '../game/economy'
import type { Card, CollectionState } from '../types'

function mkCard(id: number, rarity: Card['rarity'], setName = 'Set A'): Card {
  return {
    id,
    name: `Carte ${id}`,
    type: 'Normal Monster',
    imageUrl: '',
    imageUrlSmall: '',
    rarity,
    setName,
  }
}

describe('addCardTo', () => {
  it('ajoute une nouvelle carte avec count 1', () => {
    const state = addCardTo({}, mkCard(1, 'Common'))
    expect(state[cardKey(mkCard(1, 'Common'))].count).toBe(1)
  })

  it('incrémente le count pour un doublon', () => {
    let state: CollectionState = {}
    state = addCardTo(state, mkCard(1, 'Common'))
    state = addCardTo(state, mkCard(1, 'Common'))
    expect(state[cardKey(mkCard(1, 'Common'))].count).toBe(2)
  })

  it('distingue la même carte de deux sets différents', () => {
    let state: CollectionState = {}
    state = addCardTo(state, mkCard(1, 'Common', 'Set A'))
    state = addCardTo(state, mkCard(1, 'Common', 'Set B'))
    expect(Object.keys(state)).toHaveLength(2)
  })
})

describe('dustFromPack', () => {
  it('ne donne aucune poussière pour des cartes toutes neuves', () => {
    const pack = [mkCard(1, 'Common'), mkCard(2, 'Rare')]
    expect(dustFromPack(pack, new Set(), cardKey)).toBe(0)
  })

  it('recycle les cartes déjà possédées', () => {
    const owned = new Set([cardKey(mkCard(1, 'Ultra Rare'))])
    const pack = [mkCard(1, 'Ultra Rare'), mkCard(2, 'Common')]
    expect(dustFromPack(pack, owned, cardKey)).toBe(DUST_VALUE['Ultra Rare'])
  })

  it('recycle les doublons internes au paquet', () => {
    const pack = [mkCard(3, 'Rare'), mkCard(3, 'Rare')]
    // Le premier est neuf, le second est un doublon.
    expect(dustFromPack(pack, new Set(), cardKey)).toBe(DUST_VALUE['Rare'])
  })
})
