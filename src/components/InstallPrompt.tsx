import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'ygo.installDismissed.v1'

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  const ua = navigator.userAgent || ''
  return /iphone|ipad|ipod/i.test(ua)
}

/** Bannière discrète proposant d'installer la PWA (si l'appareil le permet). */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* ignore */
    }

    const win = window as unknown as { __bipEvent?: BeforeInstallPromptEvent }

    const show = (e: BeforeInstallPromptEvent) => {
      setDeferred(e)
      setVisible(true)
    }

    // Événement déjà capté par le script inline (index.html) ?
    if (win.__bipEvent) show(win.__bipEvent)

    const onBIP = (e: Event) => {
      e.preventDefault()
      show(e as BeforeInstallPromptEvent)
    }
    const onReady = () => {
      if (win.__bipEvent) show(win.__bipEvent)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('bip-ready', onReady)

    // iOS/Safari ne déclenche pas l'événement : on montre des instructions.
    if (isIOS()) {
      setIosHint(true)
      setVisible(true)
    }

    const onInstalled = () => dismiss()
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('bip-ready', onReady)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (!visible) return null

  return (
    <div className="install-banner" role="dialog" aria-label="Installer l'application">
      <span className="install-banner__icon">𓂀</span>
      <div className="install-banner__text">
        <strong>Installer l'application</strong>
        <span className="muted">
          {iosHint
            ? 'Appuie sur Partager, puis « Sur l’écran d’accueil ».'
            : 'Ajoute le temple à ton écran d’accueil et joue hors-ligne.'}
        </span>
      </div>
      {!iosHint && deferred && (
        <button className="install-banner__cta" onClick={install}>
          Installer
        </button>
      )}
      <button
        className="icon-btn secondary install-banner__close"
        onClick={dismiss}
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  )
}
