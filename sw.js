const VERSION="chama-safe-v174";

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
    const clients = await self.clients.matchAll({type:"window",includeUncontrolled:true});
    await Promise.all(clients.map(client => {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) return;
        url.searchParams.set("chama_clean","174");
        return client.navigate(url.toString());
      } catch (_) {}
    }));
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.mode !== "navigate") return;
  event.respondWith((async () => {
    const response = await fetch(request);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) return response;
    try {
      const html = await response.text();
      let injected = html;
      if (!injected.includes("chama-profile-status-safe.js")) {
        injected = injected.replace(/<\/body>/i,'<script src="/chama-profile-status-safe.js?v=174" defer></script></body>');
      }
      if (!injected.includes("chama-groups-safe.js")) {
        injected = injected.replace(/<\/body>/i,'<script src="/chama-groups-safe.js?v=174" defer></script></body>');
      }
      const headers = new Headers(response.headers);
      headers.delete("content-length");
      return new Response(injected,{status:response.status,statusText:response.statusText,headers});
    } catch (_) {
      return response;
    }
  })());
});

self.addEventListener("push", event => {
  let data={};
  try{data=event.data?event.data.json():{}}catch(_){ }
  event.waitUntil(self.registration.showNotification(data.title||"Chama",{
    body:data.body||"Você recebeu uma nova mensagem.",
    icon:data.icon||"/icon-192.png",
    badge:data.badge||"/icon-192.png",
    data:data.data||{}
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(clients=>{
    const target=event.notification?.data?.url||"/";
    for(const client of clients){
      if("focus" in client){client.navigate(target).catch(()=>{});return client.focus();}
    }
    if(self.clients.openWindow)return self.clients.openWindow(target);
  }));
});