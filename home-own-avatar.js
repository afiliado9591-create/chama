(()=>{
  const STYLE_ID='chamaHomeOwnAvatarStyleV2';
  let me=null,db=null,fs=null,lastPhoto='';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .me.chama-me-with-photo{display:flex;align-items:center;gap:12px;padding:14px 16px}
      .chama-me-avatar{width:56px;height:56px;border-radius:50%;background:#dff4ea;color:#0b7a53;display:grid;place-items:center;font-size:20px;font-weight:900;overflow:hidden;flex:0 0 56px;border:2px solid #cbe9da;cursor:pointer;box-shadow:0 2px 8px #0b7a5314}
      .chama-me-avatar img{width:100%;height:100%;object-fit:cover;display:block}
      .chama-me-info{min-width:0;flex:1}.chama-me-info #meName{font-size:18px}.chama-me-info #meEmail{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    `;
    document.head.appendChild(s);
  }

  function safePhotoUrl(value){
    const v=String(value||'').trim();if(!v)return '';
    try{const u=new URL(v,location.origin);if(u.origin!==location.origin||u.pathname!=='/api/media'||!u.searchParams.get('key'))return '';return u.href}catch{return ''}
  }

  function ensureOwnAvatar(){
    const box=document.querySelector('.me');
    if(!box)return null;
    let avatar=document.getElementById('chamaMeAvatar');
    if(avatar)return avatar;

    const info=document.createElement('div');
    info.className='chama-me-info';
    while(box.firstChild)info.appendChild(box.firstChild);

    avatar=document.createElement('button');
    avatar.id='chamaMeAvatar';
    avatar.type='button';
    avatar.className='chama-me-avatar';
    avatar.setAttribute('aria-label','Abrir meu perfil');
    avatar.title='Abrir meu perfil';
    avatar.onclick=e=>{e.preventDefault();e.stopPropagation();document.dispatchEvent(new CustomEvent('chama-open-my-profile'))};

    box.classList.add('chama-me-with-photo');
    box.append(avatar,info);
    return avatar;
  }

  function render(url=''){
    const avatar=ensureOwnAvatar();if(!avatar)return;
    const safe=safePhotoUrl(url);
    if(safe===lastPhoto && ((safe&&avatar.querySelector('img'))||(!safe&&!avatar.querySelector('img'))))return;
    lastPhoto=safe;
    avatar.replaceChildren();
    if(safe){
      const img=document.createElement('img');
      img.alt='Minha foto de perfil';img.src=safe;img.referrerPolicy='no-referrer';
      img.onerror=()=>{lastPhoto='';render('')};
      avatar.appendChild(img);return;
    }
    const label=(me?.displayName||me?.email?.split('@')[0]||'V').trim();
    avatar.textContent=(label.charAt(0)||'V').toUpperCase();
  }

  async function loadOwnPhoto(){
    if(!me||!db||!fs)return render('');
    try{
      const snap=await fs.getDoc(fs.doc(db,'publicProfiles',me.uid));
      render(snap.exists()?snap.data()?.photoUrl||'':'');
    }catch(e){console.warn('Chama: não foi possível carregar a foto no topo',e);render('')}
  }

  function listenProfileUpdates(){
    document.addEventListener('chama-profile-updated',e=>{
      const detail=e.detail||{};
      if(!me||detail.uid!==me.uid)return;
      if('photoUrl' in detail)render(detail.photoUrl||'');
    });
  }

  async function start(){
    addStyle();ensureOwnAvatar();listenProfileUpdates();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];
      for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      fs=firestoreMod;db=fs.getFirestore(app);
      const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,user=>{
        me=user||null;lastPhoto='';
        if(!user){render('');return}
        loadOwnPhoto();
      });
    }catch(e){console.warn('Chama: foto do topo não iniciou',e)}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();