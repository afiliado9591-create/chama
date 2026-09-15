(()=>{
'use strict';
if(window.__CHAMA_STABILITY_FIX_V4__)return;
window.__CHAMA_STABILITY_FIX_V4__=true;
const $=id=>document.getElementById(id);
let fs=null,db=null,firestoreReady=false;
function removeBlockers(){
  document.querySelectorAll('#chamaCoreProfile,#chamaGlobalProfile,#chamaMainMenuBackdrop').forEach(el=>el.remove());
  document.querySelectorAll('[style*="pointer-events: none"]').forEach(el=>el.style.pointerEvents='');
}
function getUid(row){return row?.dataset?.uid||row?.getAttribute('data-uid')||''}
async function initFirestore(){
  if(firestoreReady)return true;
  try{
    const A=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
    fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
    const app=A.getApps()[0];
    if(!app)return false;
    db=fs.getFirestore(app);
    firestoreReady=true;
    return true;
  }catch(e){console.error('Chama contact UID init',e);return false}
}
async function resolveRowUid(row){
  const current=getUid(row);
  if(current){window.__chamaActiveUid=current;$('activeChat')?.setAttribute('data-uid',current);return current}
  const email=(row?.querySelector('.user-email')?.textContent||'').trim().toLowerCase();
  if(!email||!(await initFirestore()))return '';
  try{
    const snap=await fs.getDocs(fs.query(fs.collection(db,'users'),fs.where('email','==',email),fs.limit(1)));
    const d=snap.docs[0];
    if(!d)return '';
    const uid=d.id;
    row.dataset.uid=uid;
    row.setAttribute('data-uid',uid);
    window.__chamaActiveUid=uid;
    $('activeChat')?.setAttribute('data-uid',uid);
    return uid;
  }catch(e){console.error('Chama contact UID resolve',e);return ''}
}
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
  const list=$('usersList');
  if(list&&!list.dataset.chamaUidResolverBound){
    list.dataset.chamaUidResolverBound='1';
    list.addEventListener('click',async e=>{
      const row=e.target.closest?.('.user');
      if(!row||!list.contains(row))return;
      if(row.__chamaUidReady){delete row.__chamaUidReady;return}
      if(getUid(row))return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const uid=await resolveRowUid(row);
      if(!uid){alert('Não consegui identificar este contato. Tente novamente.');return}
      row.__chamaUidReady=true;
      row.click();
    },true);
  }
  list?.querySelectorAll('.user').forEach(row=>{
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
