(()=>{
  const STYLE_ID='chamaProfileCityStyleV1';
  let auth=null, db=null, fs=null, me=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #meName,#chatName,#chatAvatar,#usersList .user-name,#usersList .avatar{cursor:pointer}
      .chama-profile-backdrop{position:fixed;inset:0;background:#0007;z-index:3000;display:grid;place-items:center;padding:18px}
      .chama-profile-card{width:min(390px,100%);background:#fff;border-radius:24px;box-shadow:0 20px 60px #0004;overflow:hidden}
      .chama-profile-head{background:#0b7a53;color:#fff;padding:22px 20px;display:flex;align-items:center;gap:14px}
      .chama-profile-avatar{width:58px;height:58px;border-radius:50%;background:#ffffff22;display:grid;place-items:center;font-size:28px;flex:0 0 58px}
      .chama-profile-title{flex:1}.chama-profile-title strong{display:block;font-size:20px}.chama-profile-title small{opacity:.86}
      .chama-profile-close{border:0;background:#ffffff18;color:#fff;width:40px;height:40px;border-radius:12px;font-size:20px;cursor:pointer}
      .chama-profile-body{padding:20px}
      .chama-profile-location{background:#eef8f3;border:1px solid #dbece3;border-radius:16px;padding:16px}
      .chama-profile-location small{display:block;color:#65736c;font-weight:700;margin-bottom:4px}.chama-profile-location strong{font-size:20px;color:#16372a}
      .chama-profile-edit{display:grid;gap:10px;margin-top:16px}
      .chama-profile-edit label{font-size:13px;font-weight:800;color:#56645d}
      .chama-profile-edit input{width:100%;border:1px solid #cfd8d3;border-radius:13px;padding:12px 14px;outline:none}.chama-profile-edit input:focus{border-color:#0b7a53}
      .chama-profile-save{border:0;background:#0b7a53;color:#fff;border-radius:13px;padding:12px 14px;font-weight:800;cursor:pointer}
      .chama-profile-note{margin-top:13px;color:#748078;font-size:12px;line-height:1.45}
    `;
    document.head.appendChild(s);
  }

  async function getFirebase(attempt=0){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      const app=appMod.getApps()[0];
      if(!app){
        if(attempt>=20)return null;
        await new Promise(r=>setTimeout(r,100));
        return getFirebase(attempt+1);
      }
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');
      fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
      auth=authMod.getAuth(app);
      db=fs.getFirestore(app);
      return {authMod};
    }catch(e){console.error('Chama: perfil não iniciou',e);return null}
  }

  function closeProfile(){document.getElementById('chamaProfileModal')?.remove()}

  async function readCity(uid){
    if(!db||!fs||!uid)return '';
    try{
      const snap=await fs.getDoc(fs.doc(db,'publicProfiles',uid));
      return snap.exists()?String(snap.data()?.cidade||'').trim():'';
    }catch(e){console.error('Chama: não foi possível ler cidade',e);return ''}
  }

  async function openProfile(uid){
    if(!uid)return;
    closeProfile();
    const own=!!me&&uid===me.uid;
    const backdrop=document.createElement('div');
    backdrop.id='chamaProfileModal';
    backdrop.className='chama-profile-backdrop';
    const card=document.createElement('section');
    card.className='chama-profile-card';
    card.innerHTML=`
      <div class="chama-profile-head">
        <div class="chama-profile-avatar">📍</div>
        <div class="chama-profile-title"><strong>${own?'Meu perfil':'Perfil do Chama'}</strong><small>${own?'Sua cidade pública':'Informação pública do perfil'}</small></div>
        <button type="button" class="chama-profile-close" aria-label="Fechar">✕</button>
      </div>
      <div class="chama-profile-body">
        <div class="chama-profile-location"><small>Cidade</small><strong id="chamaProfileCityText">Carregando...</strong></div>
        ${own?`<div class="chama-profile-edit"><label for="chamaProfileCityInput">Editar sua cidade</label><input id="chamaProfileCityInput" maxlength="80" placeholder="Ex.: São Paulo"><button id="chamaProfileSaveCity" class="chama-profile-save" type="button">Salvar cidade</button></div>`:''}
        <div class="chama-profile-note">Nome e e-mail não são exibidos neste perfil público.</div>
      </div>`;
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
    card.querySelector('.chama-profile-close').onclick=closeProfile;
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeProfile()});

    const city=await readCity(uid);
    const text=card.querySelector('#chamaProfileCityText');
    if(text)text.textContent=city||'Cidade não informada';
    if(own){
      const input=card.querySelector('#chamaProfileCityInput');
      if(input)input.value=city;
      const save=card.querySelector('#chamaProfileSaveCity');
      if(save)save.onclick=async()=>{
        const value=(input?.value||'').trim().replace(/\s+/g,' ');
        if(value.length>80)return alert('Digite somente o nome da cidade.');
        save.disabled=true;save.textContent='Salvando...';
        try{
          await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{uid:me.uid,cidade:value,updatedAt:fs.serverTimestamp()},{merge:true});
          text.textContent=value||'Cidade não informada';
          save.textContent='Salvo ✓';
          setTimeout(()=>{if(save.isConnected){save.textContent='Salvar cidade';save.disabled=false}},900);
        }catch(e){
          console.error(e);alert('Não foi possível salvar a cidade.');save.textContent='Salvar cidade';save.disabled=false;
        }
      };
    }
  }

  function activeChatUid(){
    const email=(document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase();
    if(!email)return '';
    for(const row of document.querySelectorAll('#usersList .user')){
      const rowEmail=(row.querySelector('.user-email')?.textContent||'').trim().toLowerCase();
      if(rowEmail===email&&row.dataset.uid)return row.dataset.uid;
    }
    return '';
  }

  function installClicks(){
    document.addEventListener('click',e=>{
      const rowTarget=e.target.closest?.('#usersList .user-name,#usersList .avatar');
      if(rowTarget){
        const row=rowTarget.closest('.user');
        if(row?.dataset?.uid){e.preventDefault();e.stopPropagation();openProfile(row.dataset.uid)}
        return;
      }
      if(e.target.closest?.('#chatName,#chatAvatar')){
        const uid=activeChatUid();
        if(uid){e.preventDefault();e.stopPropagation();openProfile(uid)}
        return;
      }
      if(e.target.closest?.('#meName')){
        if(me?.uid){e.preventDefault();e.stopPropagation();openProfile(me.uid)}
      }
    },true);
    document.addEventListener('chama-open-my-profile',()=>{if(me?.uid)openProfile(me.uid)});
  }

  async function start(){
    addStyle();installClicks();
    const found=await getFirebase();
    if(!found)return;
    found.authMod.onAuthStateChanged(auth,u=>{me=u||null});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();