import { useMemo, useState } from 'react'
import type { Card, SetDef } from './types'
import { Header } from './components/Header'
import { SetSelect } from './components/SetSelect'
import { PackOpening } from './components/PackOpening'
import { Collection } from './components/Collection'
import { CardModal } from './components/CardModal'
import { fetchSetCards } from './api/ygoprodeck'
import { generatePack } from './game/packOpening'
import { PACK_COST, dustFromPack } from './game/economy'
import {
  MAX_PACKS_PER_DAY,
  canOpenToday,
  packsRemainingToday,
  recordPackOpen,
} from './game/dailyLimit'
import { cardKey, useCollection } from './store/collection'
import './styles/app.css'

export type View = 'sets' | 'opening' | 'collection'

interface OpenedPack {
  set: SetDef
  cards: Card[]
  newFlags: boolean[]
  dust: number
  offline: boolean
}

export default function App() {
  const store = useCollection()
  const [view, setView] = useState<View>('sets')
  const [loadingSet, setLoadingSet] = useState<string | null>(null)
  const [opened, setOpened] = useState<OpenedPack | null>(null)
  const [inspecting, setInspecting] = useState<Card | null>(null)
  const [remaining, setRemaining] = useState<number>(() => packsRemainingToday())

  const collectionCount = useMemo(
    () => Object.keys(store.collection).length,
    [store.collection],
  )

  async function openPack(set: SetDef) {
    if (loadingSet) return
    if (!canOpenToday()) {
      setRemaining(0)
      return
    }
    if (store.coins < PACK_COST) return

    setLoadingSet(set.apiName)
    try {
      const { cards, offline } = await fetchSetCards(set.apiName)
      if (cards.length === 0) {
        setLoadingSet(null)
        return
      }

      // Décompte quotidien au moment de l'ouverture effective.
      const left = recordPackOpen()
      setRemaining(left)

      const pack = generatePack(cards)

      // Doublons calculés AVANT ajout à la collection.
      const ownedBefore = store.ownedKeys
      const newFlags: boolean[] = []
      const seen = new Set(ownedBefore)
      for (const c of pack) {
        const key = cardKey(c)
        newFlags.push(!seen.has(key))
        seen.add(key)
      }
      const dust = dustFromPack(pack, ownedBefore, cardKey)

      // Ajout à la collection + solde net (poussière gagnée - coût du paquet).
      store.addCards(pack, dust - PACK_COST)

      setOpened({ set, cards: pack, newFlags, dust, offline })
      setView('opening')
    } finally {
      setLoadingSet(null)
    }
  }

  return (
    <div className="app">
      <Header
        coins={store.coins}
        packsRemaining={remaining}
        maxPacks={MAX_PACKS_PER_DAY}
        view={view}
        onNavigate={setView}
        collectionCount={collectionCount}
      />

      {view === 'sets' && (
        <SetSelect
          coins={store.coins}
          packsRemaining={remaining}
          loadingSet={loadingSet}
          onOpen={openPack}
        />
      )}

      {view === 'opening' && opened && (
        <PackOpening
          set={opened.set}
          pack={opened.cards}
          newFlags={opened.newFlags}
          dustEarned={opened.dust}
          offline={opened.offline}
          canOpenAnother={remaining > 0 && store.coins >= PACK_COST}
          onOpenAnother={() => openPack(opened.set)}
          onGoCollection={() => setView('collection')}
          onInspect={setInspecting}
        />
      )}

      {view === 'collection' && (
        <Collection
          collection={store.collection}
          onInspect={setInspecting}
          onGoShop={() => setView('sets')}
        />
      )}

      {inspecting && (
        <CardModal
          card={inspecting}
          ownedCount={store.ownedCount(inspecting)}
          onClose={() => setInspecting(null)}
        />
      )}

      <footer className="app-footer muted">
        Données des cartes : API YGOPRODeck. Projet fan non affilié à Konami.
      </footer>
    </div>
  )
}
