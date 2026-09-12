const VERSION="chama-safe-v176";

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

// Important: do not rewrite/inject the application's HTML here.
// The Chama app must receive its original document unchanged so that
// Firebase and the app's native event handlers remain reliable.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
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