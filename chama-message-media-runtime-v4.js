(()=>{
'use strict';
if(window.__CHAMA_MEDIA_SCROLL_FIX_V4__)return;
window.__CHAMA_MEDIA_SCROLL_FIX_V4__=true;
function fix(){const b=document.getElementById('messages'),c=document.getElementById('composer');if(!b)return;b.style.paddingBottom=Math.max(24,(c?.getBoundingClientRect?.().height||0)+18)+'px';b.scrollTop=b.scrollHeight}
function bind(){const f=document.getElementById('composer');if(f&&!f.dataset.chamaScrollFixV4){f.dataset.chamaScrollFixV4='1';f.addEventListener('submit',()=>{setTimeout(fix,60);setTimeout(fix,200);setTimeout(fix,450)},true)}fix()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();setInterval(fix,1200);
})();