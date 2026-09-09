(()=>{
  const STYLE_ID='chamaProfileFollowStyleV2';
  let auth=null,db=null,fs=null,me=null;
  let firebaseReady=null;
  const followedLocal=new Set();
  const wait=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);

  function style(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-profile-follow{width:100%;margin-top:12px;border:0;border-radius:13px;padding:12px 14px;font-weight:900;cursor:pointer;background:#eef8f3;color:#0b7a53}
      .chama-profile-follow.following{background:#0b7a53;color:#fff}
      .chama-profile-follow[disabled]{opacity:.65;cursor:wait}
      .chama-home-follow{display:block;width:max-content;margin-top:6px;border:0;border-radius:999px;padding:5px 11px;font-size:11px;font-weight:900;cursor:pointer;background:#eef8f3;color:#0b7a53}
      .chama-home-follow.following{background:#0b7a53;color:#fff}
      .chama-home-follow[disabled]{opacity:.65;cursor:wait}
    `;document.head.appendChild(s);
  }

  async function initFirebase(){
    if(firebaseReady)return firebaseReady;
    firebaseReady=(async()=>{
      try{
        const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
        let app=appMod.getApps()[0];
        if(!app)return false;
        const [authMod,firestoreMod]=await Promise.all([
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
        ]);
        fs=firestoreMod;auth=authMod.getAuth(app);db=fs.getFirestore(app);me=auth.currentUser||null;
        authMod.onAuthStateChanged(auth,u=>{me=u||null});
        return true;
      }catch(e){console.warn('Chama: seguir não iniciou',e);return false}
    })();
    return firebaseReady;
  }

  function targetUid(){
    const active=document.getElementById('activeChat')?.dataset?.uid||window.__chamaActiveChatUid||'';
    if(active&&me?.uid&&active!==me.uid)return active;
    return '';
  }

  async function loadState(button,uid){
    if(!me||!db||!fs||!uid)return;
    try{
      const ref=fs.doc(db,'users',me.uid,'following',uid);
      const snap=await wait(fs.getDoc(ref),3500);
      button.classList.toggle('following',snap.exists());
      button.textContent=snap.exists()?'✓ Seguindo':'Seguir';
      button.dataset.following=snap.exists()?'1':'0';
      if(snap.exists())followedLocal.add(uid);
    }catch(e){
      button.textContent=followedLocal.has(uid)?'✓ Seguindo':'Seguir';
      button.dataset.following=followedLocal.has(uid)?'1':'0';
      console.warn('Chama: não foi possível consultar seguir',e);
    }
  }

  async function toggle(button,uid){
    if(!me||!db||!fs||!uid||uid===me.uid)return;
    button.disabled=true;
    const following=button.dataset.following==='1';
    try{
      const ref=fs.doc(db,'users',me.uid,'following',uid);
      if(following)await wait(fs.deleteDoc(ref),4000);
      else await wait(fs.setDoc(ref,{uid,createdAt:fs.serverTimestamp()}),4000);
      button.dataset.following=following?'0':'1';
      button.classList.toggle('following',!following);
      button.textContent=following?'Seguir':'✓ Seguindo';
      if(following)followedLocal.delete(uid);else followedLocal.add(uid);
      document.querySelectorAll('[data-chama-follow-uid="'+CSS.escape(uid)+'"]').forEach(b=>{
        b.dataset.following=following?'0':'1';b.classList.toggle('following',!following);b.textContent=following?'Seguir':'✓ Seguindo';
      });
    }catch(e){
      alert('Não foi possível atualizar o seguir agora.');
    }finally{button.disabled=false}
  }

  function addButton(container,uid,kind){
    if(!container||!uid||!me||uid===me.uid)return;
    if(container.querySelector('[data-chama-follow-uid]'))return;
    const button=document.createElement('button');
    button.type='button';button.className=kind==='home'?'chama-home-follow':'chama-profile-follow';button.textContent=followedLocal.has(uid)?'✓ Seguindo':'Seguir';button.dataset.following=followedLocal.has(uid)?'1':'0';button.dataset.chamaFollowUid=uid;
    button.onclick=e=>{e.preventDefault();e.stopPropagation();toggle(button,uid)};
    container.appendChild(button);
    if(kind!=='home')loadState(button,uid);
  }

  function enhanceProfile(){
    const card=document.querySelector('#chamaProfileModal .chama-profile-card');
    if(!card||card.dataset.followReady==='1')return;
    const uid=targetUid();
    if(!uid||!me||uid===me.uid)return;
    const title=card.querySelector('.chama-profile-title');
    if(!title)return;
    addButton(title,uid,'profile');
    card.dataset.followReady='1';
  }

  function enhanceHome(){
    if(!me)return;
    document.querySelectorAll('#usersList .user').forEach(row=>{
      const uid=String(row.dataset.uid||'').trim();
      if(!uid||uid===me.uid)return;
      const main=row.querySelector('.user-main')||row;
      addButton(main,uid,'home');
    });
    document.querySelectorAll('.chama-search-user,.chama-suggestion-user').forEach(row=>{
      const uid=String(row.dataset.uid||'').trim();
      if(!uid||uid===me.uid)return;
      const main=row.querySelector('.chama-search-main');
      addButton(main||row,uid,'home');
    });
  }

  function enhance(){enhanceProfile();enhanceHome()}

  async function start(){
    style();
    if(!(await initFirebase()))return;
    const observer=new MutationObserver(()=>enhance());
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(enhance,150);
    setTimeout(enhance,700);
    setTimeout(enhance,1800);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
