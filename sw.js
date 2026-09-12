const VERSION="chama-kill-v172";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    } catch (_) {}

    await self.clients.claim();

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    await Promise.all(clients.map(client => {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) return;
        url.searchParams.set("chama_clean", "172");
        return client.navigate(url.toString());
      } catch (_) {}
    }));
  })());
});

// Intentionally do not intercept fetch requests.
// The application must load directly from the network without HTML/script injection.

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = data.title || "Chama";
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "Você recebeu uma nova mensagem.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    data: data.data || {}
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:"window", includeUncontrolled:true}).then(clients => {
    const target = event.notification?.data?.url || "/";
    for (const client of clients) {
      if ("focus" in client) {
        client.navigate(target).catch(() => {});
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  }));
});
