// Service worker מינימלי: מאפשר "הוספה למסך הבית", ושומר עותק של הדף למקרה שאין קליטה.
// הדף נטען קודם מהרשת (no-cache מול ה-ETag של GitHub Pages), כדי שעדכון יגיע מיד.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

const SHELL = 'studio-shell-v1'
const SHELL_URL = new URL('./index.html', self.registration.scope).href

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(serveShell(event.request))
})

async function serveShell(request) {
  let fresh
  try {
    fresh = await fetch(new Request(request.url, { mode: 'same-origin', cache: 'no-cache', credentials: 'same-origin' }))
  } catch {
    const cached = await caches.match(SHELL_URL, { cacheName: SHELL })
    return cached || Response.error()
  }
  if (fresh.ok) {
    try {
      const cache = await caches.open(SHELL)
      await cache.put(SHELL_URL, fresh.clone())
    } catch (err) {
      console.warn('[sw] could not store the app shell:', err)
    }
  }
  return fresh
}
