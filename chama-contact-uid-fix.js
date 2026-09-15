(()=>{'use strict';
if(window.__CHAMA_CONTACT_UID_FIX__)return;
window.__CHAMA_CONTACT_UID_FIX__=true;
let fs=null,db=null,ready=false;
const $=id=>document.getElementById(id);
async function init(){if(ready)return true;try{const A=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');const app=A.getApps()[0];if(!app)return false;db=fs.getFirestore(app);ready=true;return true}catch(e){console.error('Chama UID fix init',e);return false}}
async function resolve(row){
  if(!row)return false;
  const existing=String(row.dataset.uid||'').trim();
  if(existing){window.__chamaActiveUid=existing;$('activeChat')?.setAttribute('data-uid',existing);return true}
  const email=(row.querySelector('.user-email')?.textContent||'').trim().toLowerCase();
  if(!email)return false;
  if(!(await init()))return false;
  try{
    const snap=await fs.getDocs(fs.query(fs.collection(db,'users'),fs.where('email','==',email),fs.limit(1)));
    const d=snap.docs[0];
    if(!d)return false;
    const uid=d.id;
    row.dataset.uid=uid;
    row.setAttribute('data-uid',uid);
    window.__chamaActiveUid=uid;
    $('activeChat')?.setAttribute('data-uid',uid);
    return true;
  }catch(e){console.error('Chama UID resolve',e);return false}
}
function bind(){
  const list=$('usersList');
  if(!list||list.dataset.chamaUidFixBound)return;
  list.dataset.chamaUidFixBound='1';
  list.addEventListener('click',async e=>{
    const row=e.target.closest?.('.user');
    if(!row||!list.contains(row))return;
    if(row.__chamaUidReady){delete row.__chamaUidReady;return}
    if(row.dataset.uid){window.__chamaActiveUid=row.dataset.uid;$('activeChat')?.setAttribute('data-uid',row.dataset.uid);return}
    e.preventDefault();
    e.stopImmediatePropagation();
    const ok=await resolve(row);
    if(!ok){
      alert('Não consegui identificar este contato. Tente fechar e abrir a conversa novamente.');
      return;
    }
    row.__chamaUidReady=true;
    row.click();
  },true);
}
function seedRows(){
  const list=$('usersList');
  if(!list)return;
  list.querySelectorAll('.user').forEach(row=>{
    if(row.dataset.uid)return;
    const email=(row.querySelector('.user-email')?.textContent||'').trim();
    if(!email)return;
  });
}
function start(){bind();seedRows();setInterval(()=>{bind();seedRows()},1200)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
