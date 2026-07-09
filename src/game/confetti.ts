/**
 * Explosion de confettis autonome (canvas plein écran, sans dépendance).
 * Se nettoie toute seule à la fin de l'animation.
 */

const COLORS = ['#f5c542', '#7b5cff', '#35d0c0', '#ff5470', '#5b8dff', '#ffe9a8']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  color: string
}

export function burstConfetti(count = 140): void {
  if (typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:200'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  document.body.appendChild(canvas)
  const g = canvas.getContext('2d')
  if (!g) {
    canvas.remove()
    return
  }
  g.scale(dpr, dpr)

  const w = window.innerWidth
  const h = window.innerHeight
  const originX = w / 2
  const originY = h * 0.4

  const parts: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 9
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    }
  })

  const start = performance.now()
  const DURATION = 1800

  function frame(now: number) {
    const elapsed = now - start
    g!.clearRect(0, 0, w, h)
    for (const p of parts) {
      p.vy += 0.22 // gravité
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      g!.save()
      g!.translate(p.x, p.y)
      g!.rotate(p.rot)
      g!.globalAlpha = Math.max(0, 1 - elapsed / DURATION)
      g!.fillStyle = p.color
      g!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      g!.restore()
    }
    if (elapsed < DURATION) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
