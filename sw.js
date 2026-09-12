const VERSION="chama-safe-v179";

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
  })());
});

// Keep the original Chama application intact. The groups/profile module
// remains untouched; availability/presentation is loaded as a separate isolated module.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith((async () => {
    const response = await fetch(event.request);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) return response;
    try {
      const text = await response.text();
      if (text.includes("chama-features-safe.js")) {
        if (text.includes("chama-availability-safe.js")) return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
        const injectedExisting = text.replace(/<\/body>/i,'<script src="./chama-availability-safe.js?v=179" defer></script></body>');
        const headersExisting = new Headers(response.headers);
        headersExisting.delete("content-length");
        return new Response(injectedExisting,{status:response.status,statusText:response.statusText,headers:headersExisting});
      }
      const injected = text.replace(/<\/body>/i,'<script src="./chama-features-safe.js?v=177" defer></script><script src="./chama-availability-safe.js?v=179" defer></script></body>');
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