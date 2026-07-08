import type { SetDef } from '../types'
import { CURATED_SETS } from '../data/curatedSets'
import { PACK_COST } from '../game/economy'

interface Props {
  coins: number
  packsRemaining: number
  loadingSet: string | null
  onOpen: (set: SetDef) => void
}

export function SetSelect({ coins, packsRemaining, loadingSet, onOpen }: Props) {
  const noPacksLeft = packsRemaining <= 0

  return (
    <section>
      <div className="section-head">
        <h1>Choisis ton booster</h1>
        <p className="muted">
          Chaque paquet contient 9 cartes dont une carte rare garantie. Coût :{' '}
          {PACK_COST} 🪙.
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
          const disabled =
            loading || coins < PACK_COST || noPacksLeft || loadingSet !== null
          return (
            <div className="pack-card" key={set.apiName}>
              <div
                className="pack-art"
                style={{
                  background: `linear-gradient(160deg, ${set.colors[0]}, ${set.colors[1]})`,
                }}
              >
                <div className="pack-art__shine" />
                <div className="pack-art__emblem">{set.emblem}</div>
                <div className="pack-art__label">{set.label}</div>
              </div>
              <div className="pack-card__body">
                <p className="pack-card__blurb muted">{set.blurb}</p>
                <button
                  className="pack-card__cta"
                  disabled={disabled}
                  onClick={() => onOpen(set)}
                >
                  {loading
                    ? 'Ouverture…'
                    : coins < PACK_COST
                      ? 'Pas assez de 🪙'
                      : `Ouvrir · ${PACK_COST} 🪙`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
