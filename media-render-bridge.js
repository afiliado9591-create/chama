(()=>{
'use strict';
if(window.__CHAMA_MEDIA_RENDER_BRIDGE_V2__)return;
window.__CHAMA_MEDIA_RENDER_BRIDGE_V2__=true;
const PREFIX='__CHAMA_MEDIA__';
const queue=[];
const originalStartsWith=String.prototype.startsWith;
String.prototype.startsWith=function(search,...args){
  const value=String(this);
  if(search===PREFIX && originalStartsWith.call(value,PREFIX)){
    try{
      const m=JSON.parse(value.slice(PREFIX.length));
      if(m?.url&&['image','video','audio'].includes(m.kind))queue.push({raw:value,kind:m.kind,url:m.url,key:m.key||''});
    }catch{}
  }
  return originalStartsWith.call(this,search,...args);
};
const $=id=>document.getElementById(id);
function normalize(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase().replace(/[íìîï]/g,'i')}
function mediaBubble(b,m){
  if(!b||!m?.url||b.dataset.mediaBridge==='1')return;
  b.dataset.mediaBridge='1';b.dataset.chamaRaw=m.raw;
  const time=b.querySelector('.time');b.innerHTML='';
  if(m.kind==='image'){
    const img=document.createElement('img');img.src=m.url;img.alt='Imagem';img.loading='lazy';img.style.cssText='display:block;width:min(280px,72vw);max-height:380px;object-fit:cover;border-radius:12px';img.onerror=()=>img.replaceWith(fail());b.appendChild(img);
  }else if(m.kind==='video'){
    const v=document.createElement('video');v.src=m.url;v.controls=true;v.playsInline=true;v.preload='metadata';v.style.cssText='display:block;width:min(310px,74vw);max-height:400px;border-radius:12px;background:#000';v.onerror=()=>v.replaceWith(fail());b.appendChild(v);
  }else{
    const a=document.createElement('audio');a.src=m.url;a.controls=true;a.preload='none';a.style.cssText='width:min(290px,76vw);height:44px';a.onerror=()=>a.replaceWith(fail());b.appendChild(a);
  }
  if(time)b.appendChild(time);
}
function fail(){const d=document.createElement('div');d.textContent='Não foi possível carregar esta mídia.';d.style.cssText='padding:10px;color:#b42318;font-size:13px';return d}
function repair(){
  const box=$('messages');if(!box)return;
  const targets=[...box.querySelectorAll('.bubble')].filter(b=>!b.dataset.mediaBridge&&['mídia','midia','📎 mídia','📎 midia'].includes(normalize(b.textContent).replace(/\s*\d{1,2}:\d{2}$/,'')));
  while(queue.length&&targets.length){const b=targets.shift(),m=queue.shift();mediaBubble(b,m)}
}
function watch(){const box=$('messages');if(box)new MutationObserver(()=>setTimeout(repair,0)).observe(box,{childList:true,subtree:true,characterData:true});setInterval(repair,150);repair()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();