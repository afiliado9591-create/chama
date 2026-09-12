const VERSION="chama-safe-v192";

self.addEventListener("install", event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", event => { event.waitUntil((async () => { try { const keys = await caches.keys(); await Promise.all(keys.map(key => caches.delete(key))); } catch (_) {} await self.clients.claim(); })()); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) { event.respondWith(fetch(event.request)); return; }
  event.respondWith((async () => {
    const response = await fetch(event.request);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) return response;
    try {
      let text = await response.text();
      text = text.replace('getDocs(query(collection(db,"users"),limit(20)))','getDocs(query(collection(db,"publicProfiles"),limit(20)))');
      const hasFeatures=text.includes("chama-features-safe.js");
      const hasAvailability=text.includes("chama-availability-safe.js");
      const hasNotifications=text.includes("chama-notifications-safe.js");
      const hasSafety=text.includes("chama-safety-safe.js");
      const hasProfileStatus=text.includes("chama-profile-status-safe.js");
      const hasStatus=text.includes("status.js");
      const hasOfferPosition=text.includes("offer-day-position.js");
      const hasTopbarMenu=text.includes("topbar-menu-v2.js");
      let scripts='';
      if(!hasFeatures)scripts+='<script src="./chama-features-safe.js?v=177" defer></script>';
      if(!hasAvailability)scripts+='<script src="./chama-availability-safe.js?v=185" defer></script>';
      if(!hasNotifications)scripts+='<script src="./chama-notifications-safe.js?v=181" defer></script>';
      if(!hasSafety)scripts+='<script src="./chama-safety-safe.js?v=182" defer></script>';
      if(!hasProfileStatus)scripts+='<script src="./chama-profile-status-safe.js?v=184" defer></script>';
      if(!hasStatus)scripts+='<script src="./status.js?v=3" defer></script>';
      if(!hasOfferPosition)scripts+='<script src="./offer-day-position.js?v=1" defer></script>';
      if(url.pathname==='/'&&!hasTopbarMenu)scripts+='<script src="./topbar-menu-v2.js?v=2" defer></script>';
      if(url.pathname==='/admin.html'){
        text=text.replace('⭐ Dia do Afiliado — catálogo','🔥 Liberar Oferta do Dia pelo Status');
        text=text.replace('Aqui você escolhe quem será o Afiliado do Dia e cadastra os produtos que ele poderá escolher para divulgar.','Escolha o usuário e a data. Nesse dia ele poderá marcar um produto do próprio Status como Oferta do Dia.');
        text=text.replace('👤 Afiliado do Dia','👤 Liberar usuário para a Oferta do Dia');
        text=text.replace('>Afiliado\n','>Usuário\n');
        text=text.replace('Ativar destaque do Afiliado do Dia','Liberar este usuário para escolher a Oferta do Dia');
        text=text.replace('Salvar Afiliado do Dia','Salvar liberação');
      }
      if(scripts){const injected=text.replace(/<\/body>/i,scripts+'</body>');const headers=new Headers(response.headers);headers.delete("content-length");return new Response(injected,{status:response.status,statusText:response.statusText,headers});}
      return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
    }catch(_){return response;}
  })());
});
self.addEventListener("push", event => { let data={}; try{data=event.data?event.data.json():{}}catch(_){} event.waitUntil(self.registration.showNotification(data.title||"Chama",{body:data.body||"Você recebeu uma nova mensagem.",icon:data.icon||"/icon-192.png",badge:data.badge||"/icon-192.png",data:data.data||{}})); });
self.addEventListener("notificationclick", event => { event.notification.close(); event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(clients=>{const target=event.notification?.data?.url||"/";for(const client of clients){if("focus" in client){client.navigate(target).catch(()=>{});return client.focus();}}if(self.clients.openWindow)return self.clients.openWindow(target)})); });
