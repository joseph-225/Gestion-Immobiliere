const CACHE_NAME = "immobilier-ci-cache-v1"
const OFFLINE_URL = "/offline.html"

// URLs à pré-cacher lors de l'installation du Service Worker
const urlsToCache = [
  "/",
  "/dashboard",
  "/terrains",
  "/analytics",
  OFFLINE_URL,
  // Ajoutez ici d'autres assets statiques importants si nécessaire
  // Par exemple, les fichiers CSS, JS, images qui ne sont pas gérés par Next.js directement
  // Note: Next.js gère ses propres bundles JS/CSS, donc nous nous concentrons sur les pages HTML et les API.
]

// Installation du Service Worker et mise en cache des ressources statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Mise en cache des ressources statiques")
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Service Worker: Échec de la mise en cache de certaines URLs", error)
      })
    }),
  )
})

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Suppression de l'ancien cache", cacheName)
            return caches.delete(cacheName)
          }
          return null
        }),
      )
    }),
  )
  // Assurez-vous que le Service Worker prend le contrôle des clients immédiatement
  self.clients.claim()
})

// Interception des requêtes réseau
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url)

  // Stratégie pour les requêtes de navigation (pages HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Essayer de récupérer la ressource depuis le réseau en premier
          const preloadResponse = await event.preloadResponse
          if (preloadResponse) {
            return preloadResponse
          }

          const networkResponse = await fetch(event.request)
          // Mettre à jour le cache avec la nouvelle réponse du réseau
          const cache = await caches.open(CACHE_NAME)
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        } catch (error) {
          // Si le réseau échoue, essayer de récupérer depuis le cache
          const cachedResponse = await caches.match(event.request)
          if (cachedResponse) {
            return cachedResponse
          }
          // Si ni le réseau ni le cache ne fonctionnent, servir la page hors ligne
          console.log("Service Worker: Réseau et cache échoués, servant la page hors ligne.")
          return caches.match(OFFLINE_URL)
        }
      })(),
    )
  }
  // Stratégie pour les requêtes API (par exemple, /api/terrains, /api/analytics)
  else if (requestUrl.pathname.startsWith("/api/terrains") || requestUrl.pathname.startsWith("/api/analytics")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Mettre à jour le cache avec la nouvelle réponse du réseau
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
          // Retourner la réponse du cache si disponible, sinon attendre la réponse du réseau
          return cachedResponse || fetchPromise
        })
      }),
    )
  }
  // Stratégie par défaut pour les autres ressources (images, scripts, etc.)
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((networkResponse) => {
            // Mettre en cache les nouvelles ressources au fur et à mesure qu'elles sont demandées
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone())
              return networkResponse
            })
          })
        )
      }),
    )
  }
})

// Gestion des messages du client (optionnel, pour la communication bidirectionnelle)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
