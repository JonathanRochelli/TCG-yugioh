import type { Rarity } from '../types'
import { rarityRank } from './rarity'

/**
 * Effets sonores SYNTHÉTISÉS via la Web Audio API (aucun fichier audio,
 * donc rien à charger et aucun droit tiers). Sons courts et discrets.
 */

const MUTE_KEY = 'ygo.muted.v1'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    /* ignore */
  }
}

interface ToneOpts {
  freq: number
  dur?: number
  type?: OscillatorType
  gain?: number
  slideTo?: number
  delay?: number
}

function tone(c: AudioContext, o: ToneOpts): void {
  const t = c.currentTime + (o.delay ?? 0)
  const dur = o.dur ?? 0.12
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, t)
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(o.gain ?? 0.05, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise(
  c: AudioContext,
  { dur = 0.25, gain = 0.07, freq = 1400, q = 0.8 } = {},
): void {
  const t = c.currentTime
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bp).connect(g).connect(c.destination)
  src.start(t)
  src.stop(t + dur)
}

/** Retournement d'une carte : petit "clic" descendant. */
export function playFlip(): void {
  if (isMuted()) return
  const c = audio()
  if (c) tone(c, { freq: 520, slideTo: 300, dur: 0.08, type: 'triangle', gain: 0.035 })
}

/** Déchirure du booster : souffle de bruit + petit impact. */
export function playTear(): void {
  if (isMuted()) return
  const c = audio()
  if (!c) return
  noise(c, { dur: 0.4, gain: 0.06, freq: 1600, q: 0.6 })
  tone(c, { freq: 160, slideTo: 60, dur: 0.25, type: 'sine', gain: 0.06 })
}

/** Jingle sur une carte rare : arpège d'autant plus riche que la rareté est haute. */
export function playRareJingle(rarity: Rarity): void {
  if (isMuted()) return
  const c = audio()
  if (!c) return
  const rank = rarityRank(rarity)
  if (rank < rarityRank('Super Rare')) return
  const scales: Record<number, number[]> = {
    2: [523.25, 659.25, 783.99], // Super : do-mi-sol
    3: [523.25, 659.25, 783.99, 1046.5], // Ultra : + do aigu
    4: [659.25, 830.61, 987.77, 1318.51, 1567.98], // Secret : plus haut, plus long
  }
  const notes = scales[rank] ?? scales[2]
  notes.forEach((f, i) =>
    tone(c, {
      freq: f,
      dur: 0.16,
      type: 'triangle',
      gain: 0.05,
      delay: i * 0.09,
    }),
  )
}

/** Petit son de pièces (bonus, récompense). */
export function playCoins(): void {
  if (isMuted()) return
  const c = audio()
  if (!c) return
  tone(c, { freq: 880, dur: 0.08, type: 'square', gain: 0.03 })
  tone(c, { freq: 1174, dur: 0.1, type: 'square', gain: 0.03, delay: 0.07 })
}
