(()=>{
'use strict';
if(window.__CHAMA_STABILITY_FIX__)return;
window.__CHAMA_STABILITY_FIX__=true;
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
  // IMPORTANTE: não interceptar o submit do composer.
  // O formulário original do index.html precisa executar preventDefault()
  // e gravar a mensagem no Firestore.
}
function keyboard(){
  if(innerWidth>700||!window.visualViewport)return;
  const vv=visualViewport,chat=$('chatPanel'),active=$('activeChat'),composer=$('composer'),messages=$('messages');
  if(!chat||!active||!composer)return;
  const base=window.__chamaViewportBase||Math.max(window.innerHeight,document.documentElement.clientHeight);
  const kb=Math.max(0,Math.round(base-vv.height-vv.offsetTop));
  chat.style.setProperty('position','fixed','important');
  chat.style.setProperty('top','66px','important');
  chat.style.setProperty('left','0','important');
  chat.style.setProperty('right','0','important');
  chat.style.setProperty('bottom',kb+'px','important');
  chat.style.setProperty('height','auto','important');
  active.style.setProperty('height','100%','important');
  active.style.setProperty('min-height','0','important');
  active.style.setProperty('overflow','hidden','important');
  composer.style.setProperty('position','fixed','important');
  composer.style.setProperty('left','0','important');
  composer.style.setProperty('right','0','important');
  composer.style.setProperty('bottom',kb+'px','important');
  composer.style.setProperty('width','100%','important');
  composer.style.setProperty('z-index','200','important');
  messages?.style.setProperty('overflow-y','auto','important');
  messages?.style.setProperty('padding-bottom','90px','important');
}
function start(){
  window.__chamaViewportBase=Math.max(window.innerHeight,document.documentElement.clientHeight);
  bind();
  keyboard();
  visualViewport?.addEventListener('resize',()=>setTimeout(keyboard,30),{passive:true});
  visualViewport?.addEventListener('scroll',()=>setTimeout(keyboard,30),{passive:true});
  window.addEventListener('resize',()=>setTimeout(keyboard,30),{passive:true});
  document.addEventListener('focusin',e=>{if(e.target?.id==='messageInput')setTimeout(keyboard,100)});
  setInterval(()=>{bind();keyboard()},3000);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
