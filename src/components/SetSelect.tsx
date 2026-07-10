import type { SetDef } from '../types'
import { CURATED_SETS } from '../data/curatedSets'
import { PACK_COST } from '../game/economy'
import { BoosterPack } from './BoosterPack'

interface Props {
  coins: number
  packsRemaining: number
  loadingSet: string | null
  onOpen: (set: SetDef, count: number) => void
}

const BULK = 5

export function SetSelect({ coins, packsRemaining, loadingSet, onOpen }: Props) {
  const noPacksLeft = packsRemaining <= 0

  return (
    <section>
      <div className="section-head">
        <h1>Choisis ton booster</h1>
        <p className="muted">
          9 cartes par paquet, une carte rare garantie. Coût : {PACK_COST} 🪙.
          Il te reste {packsRemaining} paquet{packsRemaining > 1 ? 's' : ''}{' '}
          aujourd'hui.
        </p>
      </div>

      {noPacksLeft && (
        <div className="banner banner--warn">
          Tu as atteint ta limite de paquets pour aujourd'hui. Reviens demain !
        </div>
      )}

      <div className="pack-grid">
        {CURATED_SETS.map((set) => {
          const loading = loadingSet === set.apiName
          const busy = loadingSet !== null
          const canOne = coins >= PACK_COST && !noPacksLeft
          const canFive = coins >= PACK_COST * BULK && packsRemaining >= BULK
          return (
            <div className="pack-card" key={set.apiName}>
              <BoosterPack set={set} />
              <div className="pack-card__body">
                <p className="pack-card__blurb muted">{set.blurb}</p>
                <div className="pack-card__actions">
                  <button
                    className="pack-card__cta"
                    disabled={busy || !canOne}
                    onClick={() => onOpen(set, 1)}
                  >
                    {loading
                      ? 'Ouverture…'
                      : !canOne
                        ? coins < PACK_COST
                          ? 'Pas assez de 🪙'
                          : 'Limite atteinte'
                        : `Ouvrir · ${PACK_COST} 🪙`}
                  </button>
                  <button
                    className="secondary pack-card__bulk"
                    disabled={busy || !canFive}
                    onClick={() => onOpen(set, BULK)}
                    title={`Ouvrir ${BULK} paquets · ${PACK_COST * BULK} 🪙`}
                  >
                    Ouvrir ×{BULK} · {PACK_COST * BULK} 🪙
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
