const CACHE="chama-v11";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./search.js","./auth-persistence.js","./share.js","./public-profile.js","./brand-brazil.js","./contact-open-chat.js","./forgot-password.js","./clickable-links.js","./friends.js","./media-chat.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
function injectExtras(html){
  if(!html.includes('src="./search.js"')&&!html.includes("src='./search.js'")) html=html.replace("</body>",'<script src="./search.js"></script></body>');
  if(!html.includes('src="./auth-persistence.js"')&&!html.includes("src='./auth-persistence.js'")) html=html.replace("</body>",'<script type="module" src="./auth-persistence.js"></script></body>');
  if(!html.includes('src="./share.js"')&&!html.includes("src='./share.js'")) html=html.replace("</body>",'<script type="module" src="./share.js"></script></body>');
  if(!html.includes('src="./public-profile.js"')&&!html.includes("src='./public-profile.js'")) html=html.replace("</body>",'<script type="module" src="./public-profile.js"></script></body>');
  if(!html.includes('src="./brand-brazil.js"')&&!html.includes("src='./brand-brazil.js'")) html=html.replace("</body>",'<script src="./brand-brazil.js"></script></body>');
  if(!html.includes('src="./contact-open-chat.js"')&&!html.includes("src='./contact-open-chat.js'")) html=html.replace("</body>",'<script src="./contact-open-chat.js"></script></body>');
  if(!html.includes('src="./forgot-password.js"')&&!html.includes("src='./forgot-password.js'")) html=html.replace("</body>",'<script type="module" src="./forgot-password.js"></script></body>');
  if(!html.includes('src="./clickable-links.js"')&&!html.includes("src='./clickable-links.js'")) html=html.replace("</body>",'<script src="./clickable-links.js"></script></body>');
  if(!html.includes('src="./friends.js"')&&!html.includes("src='./friends.js'")) html=html.replace("</body>",'<script type="module" src="./friends.js"></script></body>');
  if(!html.includes('src="./media-chat.js"')&&!html.includes("src='./media-chat.js'")) html=html.replace("</body>",'<script type="module" src="./media-chat.js"></script></body>');
  return html;
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  if(e.request.mode==="navigate"){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request);
        const type=r.headers.get("content-type")||"";
        if(type.includes("text/html")){
          const html=injectExtras(await r.text());
          return new Response(html,{status:r.status,statusText:r.statusText,headers:{"Content-Type":"text/html; charset=utf-8"}});
        }
        return r;
      }catch{
        const cached=await caches.match("./index.html");
        if(!cached) return Response.error();
        const html=injectExtras(await cached.text());
        return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8"}});
      }
    })());
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});