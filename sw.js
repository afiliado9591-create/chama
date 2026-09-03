const VERSION="chama-clean-v101";

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
        if (url.searchParams.get("chama_update") === "101") return;
        url.searchParams.set("chama_update", "101");
        await client.navigate(url.toString());
      } catch (_) {}
    }));
  })());
});

function injectSafeUi(html) {
  const mediaMarker = 'media-render-safe.js?v=91';
  const menuMarker = 'app-menu.js?v=3';
  const unreadMarker = 'unread-badges.js?v=1';
  const profileMarker = 'profile-city-safe.js?v=5';
  const homeMarker = 'home-conversations-search.js?v=2';
  const backMarker = 'ui-back-button.js?v=1';
  const ownAvatarMarker = 'home-own-avatar.js?v=1';
  let out = html;

  // Expõe somente a ação de abrir conversa para a busca pública.
  // Não cria consultas, listeners ou acesso extra ao Firestore.
  if (!out.includes('window.chamaOpenChat=openChat;')) {
    out = out.replace('  async function saveMessage(text,label=text){', '  window.chamaOpenChat=openChat;\n\n  async function saveMessage(text,label=text){');
  }

  if (!out.includes(mediaMarker)) {
    out = out.replace('</body>', `<script src="./media-render-safe.js?v=91"></script></body>`);
  }
  if (!out.includes(menuMarker)) {
    out = out.replace('</body>', `<script src="./app-menu.js?v=3"></script></body>`);
  }
  if (!out.includes(unreadMarker)) {
    out = out.replace('</body>', `<script src="./unread-badges.js?v=1"></script></body>`);
  }
  if (!out.includes(profileMarker)) {
    out = out.replace('</body>', `<script src="./profile-city-safe.js?v=5"></script></body>`);
  }
  if (!out.includes(homeMarker)) {
    out = out.replace('</body>', `<script src="./home-conversations-search.js?v=2"></script></body>`);
  }
  if (!out.includes(backMarker)) {
    out = out.replace('</body>', `<script src="./ui-back-button.js?v=1"></script></body>`);
  }
  if (!out.includes(ownAvatarMarker)) {
    out = out.replace('</body>', `<script src="./home-own-avatar.js?v=1"></script></body>`);
  }
  return out;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const response = await fetch(event.request, { cache: "no-store" });
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;
      const html = injectSafeUi(await response.text());
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    })());
    return;
  }

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