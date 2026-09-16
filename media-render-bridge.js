(()=>{
'use strict';
if(window.__CHAMA_MEDIA_RENDER_BRIDGE_V4__)return;
window.__CHAMA_MEDIA_RENDER_BRIDGE_V4__=true;
const PREFIX='__CHAMA_MEDIA__';
const queue=[];
const nativeStartsWith=String.prototype.startsWith;
String.prototype.startsWith=function(search,...args){
 const value=String(this);
 if(search===PREFIX&&nativeStartsWith.call(value,PREFIX)){
  try{const x=JSON.parse(value.slice(PREFIX.length));const kind=x.kind||x.type;if(x?.url&&['image','video','audio'].includes(kind))queue.push({raw:value,kind,url:x.url,key:x.key||''})}catch{}
 }
 return nativeStartsWith.call(value,search,...args)
};
const $=id=>document.getElementById(id);
const norm=v=>String(v||'').replace(/\s+/g,' ').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function fail(){const d=document.createElement('div');d.textContent='Não foi possível carregar esta mídia.';d.style.cssText='padding:10px;font-size:13px';return d}
function render(b,m){if(!b||!m?.url||b.dataset.mediaBridge==='1')return;b.dataset.mediaBridge='1';b.dataset.chamaRaw=m.raw||PREFIX+JSON.stringify(m);const time=b.querySelector('.time');b.innerHTML='';if(m.kind==='image'){const x=document.createElement('img');x.src=m.url;x.alt='Imagem';x.loading='lazy';x.style.cssText='display:block;width:min(280px,72vw);max-height:380px;object-fit:cover;border-radius:12px';x.onerror=()=>x.replaceWith(fail());b.appendChild(x)}else if(m.kind==='video'){const x=document.createElement('video');x.src=m.url;x.controls=true;x.playsInline=true;x.preload='metadata';x.style.cssText='display:block;width:min(310px,74vw);max-height:400px;border-radius:12px;background:#000';x.onerror=()=>x.replaceWith(fail());b.appendChild(x)}else{const x=document.createElement('audio');x.src=m.url;x.controls=true;x.preload='metadata';x.style.cssText='width:min(290px,76vw);height:44px';x.onerror=()=>x.replaceWith(fail());b.appendChild(x)}if(time)b.appendChild(time)}
function repairQueue(){const box=$('messages');if(!box)return;const targets=[...box.querySelectorAll('.bubble')].filter(b=>!b.dataset.mediaBridge&&['midia','mídia','📎 midia','📎 mídia'].includes(norm(b.textContent).replace(/\s*\d{1,2}:\d{2}$/,'')));while(queue.length&&targets.length)render(targets.shift(),queue.shift())}
async function repairFromFirestore(){const box=$('messages');if(!box)return;const targets=[...box.querySelectorAll('.bubble')].filter(b=>!b.dataset.mediaBridge&&['midia','mídia','📎 midia','📎 mídia'].includes(norm(b.textContent).replace(/\s*\d{1,2}:\d{2}$/,'')));if(!targets.length)return;try{const A=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),AU=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),F=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');const app=A.getApps()[0],user=AU.getAuth(app).currentUser;if(!app||!user)return;const email=($('chatEmail')?.textContent||'').trim().toLowerCase();if(!email)return;const db=F.getFirestore(app);const us=await F.getDocs(F.query(F.collection(db,'users'),F.where('email','==',email),F.limit(1)));if(us.empty)return;const other=us.docs[0].id,cid=[user.uid,other].sort().join('_');const snap=await F.getDocs(F.query(F.collection(db,'chats',cid,'messages'),F.limit(200)));const media=[];snap.forEach(d=>{const x=d.data()||{},t=String(x.text||'');if(t.startsWith(PREFIX)){try{const z=JSON.parse(t.slice(PREFIX.length)),kind=z.kind||z.type;if(z.url&&['image','video','audio'].includes(kind))media.push({raw:t,kind,url:z.url,key:z.key||''})}catch{}}});media.sort((a,b)=>0);targets.forEach((b,i)=>{if(media[i])render(b,media[i])})}catch(e){console.debug('media render firestore',e)}}
function repair(){repairQueue();repairFromFirestore()}
function watch(){const box=$('messages');if(box)new MutationObserver(()=>setTimeout(repair,0)).observe(box,{childList:true,subtree:true,characterData:true});setInterval(repair,500);repair()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();