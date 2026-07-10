// Service worker : cache d'exécution pour un fonctionnement hors-ligne.
const CACHE = 'ygo-cache-v3'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Navigations : réseau d'abord, repli sur le cache (app shell).
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          const cache = await caches.open(CACHE)
          cache.put(req, fresh.clone())
          return fresh
        } catch {
          const cached = await caches.match(req)
          return (
            cached ||
            caches.match(new URL('./index.html', self.registration.scope).href)
          )
        }
      })(),
    )
    return
  }

  // Autres GET : stale-while-revalidate — on sert le cache tout de suite mais
  // on rafraîchit en arrière-plan, pour que les mises à jour (images de
  // boosters, etc.) se propagent sans rester bloquées sur une version périmée.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((fresh) => {
          const cacheable =
            url.origin === self.location.origin || req.destination === 'image'
          if (fresh && fresh.ok && cacheable) cache.put(req, fresh.clone())
          return fresh
        })
        .catch(() => null)
      return cached || (await network) || Response.error()
    })(),
  )
})
