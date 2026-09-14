(()=>{
  'use strict';
  const STYLE='chamaVisualFixesV1';
  let fs=null,db=null,started=false;
  const photoCache=new Map();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeUrl(v){const s=String(v||'').trim();if(!s)return '';try{const u=new URL(s,location.origin);if(u.origin!==location.origin||u.pathname!=='/api/media'||!u.searchParams.get('key'))return '';return u.href}catch{return ''}}
  function addStyle(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`#usersList .avatar{overflow:hidden;flex:0 0 44px}#usersList .avatar img{width:100%;height:100%;object-fit:cover;display:block}#chatAvatar{overflow:hidden}#chatAvatar img{width:100%;height:100%;object-fit:cover;display:block}#chamaFloatingStore{z-index:9999!important;display:flex!important}`;document.head.appendChild(s)}
  async function initFs(){try{const a=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');const app=a.getApps()[0];if(app)db=fs.getFirestore(app)}catch(e){console.warn('Chama visual fixes Firebase',e)}}
  async function getPhoto(uid,known=''){
    const direct=safeUrl(known);if(direct)return direct;
    if(!uid)return '';
    if(photoCache.has(uid))return photoCache.get(uid);
    if(!db||!fs)return '';
    try{const snap=await fs.getDoc(fs.doc(db,'publicProfiles',uid));const url=snap.exists()?safeUrl(snap.data()?.photoUrl):'';photoCache.set(uid,url);return url}catch{return ''}
  }
  async function paintRow(row){
    const uid=row?.dataset?.uid;if(!uid)return;
    const avatar=row.querySelector('.avatar');if(!avatar)return;
    const name=row.querySelector('.user-name')?.textContent||'Usuário';
    const known=row.dataset.photoUrl||'';const url=await getPhoto(uid,known);if(!row.isConnected)return;
    if(url){avatar.innerHTML='<img alt="Foto de perfil" loading="lazy" referrerpolicy="no-referrer" src="'+esc(url)+'">';}
  }
  function scan(){document.querySelectorAll('#usersList .user').forEach(paintRow)}
  function hookChat(){const old=window.chamaOpenChat;if(typeof old==='function'&&!old.__visualWrapped){const wrapped=async detail=>{old(detail);const uid=detail?.uid||detail?.id;const avatar=document.getElementById('chatAvatar');const url=await getPhoto(uid,detail?.photoUrl||'');if(avatar&&url)avatar.innerHTML='<img alt="Foto de perfil" referrerpolicy="no-referrer" src="'+esc(url)+'">'};wrapped.__visualWrapped=true;window.chamaOpenChat=wrapped}}
  function ensureStore(){if(document.getElementById('chamaFloatingStore'))return;const s=document.createElement('script');s.src='./loja-flutuante.js?v=2';s.defer=true;document.head.appendChild(s)}
  async function start(){if(started)return;started=true;addStyle();await initFs();ensureStore();scan();hookChat();const obs=new MutationObserver(()=>{scan();hookChat()});obs.observe(document.body,{childList:true,subtree:true});setInterval(()=>{scan();hookChat()},1200)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
