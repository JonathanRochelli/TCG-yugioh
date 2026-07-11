import cardBackSvg from '../assets/card-back.svg'

/**
 * Images personnalisées (tes propres fichiers, dont tu détiens les droits).
 *
 * Konami détient les visuels officiels Yu-Gi-Oh : je ne les fournis pas.
 * Toi, tu peux déposer tes fichiers et l'app les utilisera automatiquement.
 *
 * MODE D'EMPLOI :
 *   1. Dépose tes images dans le dossier `public/` du projet :
 *        • Dos de carte  ->  public/card-back.png
 *        • Boosters       ->  public/packs/<slug>.png
 *      où <slug> correspond au set (voir `packImageFor` ci-dessous) :
 *        legend-of-blue-eyes-white-dragon, metal-raiders, pharaohs-servant,
 *        spell-ruler, invasion-of-chaos, legacy-of-darkness, magicians-force
 *   2. Passe le réglage correspondant ci-dessous à `true`.
 *
 * Si une image manque, l'app retombe proprement sur le visuel « maison ».
 */

/** Utiliser une image perso pour le dos de carte (public/card-back.png). */
export const USE_CUSTOM_CARD_BACK = true
/** Utiliser des images perso pour les boosters (public/packs/<slug>.png). */
export const USE_CUSTOM_PACK_IMAGES = true

const BASE = import.meta.env.BASE_URL

/**
 * Version des assets (images perso). À incrémenter dès qu'on remplace une
 * image en gardant le même nom de fichier : l'URL change (`?v=…`), ce qui
 * force le navigateur ET le service worker à retélécharger la nouvelle image
 * au lieu de servir l'ancienne version en cache.
 */
const ASSET_VERSION = '5'

/** Dos de carte « maison » (repli, toujours disponible). */
export const CARD_BACK_FALLBACK: string = cardBackSvg

/** Dos de carte affiché (image perso si activée, sinon repli). */
export const CARD_BACK: string = USE_CUSTOM_CARD_BACK
  ? `${BASE}card-back.png?v=${ASSET_VERSION}`
  : cardBackSvg

/** Transforme un nom de set en nom de fichier (slug). */
export function slugifySet(apiName: string): string {
  return apiName
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** URL de l'image de booster perso pour un set, si le mode est activé. */
export function packImageFor(apiName: string): string | undefined {
  if (!USE_CUSTOM_PACK_IMAGES) return undefined
  return `${BASE}packs/${slugifySet(apiName)}.png?v=${ASSET_VERSION}`
}
