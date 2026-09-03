(()=>{
  const STYLE_ID='chamaAvatarEverywhereStyleV1';
  const CACHE_PREFIX='chama_public_profile_cache_v1_';
  const memory=new Map();
  let db=null,fs=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #chatAvatar{overflow:hidden;background:#dff4ea;color:#0b7a53}
      #chatAvatar img{width:100%;height:100%;object-fit:cover;display:block}
    `;document.head.appendChild(s);
  }

  function safePhotoUrl(value){
    const v=String(value||'').trim();if(!v)return '';
    try{const u=new URL(v,location.origin);if(u.origin!==location.origin||u.pathname!=='/api/media'||!u.searchParams.get('key'))return '';return u.href}catch{return ''}
  }

  function readLocal(uid){
    try{const d=JSON.parse(localStorage.getItem(CACHE_PREFIX+uid)||'{}');return safePhotoUrl(d?.photoUrl||'')}catch{return ''}
  }

  function render(el,url,name='U'){
    if(!el)return;const safe=safePhotoUrl(url);el.textContent='';
    if(!safe){el.textContent=(String(name||'U').trim().charAt(0)||'U').toUpperCase();return}
    const img=document.createElement('img');img.alt='Foto de perfil';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=safe;img.onerror=()=>{el.textContent=(String(name||'U').trim().charAt(0)||'U').toUpperCase()};el.appendChild(img);
  }

  function photoFromVisibleRow(uid){
    const row=document.querySelector(`#usersList .user[data-uid="${CSS.escape(uid)}"]`);
    if(!row)return '';
    const direct=safePhotoUrl(row.dataset.photoUrl||'');if(direct)return direct;
    return safePhotoUrl(row.querySelector(':scope > .avatar img')?.src||'');
  }

  async function fetchPhoto(uid){
    if(!uid)return '';
    if(memory.has(uid))return memory.get(uid);
    const local=readLocal(uid);if(local){memory.set(uid,local);return local}
    if(!db||!fs)return '';
    try{
      const snap=await fs.getDoc(fs.doc(db,'publicProfiles',uid));
      const photo=snap.exists()?safePhotoUrl(snap.data()?.photoUrl||''):'';
      memory.set(uid,photo);
      return photo;
    }catch{return ''}
  }

  async function showChatPhoto(detail={}){
    const uid=String(detail.uid||'').trim();if(!uid)return;
    const name=String(detail.nome||document.getElementById('chatName')?.textContent||'U');
    const avatar=document.getElementById('chatAvatar');if(!avatar)return;
    const immediate=safePhotoUrl(detail.photoUrl||'')||photoFromVisibleRow(uid)||readLocal(uid);
    render(avatar,immediate,name);
    if(immediate){memory.set(uid,immediate);return}
    const photo=await fetchPhoto(uid);
    const activeUid=document.getElementById('activeChat')?.dataset?.uid||'';
    if(activeUid===uid)render(avatar,photo,name);
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');db=fs.getFirestore(app);
    }catch(e){console.warn('Chama: fotos globais não iniciaram',e)}
  }

  function start(){
    addStyle();initFirebase();
    document.addEventListener('chama-chat-opened',e=>showChatPhoto(e.detail||{}));
    document.addEventListener('chama-profile-updated',e=>{const uid=String(e.detail?.uid||'');const photo=safePhotoUrl(e.detail?.photoUrl||'');if(uid)memory.set(uid,photo)});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();