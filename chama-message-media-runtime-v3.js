(()=>{
'use strict';
if(window.__CHAMA_MEDIA_SCROLL_FIX__)return;
window.__CHAMA_MEDIA_SCROLL_FIX__=true;
function fix(){
 const box=document.getElementById('messages'),composer=document.getElementById('composer');
 if(!box)return;
 const h=Math.max(24,(composer?.getBoundingClientRect?.().height||0)+18);
 box.style.paddingBottom=h+'px';
 box.scrollTop=box.scrollHeight;
}
function bind(){
 const form=document.getElementById('composer');
 if(form&&!form.dataset.chamaScrollFix){form.dataset.chamaScrollFix='1';form.addEventListener('submit',()=>{setTimeout(fix,50);setTimeout(fix,180);setTimeout(fix,400) },true)}
 fix();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
setInterval(fix,1200);
})();