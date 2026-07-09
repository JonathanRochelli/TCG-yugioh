/**
 * Sauvegarde / restauration de la progression (collection, pièces, stats…).
 * Tout ce qui est stocké sous le préfixe `ygo.` dans le localStorage.
 */

const PREFIX = 'ygo.'

function ownKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) keys.push(k)
  }
  return keys
}

/** Sérialise la progression en JSON. */
export function exportSaveJson(): string {
  const data: Record<string, string> = {}
  for (const k of ownKeys()) {
    const v = localStorage.getItem(k)
    if (v != null) data[k] = v
  }
  return JSON.stringify(
    { app: 'tcg-yugioh', version: 1, exportedAt: new Date().toISOString(), data },
    null,
    2,
  )
}

/** Déclenche le téléchargement d'un fichier de sauvegarde. */
export function downloadSave(): void {
  const blob = new Blob([exportSaveJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ygo-boosters-save-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface ImportResult {
  ok: boolean
  error?: string
}

/** Restaure une sauvegarde JSON (remplace la progression existante). */
export function importSaveJson(text: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Fichier JSON illisible.' }
  }
  const data = (parsed as { data?: unknown } | null)?.data
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Fichier de sauvegarde invalide.' }
  }
  const entries = Object.entries(data as Record<string, unknown>).filter(
    ([k, v]) => k.startsWith(PREFIX) && typeof v === 'string',
  )
  if (entries.length === 0) {
    return { ok: false, error: 'Aucune donnée valide trouvée.' }
  }
  try {
    for (const k of ownKeys()) localStorage.removeItem(k)
    for (const [k, v] of entries) localStorage.setItem(k, v as string)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Écriture impossible (stockage plein ?).' }
  }
}
