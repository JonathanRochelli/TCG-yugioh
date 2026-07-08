import type { ApiCard, Card } from '../types'
import { normalizeRarity } from '../game/rarity'
import { FALLBACK_CARDS } from '../data/fallbackCards'

const API_BASE = 'https://db.ygoprodeck.com/api/v7'
const CACHE_PREFIX = 'ygo.set.v1:'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 jours
const FETCH_TIMEOUT_MS = 8000 // au-delà : repli hors-ligne

interface CachedSet {
  ts: number
  cards: Card[]
}

/**
 * Normalise une carte brute de l'API vers notre `Card`, pour un set donné.
 * On sélectionne l'entrée `card_sets` correspondant au set demandé afin
 * d'obtenir la bonne rareté (une carte peut exister dans plusieurs sets).
 */
export function normalizeCard(raw: ApiCard, setName: string): Card {
  const setInfo =
    raw.card_sets?.find((cs) => cs.set_name === setName) ?? raw.card_sets?.[0]
  const image = raw.card_images?.[0]
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    desc: raw.desc,
    atk: raw.atk,
    def: raw.def,
    level: raw.level,
    race: raw.race,
    attribute: raw.attribute,
    imageUrl: image?.image_url ?? '',
    imageUrlSmall: image?.image_url_small ?? image?.image_url ?? '',
    rarity: normalizeRarity(setInfo?.set_rarity),
    setName,
  }
}

/** Normalise et dédoublonne une liste de cartes brutes pour un set. */
export function normalizeSet(raw: ApiCard[], setName: string): Card[] {
  const byId = new Map<number, Card>()
  for (const c of raw) {
    if (!byId.has(c.id)) byId.set(c.id, normalizeCard(c, setName))
  }
  return [...byId.values()]
}

function readCache(setName: string): Card[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + setName)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedSet
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.cards
  } catch {
    return null
  }
}

function writeCache(setName: string, cards: Card[]): void {
  try {
    const payload: CachedSet = { ts: Date.now(), cards }
    localStorage.setItem(CACHE_PREFIX + setName, JSON.stringify(payload))
  } catch {
    /* quota dépassé / indisponible : on ignore */
  }
}

/** Cartes de secours normalisées pour un set. */
function fallbackFor(setName: string): Card[] {
  const raw = FALLBACK_CARDS[setName]
  return raw ? normalizeSet(raw, setName) : []
}

/**
 * Nombre de cartes connues d'un set (depuis le cache, sinon le dataset de
 * secours). Sert au calcul du pourcentage de complétion. 0 si inconnu.
 */
export function knownSetSize(setName: string): number {
  const cached = readCache(setName)
  if (cached && cached.length > 0) return cached.length
  return fallbackFor(setName).length
}

export interface FetchResult {
  cards: Card[]
  /** true si les données proviennent du repli hors-ligne. */
  offline: boolean
}

/**
 * Récupère les cartes d'un set.
 *
 * Stratégie : cache localStorage frais → API live → repli sur le dataset
 * embarqué (hors-ligne / proxy bloquant). Le résultat live est mis en cache.
 */
export async function fetchSetCards(setName: string): Promise<FetchResult> {
  const cached = readCache(setName)
  if (cached && cached.length > 0) {
    return { cards: cached, offline: false }
  }

  try {
    const url = `${API_BASE}/cardinfo.php?cardset=${encodeURIComponent(setName)}`
    // Timeout : ne jamais bloquer l'UI si le réseau ne répond pas.
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(url, { signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data?: ApiCard[] }
    const cards = normalizeSet(json.data ?? [], setName)
    if (cards.length === 0) throw new Error('set vide')
    writeCache(setName, cards)
    return { cards, offline: false }
  } catch (err) {
    // Réseau bloqué / hors-ligne : on se rabat sur le dataset embarqué.
    console.warn(
      `[ygoprodeck] fetch échoué pour « ${setName} », repli hors-ligne.`,
      err,
    )
    return { cards: fallbackFor(setName), offline: true }
  }
}
