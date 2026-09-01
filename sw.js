const CACHE="chama-v50";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./search.js","./auth-persistence.js","./share.js","./public-profile.js","./brand-brazil.js","./contact-open-chat.js","./forgot-password.js","./clickable-links.js","./friends.js","./media-chat.js","./media-render-safe.js","./chat-safe-ui.js","./notifications.js","./delete-messages.js","./admin-panel.js","./profile-type.js","./referral.js","./professional-profile.js","./offers.js","./business-directory.js","./mobile-topbar-fix.js","./push-messages.js","./channels.js","./video-embeds.js","./catalog-platforms.js","./home-highlights.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
function injectExtras(html){
 const inject=(tag,needle)=>{if(!html.includes(needle))html=html.replace("</body>",tag+"</body>")};
 inject('<script src="./search.js?v=50"></script>','search.js?v=50');
 inject('<script type="module" src="./auth-persistence.js?v=50"></script>','auth-persistence.js?v=50');
 inject('<script type="module" src="./share.js?v=50"></script>','share.js?v=50');
 inject('<script type="module" src="./public-profile.js?v=50"></script>','public-profile.js?v=50');
 inject('<script src="./brand-brazil.js?v=50"></script>','brand-brazil.js?v=50');
 inject('<script src="./contact-open-chat.js?v=50"></script>','contact-open-chat.js?v=50');
 inject('<script type="module" src="./forgot-password.js?v=50"></script>','forgot-password.js?v=50');
 inject('<script src="./clickable-links.js?v=50"></script>','clickable-links.js?v=50');
 inject('<script type="module" src="./friends.js?v=50"></script>','friends.js?v=50');
 inject('<script src="./media-render-safe.js?v=50"></script>','media-render-safe.js?v=50');
 inject('<script type="module" src="./media-chat.js?v=50"></script>','media-chat.js?v=50');
 inject('<script src="./chat-safe-ui.js?v=50"></script>','chat-safe-ui.js?v=50');
 inject('<script type="module" src="./notifications.js?v=50"></script>','notifications.js?v=50');
 inject('<script type="module" src="./delete-messages.js?v=50"></script>','delete-messages.js?v=50');
 inject('<script type="module" src="./admin-panel.js?v=50"></script>','admin-panel.js?v=50');
 inject('<script type="module" src="./profile-type.js?v=50"></script>','profile-type.js?v=50');
 inject('<script type="module" src="./referral.js?v=50"></script>','referral.js?v=50');
 inject('<script type="module" src="./professional-profile.js?v=50"></script>','professional-profile.js?v=50');
 inject('<script type="module" src="./offers.js?v=50"></script>','offers.js?v=50');
 inject('<script type="module" src="./business-directory.js?v=50"></script>','business-directory.js?v=50');
 inject('<script src="./mobile-topbar-fix.js?v=50"></script>','mobile-topbar-fix.js?v=50');
 inject('<script type="module" src="./push-messages.js?v=50"></script>','push-messages.js?v=50');
 inject('<script type="module" src="./channels.js?v=50"></script>','channels.js?v=50');
 inject('<script src="./video-embeds.js?v=50"></script>','video-embeds.js?v=50');
 inject('<script src="./catalog-platforms.js?v=50"></script>','catalog-platforms.js?v=50');
 inject('<script type="module" src="./home-highlights.js?v=50"></script>','home-highlights.js?v=50');
 return html;
}
self.addEventListener("push",e=>{
 let p={};try{p=e.data?.json?.()||{}}catch{try{p=JSON.parse(e.data?.text?.()||"{}")||{}}catch{}}
 const d=p.data||p;
 if(d.type==="chama_message"){
  const title=d.senderName||p.notification?.title||"Nova mensagem no Chama",body=d.text||p.notification?.body||"Você recebeu uma nova mensagem";
  e.waitUntil(self.registration.showNotification(title,{body,icon:"./icon.svg",badge:"./icon.svg",tag:"chama-msg-"+(d.chatId||"nova"),renotify:true,requireInteraction:false,silent:false,vibrate:[250,120,250],data:{type:"chama_message",chatId:d.chatId||""}}));return;
 }
 if(d.type==="chama_channel"){
  const title='📢 '+(d.channelName||'Canal Chama'),body=d.text||'Nova publicação';
  e.waitUntil(self.registration.showNotification(title,{body,icon:"./icon.svg",badge:"./icon.svg",tag:"chama-channel-"+(d.channelId||"novo"),renotify:true,requireInteraction:false,silent:false,vibrate:[180,100,180],data:{type:"chama_channel",channelId:d.channelId||""}}));
 }
});
self.addEventListener("notificationclick",e=>{const d=e.notification?.data||{};e.notification.close();let url="./";if(d.type==="chama_message"&&d.chatId)url="./?chat="+encodeURIComponent(d.chatId);if(d.type==="chama_channel"&&d.channelId)url="./?channel="+encodeURIComponent(d.channelId);e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{for(const c of list){if("navigate"in c)c.navigate(url).catch(()=>{});if("focus"in c)return c.focus()}return clients.openWindow(url)}))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(e.request.mode==="navigate"){e.respondWith((async()=>{try{const r=await fetch(e.request,{cache:"no-store"});const type=r.headers.get("content-type")||"";if(type.includes("text/html")){const html=injectExtras(await r.text());return new Response(html,{status:r.status,statusText:r.statusText,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}})}return r}catch{const cached=await caches.match("./index.html");if(!cached)return Response.error();const html=injectExtras(await cached.text());return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}})}})());return}const u=new URL(e.request.url);if(u.pathname.endsWith('.js')){e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(u.pathname.replace(/^\//,'./'))));return}e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});