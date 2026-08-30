const CACHE="chama-v2";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./search.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  if(e.request.mode==="navigate"){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request);
        const type=r.headers.get("content-type")||"";
        if(type.includes("text/html")){
          let html=await r.text();
          if(!html.includes('src="./search.js"')&&!html.includes("src='./search.js'")) html=html.replace("</body>",'<script src="./search.js"></script></body>');
          return new Response(html,{status:r.status,statusText:r.statusText,headers:{"Content-Type":"text/html; charset=utf-8"}});
        }
        return r;
      }catch{
        const cached=await caches.match("./index.html");
        if(!cached) return Response.error();
        let html=await cached.text();
        if(!html.includes('src="./search.js"')&&!html.includes("src='./search.js'")) html=html.replace("</body>",'<script src="./search.js"></script></body>');
        return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8"}});
      }
    })());
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
