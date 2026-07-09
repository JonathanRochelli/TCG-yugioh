import type { SetDef } from '../types'
import { CURATED_SETS } from '../data/curatedSets'
import { PACK_COST } from '../game/economy'
import { BoosterPack } from './BoosterPack'

interface Props {
  onOpen: (set: SetDef, count: number) => void
  loadingSet: string | null
}

/**
 * Galerie des boosters actuellement disponibles dans le jeu, avec leur
 * visuel réel. Un clic ouvre un paquet.
 */
export function Catalog({ onOpen, loadingSet }: Props) {
  const busy = loadingSet !== null

  return (
    <section>
      <div className="section-head">
        <h1>Boosters disponibles</h1>
        <p className="muted">
          Les boosters actuellement dans le jeu. Clique pour en ouvrir un ·{' '}
          {PACK_COST} 🪙.
        </p>
      </div>

      <div className="gallery-grid">
        {CURATED_SETS.map((set) => (
          <div key={set.apiName} className="gallery-item">
            <BoosterPack
              set={set}
              interactive={!busy}
              onActivate={() => !busy && onOpen(set, 1)}
              className="pack--gallery"
            />
            <div className="gallery-item__name">{set.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
