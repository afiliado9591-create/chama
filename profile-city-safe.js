(()=>{
  const STYLE_ID='chamaProfileCityStyleV3';
  const CHATSHOP_HOME='https://alibr.com.br/';
  let auth=null,db=null,fs=null,me=null;

  const norm=v=>String(v||'').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #meName,#chatName,#chatAvatar{cursor:pointer}
      .chama-profile-required{display:inline-flex;align-items:center;margin-left:8px;padding:4px 8px;border-radius:999px;background:#d92d20;color:#fff;font-size:11px;font-weight:900;line-height:1.1;cursor:pointer;box-shadow:0 2px 8px #d92d2038;vertical-align:middle}
      .chama-profile-backdrop{position:fixed;inset:0;background:#0007;z-index:3000;display:grid;place-items:center;padding:18px}
      .chama-profile-card{width:min(410px,100%);max-height:92dvh;overflow:auto;background:#fff;border-radius:24px;box-shadow:0 20px 60px #0004}
      .chama-profile-head{background:#0b7a53;color:#fff;padding:22px 20px;display:flex;align-items:center;gap:14px}
      .chama-profile-avatar{width:58px;height:58px;border-radius:50%;background:#ffffff22;display:grid;place-items:center;font-size:28px;flex:0 0 58px}
      .chama-profile-title{flex:1}.chama-profile-title strong{display:block;font-size:20px}.chama-profile-title small{opacity:.86}
      .chama-profile-close{border:0;background:#ffffff18;color:#fff;width:40px;height:40px;border-radius:12px;font-size:20px;cursor:pointer}
      .chama-profile-body{padding:20px}.chama-profile-location{background:#eef8f3;border:1px solid #dbece3;border-radius:16px;padding:16px}
      .chama-profile-location small{display:block;color:#65736c;font-weight:700;margin-bottom:4px}.chama-profile-location strong{font-size:20px;color:#16372a}
      .chama-profile-edit{display:grid;gap:10px;margin-top:16px}.chama-profile-edit label{font-size:13px;font-weight:800;color:#56645d}
      .chama-profile-edit input{width:100%;border:1px solid #cfd8d3;border-radius:13px;padding:12px 14px;outline:none}.chama-profile-edit input:focus{border-color:#0b7a53}
      .chama-profile-save{border:0;background:#0b7a53;color:#fff;border-radius:13px;padding:12px 14px;font-weight:850;cursor:pointer}
      .chama-shop-create,.chama-shop-public{display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border-radius:14px;padding:13px 14px;font-weight:900;margin-top:14px}
      .chama-shop-create{background:#e7f7ef;color:#0b7a53;border:1px solid #cbe9da}.chama-shop-public{background:#0b7a53;color:#fff}
      .chama-profile-note{margin-top:13px;color:#748078;font-size:12px;line-height:1.45}.chama-profile-required-note{margin-top:14px;background:#fff1f0;border:1px solid #ffd3cf;color:#a51d1d;border-radius:13px;padding:11px 12px;font-size:13px;font-weight:800}
    `;document.head.appendChild(s);
  }

  async function getFirebase(attempt=0){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');const app=appMod.getApps()[0];
      if(!app){if(attempt>=20)return null;await new Promise(r=>setTimeout(r,100));return getFirebase(attempt+1)}
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
      auth=authMod.getAuth(app);db=fs.getFirestore(app);return {authMod};
    }catch(e){console.error('Chama: perfil não iniciou',e);return null}
  }

  function cleanChatShopLink(value){
    let v=String(value||'').trim();if(!v)return '';
    if(!/^https?:\/\//i.test(v))v='https://'+v;
    try{const u=new URL(v);const h=u.hostname.toLowerCase();if(u.protocol!=='https:'||(h!=='alibr.com.br'&&!h.endsWith('.alibr.com.br')))return null;return u.href}catch{return null}
  }

  function closeProfile(){document.getElementById('chamaProfileModal')?.remove()}

  async function readProfile(uid){
    if(!db||!fs||!uid)return {nome:'',cidade:'',chatshopLink:''};
    try{const snap=await fs.getDoc(fs.doc(db,'publicProfiles',uid));if(!snap.exists())return {nome:'',cidade:'',chatshopLink:''};const d=snap.data()||{};return {nome:String(d.nome||'').trim(),cidade:String(d.cidade||'').trim(),chatshopLink:String(d.chatshopLink||'').trim()}}
    catch(e){console.error('Chama: não foi possível ler perfil público',e);return {nome:'',cidade:'',chatshopLink:''}}
  }

  function renderRequiredBadge(cidade){
    const old=document.getElementById('chamaProfileRequiredBadge');
    if(String(cidade||'').trim()){old?.remove();return}
    const name=document.getElementById('meName');if(!name||!me)return;
    const b=old||document.createElement('span');b.id='chamaProfileRequiredBadge';b.className='chama-profile-required';b.textContent='Preencha seu perfil';b.title='Informe sua cidade para concluir seu perfil';b.onclick=e=>{e.preventDefault();e.stopPropagation();openProfile(me.uid)};
    if(!old)name.insertAdjacentElement('afterend',b);
  }

  async function syncOwnPublicProfile(user){
    if(!user||!db||!fs)return null;
    const nome=(user.displayName||user.email?.split('@')[0]||'Usuário').trim();
    try{
      const ref=fs.doc(db,'publicProfiles',user.uid),snap=await fs.getDoc(ref),old=snap.exists()?snap.data()||{}:{};
      const patch={uid:user.uid,nome,nomeBusca:norm(nome)};const cidade=String(old.cidade||'').trim();if(cidade)patch.cidadeBusca=norm(cidade);
      if(!snap.exists()||old.nome!==nome||old.nomeBusca!==patch.nomeBusca||(cidade&&old.cidadeBusca!==patch.cidadeBusca)){patch.updatedAt=fs.serverTimestamp();await fs.setDoc(ref,patch,{merge:true})}
      return {...old,...patch,cidade,chatshopLink:String(old.chatshopLink||'').trim()};
    }catch(e){console.warn('Chama: não foi possível indexar perfil público',e);return null}
  }

  function shopButton(link){
    const safe=cleanChatShopLink(link);if(!safe)return '';
    return `<a class="chama-shop-public" href="${safe}" target="_blank" rel="noopener noreferrer">🛍️ Ver minha vitrine</a>`;
  }

  async function openProfile(uid){
    if(!uid)return;closeProfile();const own=!!me&&uid===me.uid;
    const backdrop=document.createElement('div');backdrop.id='chamaProfileModal';backdrop.className='chama-profile-backdrop';
    const card=document.createElement('section');card.className='chama-profile-card';card.innerHTML=`
      <div class="chama-profile-head"><div class="chama-profile-avatar">👤</div><div class="chama-profile-title"><strong id="chamaProfileNameText">${own?'Meu perfil':'Perfil do Chama'}</strong><small>${own?'Complete seu perfil':'Perfil público'}</small></div><button type="button" class="chama-profile-close" aria-label="Fechar">✕</button></div>
      <div class="chama-profile-body">
        <div class="chama-profile-location"><small>Cidade</small><strong id="chamaProfileCityText">Carregando...</strong></div>
        <div id="chamaProfileShopArea"></div>
        ${own?`<div id="chamaProfileRequiredNote" class="chama-profile-required-note">🔴 Para concluir seu perfil, informe sua cidade.</div><a class="chama-shop-create" href="${CHATSHOP_HOME}" target="_blank" rel="noopener noreferrer">🛍️ Venda seu produto no ChatShop</a><div class="chama-profile-edit"><label for="chamaProfileCityInput">Cidade *</label><input id="chamaProfileCityInput" maxlength="80" placeholder="Ex.: São Paulo"><label for="chamaProfileShopInput">Link ChatShop (opcional)</label><input id="chamaProfileShopInput" maxlength="500" placeholder="Cole aqui o link do seu catálogo"><button id="chamaProfileSave" class="chama-profile-save" type="button">Salvar perfil</button></div>`:''}
        <div class="chama-profile-note">Seu e-mail não aparece no perfil público. O link do ChatShop é opcional e deve usar alibr.com.br.</div>
      </div>`;
    backdrop.appendChild(card);document.body.appendChild(backdrop);card.querySelector('.chama-profile-close').onclick=closeProfile;backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeProfile()});

    const profile=await readProfile(uid),nameText=card.querySelector('#chamaProfileNameText'),cityText=card.querySelector('#chamaProfileCityText'),shopArea=card.querySelector('#chamaProfileShopArea');
    if(nameText&&profile.nome)nameText.textContent=profile.nome;if(cityText)cityText.textContent=profile.cidade||'Cidade não informada';if(shopArea)shopArea.innerHTML=shopButton(profile.chatshopLink);

    if(own){
      const city=card.querySelector('#chamaProfileCityInput'),shop=card.querySelector('#chamaProfileShopInput'),save=card.querySelector('#chamaProfileSave'),note=card.querySelector('#chamaProfileRequiredNote');
      city.value=profile.cidade;shop.value=profile.chatshopLink;if(profile.cidade)note.style.display='none';
      save.onclick=async()=>{
        const cidade=(city.value||'').trim().replace(/\s+/g,' ');if(!cidade)return alert('Informe sua cidade para concluir o perfil.');if(cidade.length>80)return alert('Digite somente o nome da cidade.');
        const link=cleanChatShopLink(shop.value);if(link===null)return alert('Use somente um link do ChatShop em alibr.com.br.');
        save.disabled=true;save.textContent='Salvando...';
        try{
          const nome=(me.displayName||me.email?.split('@')[0]||'Usuário').trim();
          await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{uid:me.uid,nome,nomeBusca:norm(nome),cidade,cidadeBusca:norm(cidade),chatshopLink:link||'',updatedAt:fs.serverTimestamp()},{merge:true});
          cityText.textContent=cidade;if(nameText)nameText.textContent=nome;if(shopArea)shopArea.innerHTML=shopButton(link);note.style.display='none';renderRequiredBadge(cidade);save.textContent='Perfil salvo ✓';
          setTimeout(()=>{if(save.isConnected){save.textContent='Salvar perfil';save.disabled=false}},1000);
        }catch(e){console.error(e);alert('Não foi possível salvar o perfil.');save.textContent='Salvar perfil';save.disabled=false}
      };
    }
  }

  function activeChatUid(){
    const direct=document.getElementById('activeChat')?.dataset?.uid||'';if(direct)return direct;
    const email=(document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase();if(!email)return '';
    for(const row of document.querySelectorAll('#usersList .user')){const rowEmail=(row.querySelector('.user-email')?.textContent||'').trim().toLowerCase();if(rowEmail===email&&row.dataset.uid)return row.dataset.uid}return '';
  }

  function installClicks(){
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#chatName,#chatAvatar')){const uid=activeChatUid();if(uid){e.preventDefault();e.stopPropagation();openProfile(uid)}return}
      if(e.target.closest?.('#meName')){if(me?.uid){e.preventDefault();e.stopPropagation();openProfile(me.uid)}}
    },true);
    document.addEventListener('chama-open-my-profile',()=>{if(me?.uid)openProfile(me.uid)});
  }

  async function start(){
    addStyle();installClicks();const found=await getFirebase();if(!found)return;
    found.authMod.onAuthStateChanged(auth,async u=>{me=u||null;document.getElementById('chamaProfileRequiredBadge')?.remove();if(!u)return;const p=await syncOwnPublicProfile(u);renderRequiredBadge(p?.cidade||'')});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();