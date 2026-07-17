const CACHE_NAME = "gastos-pareja-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/api.js",
  "./js/entry-form.js",
  "./js/charts.js",
  "./js/dashboard.js",
  "./js/mi-resumen.js",
  "./js/reminders.js",
  "./js/categories.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Nunca cachear llamadas al backend de Apps Script: los datos deben ser
  // siempre frescos (saldos, tasas del día, etc.).
  if (url.hostname.endsWith("script.google.com")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Nivel 2 de recordatorios (experimental): muestra la notificación real
// cuando llega un push del backend, si Triggers.gs llega a implementarlo.
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Gastos en Pareja", {
      body: data.body || "Recuerda registrar tus gastos de hoy",
      icon: "./icons/icon-192.png"
    })
  );
});
