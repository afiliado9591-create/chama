(()=>{
'use strict';
if(window.__CHAMA_STABILITY_FIX_V3__)return;
window.__CHAMA_STABILITY_FIX_V3__=true;
const $=id=>document.getElementById(id);
function removeBlockers(){
  document.querySelectorAll('#chamaCoreProfile,#chamaGlobalProfile,#chamaMainMenuBackdrop').forEach(el=>el.remove());
  document.querySelectorAll('[style*="pointer-events: none"]').forEach(el=>el.style.pointerEvents='');
}
function getUid(row){return row?.dataset?.uid||row?.getAttribute('data-uid')||''}
function activate(row){
  const uid=getUid(row),email=(row?.querySelector('.user-email')?.textContent||'').trim(),name=(row?.querySelector('.user-name')?.textContent||'Usuário').replace(/\s*\(Você\).*$/,'').trim();
  if(!uid)return false;
  const u={id:uid,uid,email,nome:name};
  window.__chamaActiveUid=uid;
  const active=$('activeChat');
  active?.setAttribute('data-uid',uid);
  active?.setAttribute('data-email',email);
  if(typeof window.chamaOpenChat==='function')window.chamaOpenChat(u);
  return true;
}
function bind(){
  removeBlockers();
  document.querySelectorAll('#usersList .user').forEach(row=>{
    if(row.dataset.stabilityBound)return;
    row.dataset.stabilityBound='1';
    row.addEventListener('click',()=>activate(row),false);
  });
  const back=$('backBtn');
  if(back&&!back.dataset.stabilityBound){
    back.dataset.stabilityBound='1';
    back.addEventListener('click',()=>{$('chatPanel')?.classList.add('hidden-mobile')},false);
  }
}
function start(){bind();setInterval(bind,3000)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
