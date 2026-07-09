import { useEffect, useMemo, useState } from 'react'
import type { Card, SetDef } from './types'
import { Header } from './components/Header'
import { SetSelect } from './components/SetSelect'
import { PackOpening } from './components/PackOpening'
import { Collection } from './components/Collection'
import { Catalog } from './components/Catalog'
import { Profile } from './components/Profile'
import { CardModal } from './components/CardModal'
import { SettingsModal } from './components/SettingsModal'
import { useToast } from './components/Toast'
import { fetchSetCards, knownSetSize } from './api/ygoprodeck'
import { generatePack } from './game/packOpening'
import { PACK_COST, dustFromPack } from './game/economy'
import {
  MAX_PACKS_PER_DAY,
  canOpenToday,
  packsRemainingToday,
  recordPacks,
} from './game/dailyLimit'
import { claimDailyBonus } from './game/dailyBonus'
import { isPityDue, registerPack } from './game/pity'
import { recordOpening } from './game/stats'
import {
  SET_COMPLETION_REWARD,
  checkAchievements,
  rewardNewlyCompletedSets,
} from './game/achievements'
import { playCoins } from './game/sound'
import { CURATED_SETS } from './data/curatedSets'
import { cardKey, useCollection } from './store/collection'
import './styles/app.css'

export type View = 'sets' | 'opening' | 'collection' | 'catalog' | 'profile'

interface OpenedPack {
  set: SetDef
  cards: Card[]
  newFlags: boolean[]
  dust: number
  offline: boolean
  packCount: number
}

export default function App() {
  const store = useCollection()
  const { notify } = useToast()
  const [view, setView] = useState<View>('sets')
  const [loadingSet, setLoadingSet] = useState<string | null>(null)
  const [opened, setOpened] = useState<OpenedPack | null>(null)
  const [inspecting, setInspecting] = useState<Card | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [remaining, setRemaining] = useState<number>(() => packsRemainingToday())

  const collectionCount = useMemo(
    () => Object.keys(store.collection).length,
    [store.collection],
  )

  // Bonus quotidien : crédité une fois par jour au lancement.
  useEffect(() => {
    const bonus = claimDailyBonus()
    if (bonus > 0) {
      store.addCoins(bonus)
      playCoins()
      notify(`Bonus quotidien : +${bonus} 🪙`, 'reward')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openPacks(set: SetDef, count: number) {
    if (loadingSet) return
    if (!canOpenToday()) {
      setRemaining(0)
      notify('Limite de paquets atteinte pour aujourd’hui.', 'error')
      return
    }
    // On borne par les pièces ET les paquets restants.
    const n = Math.min(
      count,
      remaining,
      Math.floor(store.coins / PACK_COST),
    )
    if (n <= 0) {
      notify('Pas assez de pièces ou de paquets restants.', 'error')
      return
    }

    setLoadingSet(set.apiName)
    try {
      const { cards, offline } = await fetchSetCards(set.apiName)
      if (cards.length === 0) {
        notify('Ce set est indisponible.', 'error')
        return
      }

      const ownedBefore = store.ownedKeys
      const seen = new Set(ownedBefore)
      const all: Card[] = []
      const newFlags: boolean[] = []
      let guaranteed = 0

      for (let p = 0; p < n; p++) {
        const due = isPityDue()
        const pack = generatePack(cards, Math.random, {
          guaranteeHighRarity: due,
        })
        registerPack(pack)
        if (due) guaranteed++
        for (const c of pack) {
          const key = cardKey(c)
          newFlags.push(!seen.has(key))
          seen.add(key)
          all.push(c)
        }
      }

      const dust = dustFromPack(all, ownedBefore, cardKey)
      store.addCards(all, dust - n * PACK_COST)
      setRemaining(recordPacks(n))

      setOpened({ set, cards: all, newFlags, dust, offline, packCount: n })
      setView('opening')

      if (offline) notify('Mode hors-ligne : cartes de démonstration.', 'info')
      if (guaranteed > 0) {
        notify(`Pity timer : carte rare garantie ✨`, 'reward')
      }

      // --- Stats, succès et récompenses de complétion ---
      const stats = recordOpening(n, all)
      const completed = CURATED_SETS.filter((s) => {
        const size = knownSetSize(s.apiName)
        if (size <= 0) return false
        const prefix = `${s.apiName}::`
        let owned = 0
        for (const k of seen) if (k.startsWith(prefix)) owned++
        return owned >= size
      }).map((s) => s.apiName)

      const setRes = rewardNewlyCompletedSets(completed)
      const achRes = checkAchievements({
        stats,
        uniqueCount: seen.size,
        completedSets: completed.length,
      })
      const rewardTotal = setRes.reward + achRes.reward
      if (rewardTotal > 0) {
        store.addCoins(rewardTotal)
        playCoins()
      }
      setRes.newly.forEach((name) =>
        notify(`Set complété : ${name} (+${SET_COMPLETION_REWARD} 🪙)`, 'reward'),
      )
      achRes.newly.forEach((a) =>
        notify(`Succès : ${a.label} (+${a.reward} 🪙)`, 'reward'),
      )
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
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {view === 'sets' && (
        <SetSelect
          coins={store.coins}
          packsRemaining={remaining}
          loadingSet={loadingSet}
          onOpen={openPacks}
        />
      )}

      {view === 'catalog' && (
        <Catalog onOpen={openPacks} loadingSet={loadingSet} />
      )}

      {view === 'opening' && opened && (
        <PackOpening
          set={opened.set}
          pack={opened.cards}
          newFlags={opened.newFlags}
          dustEarned={opened.dust}
          offline={opened.offline}
          packCount={opened.packCount}
          canOpenAnother={remaining > 0 && store.coins >= PACK_COST}
          onOpenAnother={() => openPacks(opened.set, 1)}
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

      {view === 'profile' && <Profile collection={store.collection} />}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

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
