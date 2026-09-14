(()=>{
'use strict';
if(window.__CHAMA_UI_REPAIR_V1__)return;window.__CHAMA_UI_REPAIR_V1__=true;
const $=id=>document.getElementById(id);
let viewportBase=Math.max(window.innerHeight||0,document.documentElement.clientHeight||0,window.visualViewport?.height||0);
function keyboard(){
  if(innerWidth>700||!window.visualViewport)return;
  const vv=window.visualViewport;
  if(vv.height>viewportBase-120) viewportBase=Math.max(viewportBase,vv.height,window.innerHeight||0);
  const kb=Math.max(0,Math.round(viewportBase-vv.height-vv.offsetTop));
  const chat=$('chatPanel'),active=$('activeChat'),composer=$('composer'),messages=$('messages');
  if(!chat||!active||!composer)return;
  chat.style.setProperty('position','fixed','important');chat.style.setProperty('top','66px','important');chat.style.setProperty('left','0','important');chat.style.setProperty('right','0','important');chat.style.setProperty('bottom',kb+'px','important');chat.style.setProperty('height','auto','important');chat.style.setProperty('z-index','4','important');
  active.style.setProperty('height','100%','important');active.style.setProperty('min-height','0','important');active.style.setProperty('overflow','hidden','important');
  composer.style.setProperty('position','fixed','important');composer.style.setProperty('left','0','important');composer.style.setProperty('right','0','important');composer.style.setProperty('bottom',kb+'px','important');composer.style.setProperty('width','100%','important');composer.style.setProperty('z-index','1000','important');composer.style.setProperty('padding-bottom','max(10px,env(safe-area-inset-bottom))','important');
  if(messages){messages.style.setProperty('min-height','0','important');messages.style.setProperty('overflow-y','auto','important');messages.style.setProperty('padding-bottom','100px','important')}
  document.documentElement.style.setProperty('--chama-keyboard-bottom',kb+'px');
}
function bindRows(){
  document.querySelectorAll('#usersList .user').forEach(row=>{
    if(!row.dataset.uiRepair){row.dataset.uiRepair='1';if(row.dataset.uid)row.style.cursor='pointer';}
  });
}
function bindStatus(){
  const entry=$('chamaStatusEntry');
  if(entry&&!entry.dataset.uiRepair){entry.dataset.uiRepair='1';entry.style.pointerEvents='auto';entry.style.cursor='pointer';}
  document.querySelectorAll('[data-status-entry],.chama-status-entry,.status-entry').forEach(el=>{el.style.pointerEvents='auto';el.style.cursor='pointer'});
}
function start(){
  bindRows();bindStatus();keyboard();
  window.visualViewport?.addEventListener('resize',()=>setTimeout(keyboard,40),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>setTimeout(keyboard,40),{passive:true});
  window.addEventListener('resize',()=>{viewportBase=Math.max(viewportBase,window.innerHeight||0);setTimeout(keyboard,40)},{passive:true});
  document.addEventListener('focusin',e=>{if(e.target?.id==='messageInput')setTimeout(keyboard,180)});
  setInterval(()=>{bindRows();bindStatus();keyboard()},1000);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();