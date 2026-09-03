const VERSION="chama-clean-v90";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(windows.map(async client => {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) return;
        if (url.searchParams.get("chama_update") === "90") return;
        url.searchParams.set("chama_update", "90");
        await client.navigate(url.toString());
      } catch (_) {}
    }));
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});

self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data?.json?.() || {};
  } catch (_) {
    try { payload = JSON.parse(event.data?.text?.() || "{}") || {}; } catch (_) {}
  }

  const data = payload.data || payload;
  if (data.type === "chama_message") {
    const title = data.senderName || payload.notification?.title || "Nova mensagem no Chama";
    const body = data.text || payload.notification?.body || "Você recebeu uma nova mensagem";
    event.waitUntil(self.registration.showNotification(title, {
      body,
      icon: "./icon.svg",
      badge: "./icon.svg",
      tag: "chama-msg-" + (data.chatId || "nova"),
      renotify: true,
      requireInteraction: false,
      silent: false,
      vibrate: [250, 120, 250],
      data: { type: "chama_message", chatId: data.chatId || "" }
    }));
    return;
  }

  if (data.type === "chama_channel") {
    const title = "📢 " + (data.channelName || "Canal Chama");
    const body = data.text || "Nova publicação";
    event.waitUntil(self.registration.showNotification(title, {
      body,
      icon: "./icon.svg",
      badge: "./icon.svg",
      tag: "chama-channel-" + (data.channelId || "novo"),
      renotify: true,
      requireInteraction: false,
      silent: false,
      vibrate: [180,100,180],
      data: { type: "chama_channel", channelId: data.channelId || "" }
    }));
  }
});

self.addEventListener("notificationclick", event => {
  const data = event.notification?.data || {};
  event.notification.close();
  let url = "./";
  if (data.type === "chama_message" && data.chatId) url = "./?chat=" + encodeURIComponent(data.chatId);
  if (data.type === "chama_channel" && data.channelId) url = "./?channel=" + encodeURIComponent(data.channelId);

  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const client of list) {
      if ("navigate" in client) client.navigate(url).catch(() => {});
      if ("focus" in client) return client.focus();
    }
    return self.clients.openWindow(url);
  }));
});
