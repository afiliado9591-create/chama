const CACHE="chama-v16";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./search.js","./auth-persistence.js","./share.js","./public-profile.js","./brand-brazil.js","./contact-open-chat.js","./forgot-password.js","./clickable-links.js","./friends.js","./media-chat.js","./media-render-safe.js","./chat-safe-ui.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
function injectExtras(html){
  const inject=(tag,needle)=>{if(!html.includes(needle))html=html.replace("</body>",tag+"</body>")};
  inject('<script src="./search.js?v=16"></script>','search.js?v=16');
  inject('<script type="module" src="./auth-persistence.js?v=16"></script>','auth-persistence.js?v=16');
  inject('<script type="module" src="./share.js?v=16"></script>','share.js?v=16');
  inject('<script type="module" src="./public-profile.js?v=16"></script>','public-profile.js?v=16');
  inject('<script src="./brand-brazil.js?v=16"></script>','brand-brazil.js?v=16');
  inject('<script src="./contact-open-chat.js?v=16"></script>','contact-open-chat.js?v=16');
  inject('<script type="module" src="./forgot-password.js?v=16"></script>','forgot-password.js?v=16');
  inject('<script src="./clickable-links.js?v=16"></script>','clickable-links.js?v=16');
  inject('<script type="module" src="./friends.js?v=16"></script>','friends.js?v=16');
  inject('<script src="./media-render-safe.js?v=16"></script>','media-render-safe.js?v=16');
  inject('<script type="module" src="./media-chat.js?v=16"></script>','media-chat.js?v=16');
  inject('<script src="./chat-safe-ui.js?v=16"></script>','chat-safe-ui.js?v=16');
  return html;
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(e.request.mode==="navigate"){
    e.respondWith((async()=>{
      try{const r=await fetch(e.request,{cache:"no-store"});const type=r.headers.get("content-type")||"";if(type.includes("text/html")){const html=injectExtras(await r.text());return new Response(html,{status:r.status,statusText:r.statusText,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}})}return r}
      catch{const cached=await caches.match("./index.html");if(!cached)return Response.error();const html=injectExtras(await cached.text());return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}})}
    })());return;
  }
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('.js')){e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(u.pathname.replace(/^\//,'./'))));return}
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});