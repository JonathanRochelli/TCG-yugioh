import { useEffect, useRef } from 'react'
import { downloadSave, importSaveJson } from '../game/backup'
import { useToast } from './Toast'

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const { notify } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = importSaveJson(String(reader.result))
      if (res.ok) {
        notify('Sauvegarde importée ✓ Rechargement…', 'success')
        setTimeout(() => window.location.reload(), 700)
      } else {
        notify(res.error ?? 'Import échoué.', 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close secondary" onClick={onClose}>
          ✕
        </button>
        <div className="settings">
          <h2>Sauvegarde</h2>
          <p className="muted">
            Ta collection est stockée dans ce navigateur. Exporte-la pour ne
            rien perdre, ou importe-la sur un autre appareil.
          </p>
          <div className="settings__actions">
            <button onClick={downloadSave}>⬇️ Exporter (.json)</button>
            <button
              className="secondary"
              onClick={() => fileRef.current?.click()}
            >
              ⬆️ Importer…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={onFile}
            />
          </div>
          <p className="muted settings__warn">
            ⚠️ L'import remplace la progression actuelle de ce navigateur.
          </p>
        </div>
      </div>
    </div>
  )
}
