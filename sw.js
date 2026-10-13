/* Ayudante de servicio de Contrastación y Rendimientos.
   Guarda la página en el teléfono para que funcione sin señal.
   Sube este archivo junto a index.html, en la misma carpeta. */

const CACHE = 'contrastacion-rendimientos-v1';
const ARCHIVOS = ['./', './index.html'];

/* Al instalarse, guarda la página */
self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

/* Al activarse, borra versiones anteriores de esta misma página */
self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('contrastacion-rendimientos-') && k !== CACHE)
                                  .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primero intenta la red, para traer la versión más nueva cuando hay señal.
   Si no hay, entrega la copia guardada. */
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then((r) => r || caches.match('./index.html'))
          .then((r) => r || caches.match('./'))
      )
  );
});
