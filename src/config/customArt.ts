import cardBackSvg from '../assets/card-back.svg'

/**
 * Dos de carte utilisé sur TOUTES les cartes (avant retournement).
 *
 * Par défaut : le visuel « maison » (SVG intégré, toujours disponible).
 *
 * Pour utiliser TA PROPRE image (dont tu détiens les droits) :
 *   1. Dépose ton fichier dans `src/assets/` (ex. `card-back-custom.jpg`).
 *   2. Importe-le et exporte-le ici à la place :
 *        import myBack from '../assets/card-back-custom.jpg'
 *        export const CARD_BACK: string = myBack
 * Rien d'autre à changer : l'app l'utilisera partout.
 */
export const CARD_BACK: string = cardBackSvg
