(()=>{
'use strict';
if(window.__CHAMA_MEDIA_RENDER_BRIDGE__)return;
window.__CHAMA_MEDIA_RENDER_BRIDGE__=true;
const PREFIX='__CHAMA_MEDIA__';
const $=id=>document.getElementById(id);
let timer=0,loading=false,lastScope='';
function raw(b){return (b?.dataset?.chamaRaw||b?.textContent||'').replace(/\s+/g,' ').trim()}
function makeMedia(m,b){
  if(!m?.url||!['image','video','audio'].includes(m.kind))return;
  b.dataset.mediaBridge='1';b.dataset.chamaRaw=PREFIX+JSON.stringify(m);b.innerHTML='';
  const time=document.createElement('span');time.className='time';
  const oldTime=b.dataset.chamaTime||'';if(oldTime)time.textContent=oldTime;
  if(m.kind==='image'){
    const img=document.createElement('img');img.src=m.url;img.alt='Imagem';img.loading='lazy';img.style.cssText='display:block;width:min(280px,72vw);max-height:380px;object-fit:cover;border-radius:12px';img.onerror=()=>{img.replaceWith(error())};b.append(img);
  }else if(m.kind==='video'){
    const v=document.createElement('video');v.src=m.url;v.controls=true;v.playsInline=true;v.preload='metadata';v.style.cssText='display:block;width:min(310px,74vw);max-height:400px;border-radius:12px;background:#000';v.onerror=()=>{v.replaceWith(error())};b.append(v);
  }else{
    const a=document.createElement('audio');a.src=m.url;a.controls=true;a.preload='none';a.style.cssText='width:min(290px,76vw);height:44px';a.onerror=()=>{a.replaceWith(error())};b.append(a);
  }
  if(time.textContent)b.append(time);
}
function error(){const d=document.createElement('div');d.textContent='Não foi possível carregar esta mídia.';d.style.cssText='padding:10px;color:#b42318;font-size:13px';return d}
async function repair(){
  if(loading)return;const active=$('activeChat'),me=window.firebase?.auth?.currentUser;
  if(!active||active.classList.contains('hidden')||!me)return;
  const other=String(window.__chamaActiveUid||active.dataset.uid||'').trim();if(!other)return;
  const scope=me.uid+'_'+other;if(scope===lastScope&&![...document.querySelectorAll('#messages .bubble')].some(b=>raw(b)==='Mídia'))return;
  loading=true;
  try{
    const [{getApps},{getAuth},{getFirestore,collection,getDocs,query,orderBy,limit}]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
    ]);
    const app=getApps()[0];if(!app)return;const auth=getAuth(app);const user=auth.currentUser;if(!user)return;
    const db=getFirestore(app),cid=[user.uid,other].sort().join('_');
    const snap=await getDocs(query(collection(db,'chats',cid,'messages'),orderBy('createdAt','asc'),limit(200)));
    const media=[];snap.forEach(d=>{const m=d.data()||{};let t=String(m.text||'');if(t.startsWith(PREFIX)){try{const x=JSON.parse(t.slice(PREFIX.length));if(x?.url&&x?.kind)media.push({id:d.id,...x})}catch{}}});
    const bubbles=[...document.querySelectorAll('#messages .bubble')];
    const targets=bubbles.filter(b=>raw(b)==='Mídia'&&!b.dataset.mediaBridge);
    targets.forEach((b,i)=>{if(media[i])makeMedia(media[i],b)});
    lastScope=scope;
  }catch(e){console.debug('Chama media render bridge',e)}finally{loading=false}
}
function schedule(){clearTimeout(timer);timer=setTimeout(repair,120)}
new MutationObserver(schedule).observe(document.getElementById('messages')||document.documentElement,{childList:true,subtree:true});
new MutationObserver(schedule).observe(document.getElementById('activeChat')||document.documentElement,{attributes:true,childList:true,subtree:true});
setInterval(schedule,1800);setTimeout(schedule,500);setTimeout(schedule,1800);
})();
