(()=>{
  const STYLE_ID='chamaProfileSafeV6Style';
  const CHATSHOP_HOME='https://alibr.com.br/';
  const CACHE_PREFIX='chama_public_profile_cache_v1_';
  let auth=null,db=null,fs=null,me=null,ownProfile=null;

  const norm=v=>String(v||'').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const emptyProfile=()=>({nome:'',cidade:'',chatshopLink:'',photoUrl:'',photoKey:''});
  const wait=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #meName,#chatName,#chatAvatar{cursor:pointer}
      .chama-profile-required{display:inline-flex;align-items:center;margin-left:8px;padding:4px 8px;border-radius:999px;background:#d92d20;color:#fff;font-size:11px;font-weight:900;line-height:1.1;cursor:pointer;box-shadow:0 2px 8px #d92d2038;vertical-align:middle}
      .chama-profile-backdrop{position:fixed;inset:0;background:#0007;z-index:3000;display:grid;place-items:center;padding:18px}
      .chama-profile-card{width:min(410px,100%);max-height:92dvh;overflow:auto;background:#fff;border-radius:24px;box-shadow:0 20px 60px #0004}
      .chama-profile-head{background:#0b7a53;color:#fff;padding:22px 20px;display:flex;align-items:center;gap:14px}
      .chama-profile-avatar{width:72px;height:72px;border-radius:50%;background:#ffffff22;display:grid;place-items:center;font-size:30px;flex:0 0 72px;overflow:hidden;border:3px solid #ffffff80}
      .chama-profile-avatar img{width:100%;height:100%;object-fit:cover;display:block}
      .chama-profile-title{flex:1;min-width:0}.chama-profile-title strong{display:block;font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chama-profile-title small{opacity:.86}
      .chama-profile-close{border:0;background:#ffffff18;color:#fff;width:40px;height:40px;border-radius:12px;font-size:20px;cursor:pointer;flex:0 0 40px}
      .chama-profile-body{padding:20px}.chama-profile-location{background:#eef8f3;border:1px solid #dbece3;border-radius:16px;padding:16px}
      .chama-profile-location small{display:block;color:#65736c;font-weight:700;margin-bottom:4px}.chama-profile-location strong{font-size:20px;color:#16372a}
      .chama-photo-actions{display:flex;gap:9px;align-items:center;margin-top:14px}.chama-photo-btn{border:0;background:#eef8f3;color:#0b7a53;border-radius:12px;padding:11px 13px;font-weight:900;cursor:pointer}.chama-photo-btn[disabled]{opacity:.65}.chama-photo-help{font-size:11px;color:#748078}
      .chama-profile-edit{display:grid;gap:10px;margin-top:16px}.chama-profile-edit label{font-size:13px;font-weight:800;color:#56645d}
      .chama-profile-edit input{width:100%;border:1px solid #cfd8d3;border-radius:13px;padding:12px 14px;outline:none}.chama-profile-edit input:focus{border-color:#0b7a53}
      .chama-profile-save{border:0;background:#0b7a53;color:#fff;border-radius:13px;padding:12px 14px;font-weight:850;cursor:pointer}.chama-profile-save[disabled]{opacity:.65}
      .chama-shop-create,.chama-shop-public{display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border-radius:14px;padding:13px 14px;font-weight:900;margin-top:14px}
      .chama-shop-create{background:#e7f7ef;color:#0b7a53;border:1px solid #cbe9da}.chama-shop-public{background:#0b7a53;color:#fff}
      .chama-profile-note{margin-top:13px;color:#748078;font-size:12px;line-height:1.45}.chama-profile-required-note{margin-top:14px;background:#fff1f0;border:1px solid #ffd3cf;color:#a51d1d;border-radius:13px;padding:11px 12px;font-size:13px;font-weight:800}
      .chama-profile-load-error{font-size:13px;color:#a51d1d;margin-top:8px}
    `;document.head.appendChild(s);
  }

  function cleanProfileLink(value){
    let v=String(value||'').trim();if(!v)return '';
    if(!/^https?:\/\//i.test(v))v='https://'+v;
    try{const u=new URL(v);if(u.protocol!=='https:'||!u.hostname)return null;return u.href}catch{return null}
  }

  function safePhotoUrl(value){
    const v=String(value||'').trim();if(!v)return '';
    try{const u=new URL(v,location.origin);if(u.origin!==location.origin||u.pathname!=='/api/media'||!u.searchParams.get('key'))return '';return u.href}catch{return ''}
  }

  function normalizeProfile(d={}){
    return {nome:String(d.nome||'').trim(),cidade:String(d.cidade||'').trim(),chatshopLink:String(d.chatshopLink||'').trim(),photoUrl:safePhotoUrl(d.photoUrl),photoKey:String(d.photoKey||'').trim()};
  }

  function cacheKey(uid){return CACHE_PREFIX+uid}
  function readLocal(uid){try{return normalizeProfile(JSON.parse(localStorage.getItem(cacheKey(uid))||'{}'))}catch{return emptyProfile()}}
  function writeLocal(uid,p){try{localStorage.setItem(cacheKey(uid),JSON.stringify(normalizeProfile(p)))}catch(_){}}

  async function getFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return null;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;auth=authMod.getAuth(app);db=fs.getFirestore(app);return authMod;
    }catch(e){console.error('Chama: perfil não iniciou',e);return null}
  }

  async function readServer(uid,timeout=4500){
    if(!db||!fs||!uid)return emptyProfile();
    try{
      const snap=await wait(fs.getDoc(fs.doc(db,'publicProfiles',uid)),timeout);
      const p=snap.exists()?normalizeProfile(snap.data()||{}):emptyProfile();writeLocal(uid,p);return p;
    }catch(e){
      if(e?.message!=='timeout')console.warn('Chama: perfil não carregou',e);
      return readLocal(uid);
    }
  }

  function renderRequiredBadge(cidade){
    const old=document.getElementById('chamaProfileRequiredBadge');
    if(String(cidade||'').trim()){old?.remove();return}
    const name=document.getElementById('meName');if(!name||!me)return;
    const b=old||document.createElement('span');b.id='chamaProfileRequiredBadge';b.className='chama-profile-required';b.textContent='Preencha seu perfil';b.title='Informe sua cidade para concluir seu perfil';b.onclick=e=>{e.preventDefault();e.stopPropagation();openProfile(me.uid)};
    if(!old)name.insertAdjacentElement('afterend',b);
  }

  async function syncOwn(user){
    if(!user||!db||!fs)return;
    const local=readLocal(user.uid);ownProfile=local;renderRequiredBadge(local.cidade);
    const p=await readServer(user.uid,5000);ownProfile=p;renderRequiredBadge(p.cidade);
    const nome=(user.displayName||user.email?.split('@')[0]||'Usuário').trim();
    if(!p.nome||p.nome!==nome){
      try{await fs.setDoc(fs.doc(db,'publicProfiles',user.uid),{uid:user.uid,nome,nomeBusca:norm(nome),updatedAt:fs.serverTimestamp()},{merge:true});ownProfile={...p,nome};writeLocal(user.uid,ownProfile)}catch(e){console.warn('Chama: não foi possível atualizar nome público',e)}
    }
  }

  function shopButton(link){const safe=cleanProfileLink(link);return safe?`<a class="chama-shop-public" href="${safe}" target="_blank" rel="noopener noreferrer">🔗 Acessar meu link</a>`:''}
  function renderAvatar(el,url){if(!el)return;const safe=safePhotoUrl(url);el.textContent='';if(!safe){el.textContent='👤';return}const img=document.createElement('img');img.alt='Foto de perfil';img.loading='lazy';img.src=safe;img.onerror=()=>{el.textContent='👤'};el.appendChild(img)}
  function closeProfile(){document.getElementById('chamaProfileModal')?.remove()}

  async function deleteOldPhoto(key){
    if(!key||!me)return;try{const token=await me.getIdToken();await fetch('/api/media?key='+encodeURIComponent(key),{method:'DELETE',headers:{Authorization:'Bearer '+token}})}catch(_){ }
  }

  async function uploadPhoto(file,current,avatar,button){
    if(!me||!file)return;if(!file.type?.startsWith('image/'))return alert('Escolha uma imagem para a foto do perfil.');if(file.size>5*1024*1024)return alert('A foto deve ter no máximo 5 MB.');
    button.disabled=true;button.textContent='Enviando foto...';let newKey='';
    try{
      const token=await me.getIdToken();const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name||'foto-perfil')},body:file});
      const data=await r.json().catch(()=>({}));if(!r.ok||!data.url||!data.key)throw new Error(data.error||'Não foi possível enviar a foto.');newKey=data.key;
      await wait(fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{photoUrl:data.url,photoKey:data.key,updatedAt:fs.serverTimestamp()},{merge:true}),5000);
      const oldKey=current.photoKey||'';current.photoUrl=data.url;current.photoKey=data.key;ownProfile={...(ownProfile||{}),...current};writeLocal(me.uid,ownProfile);renderAvatar(avatar,data.url);button.textContent='Trocar foto';
      document.dispatchEvent(new CustomEvent('chama-profile-updated',{detail:{uid:me.uid,photoUrl:data.url}}));if(oldKey&&oldKey!==data.key)deleteOldPhoto(oldKey);
    }catch(e){if(newKey)deleteOldPhoto(newKey);alert('Não foi possível salvar a foto agora. Tente novamente.');button.textContent=current.photoUrl?'Trocar foto':'Colocar foto'}finally{button.disabled=false}
  }

  function applyProfile(card,p,own){
    const nameText=card.querySelector('#chamaProfileNameText'),cityText=card.querySelector('#chamaProfileCityText'),shopArea=card.querySelector('#chamaProfileShopArea'),avatar=card.querySelector('#chamaProfileAvatar');
    if(nameText&&p.nome)nameText.textContent=p.nome;if(cityText)cityText.textContent=p.cidade||'Cidade não informada';if(shopArea)shopArea.innerHTML=shopButton(p.chatshopLink);renderAvatar(avatar,p.photoUrl);
    if(own){const city=card.querySelector('#chamaProfileCityInput'),shop=card.querySelector('#chamaProfileShopInput'),note=card.querySelector('#chamaProfileRequiredNote'),photoBtn=card.querySelector('#chamaProfilePhotoBtn');if(city)city.value=p.cidade||'';if(shop)shop.value=p.chatshopLink||'';if(note)note.style.display=p.cidade?'none':'block';if(photoBtn)photoBtn.textContent=p.photoUrl?'Trocar foto':'Colocar foto'}
  }

  async function openProfile(uid){
    if(!uid)return;closeProfile();const own=!!me&&uid===me.uid;
    const card=document.createElement('section');card.className='chama-profile-card';card.innerHTML=`<div class="chama-profile-head"><div class="chama-profile-avatar" id="chamaProfileAvatar">👤</div><div class="chama-profile-title"><strong id="chamaProfileNameText">${own?'Meu perfil':'Perfil do Chama'}</strong><small>${own?'Complete seu perfil':'Perfil público'}</small></div><button type="button" class="chama-profile-close" aria-label="Fechar">✕</button></div><div class="chama-profile-body">${own?`<div class="chama-photo-actions"><button id="chamaProfilePhotoBtn" class="chama-photo-btn" type="button">Colocar foto</button><span class="chama-photo-help">JPG, PNG ou WebP • até 5 MB</span><input id="chamaProfilePhotoInput" type="file" accept="image/jpeg,image/png,image/webp" hidden></div>`:''}<div class="chama-profile-location" style="margin-top:${own?'14px':'0'}"><small>Cidade</small><strong id="chamaProfileCityText">${own&&ownProfile?.cidade?ownProfile.cidade:'Carregando...'}</strong></div><div id="chamaProfileShopArea"></div>${own?`<div id="chamaProfileRequiredNote" class="chama-profile-required-note">🔴 Para concluir seu perfil, informe sua cidade.</div><a class="chama-shop-create" href="${CHATSHOP_HOME}" target="_blank" rel="noopener noreferrer">🛍️ Venda seu produto no ChatShop</a><div class="chama-profile-edit"><label for="chamaProfileCityInput">Cidade *</label><input id="chamaProfileCityInput" maxlength="80" placeholder="Ex.: São Paulo"><label for="chamaProfileShopInput">Seu link (opcional)</label><input id="chamaProfileShopInput" maxlength="500" inputmode="url" placeholder="Link de afiliado, loja, catálogo ou rede social"><button id="chamaProfileSave" class="chama-profile-save" type="button">Salvar perfil</button></div>`:''}<div class="chama-profile-note">Seu e-mail não aparece no perfil público. A foto e o seu link são opcionais.</div><div id="chamaProfileLoadError" class="chama-profile-load-error" hidden>Não consegui atualizar os dados agora. Você pode fechar e abrir o perfil novamente.</div></div>`;
    const backdrop=document.createElement('div');backdrop.id='chamaProfileModal';backdrop.className='chama-profile-backdrop';backdrop.appendChild(card);document.body.appendChild(backdrop);
    card.querySelector('.chama-profile-close').onclick=closeProfile;backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeProfile()});

    let current=own?(ownProfile||readLocal(uid)):readLocal(uid);if(current?.cidade||current?.photoUrl||current?.nome)applyProfile(card,current,own);

    if(own){
      const photoBtn=card.querySelector('#chamaProfilePhotoBtn'),photoInput=card.querySelector('#chamaProfilePhotoInput'),city=card.querySelector('#chamaProfileCityInput'),shop=card.querySelector('#chamaProfileShopInput'),save=card.querySelector('#chamaProfileSave');
      photoBtn.onclick=()=>photoInput.click();photoInput.onchange=()=>{const file=photoInput.files?.[0];if(file)uploadPhoto(file,current,card.querySelector('#chamaProfileAvatar'),photoBtn);photoInput.value=''};
      save.onclick=async()=>{
        const cidade=(city.value||'').trim().replace(/\s+/g,' ');if(!cidade)return alert('Informe sua cidade para concluir o perfil.');if(cidade.length>80)return alert('Digite somente o nome da cidade.');
        const link=cleanProfileLink(shop.value);if(link===null)return alert('Digite um link seguro e válido. Exemplo: https://sualoja.com.br');save.disabled=true;save.textContent='Salvando...';
        try{
          const nome=(me.displayName||me.email?.split('@')[0]||'Usuário').trim();await wait(fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{uid:me.uid,nome,nomeBusca:norm(nome),cidade,cidadeBusca:norm(cidade),chatshopLink:link||'',updatedAt:fs.serverTimestamp()},{merge:true}),5000);
          current={...current,nome,cidade,chatshopLink:link||''};ownProfile=current;writeLocal(me.uid,current);applyProfile(card,current,true);renderRequiredBadge(cidade);save.textContent='Perfil salvo ✓';document.dispatchEvent(new CustomEvent('chama-profile-updated',{detail:{uid:me.uid,cidade,chatshopLink:link||''}}));setTimeout(()=>{if(save.isConnected){save.textContent='Salvar perfil';save.disabled=false}},900);
        }catch(e){alert('Não foi possível salvar o perfil agora. Tente novamente.');save.textContent='Salvar perfil';save.disabled=false}
      };
      return;
    }

    const fresh=await readServer(uid,4500);if(!document.body.contains(card))return;current=fresh;applyProfile(card,current,false);if(!fresh.nome&&!fresh.cidade)card.querySelector('#chamaProfileLoadError').hidden=false;
  }

  function activeChatUid(){
    const direct=document.getElementById('activeChat')?.dataset?.uid||'';if(direct)return direct;
    const email=(document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase();if(!email)return '';
    for(const row of document.querySelectorAll('#usersList .user')){const rowEmail=(row.querySelector('.user-email')?.textContent||'').trim().toLowerCase();if(rowEmail===email&&row.dataset.uid)return row.dataset.uid}return '';
  }

  function installClicks(){
    document.addEventListener('click',e=>{if(e.target.closest?.('#chatName,#chatAvatar')){const uid=activeChatUid();if(uid){e.preventDefault();e.stopPropagation();openProfile(uid)}return}if(e.target.closest?.('#meName')){if(me?.uid){e.preventDefault();e.stopPropagation();openProfile(me.uid)}}},true);
    document.addEventListener('chama-open-my-profile',()=>{if(me?.uid)openProfile(me.uid)});
  }

  async function start(){
    addStyle();installClicks();const authMod=await getFirebase();if(!authMod)return;
    authMod.onAuthStateChanged(auth,u=>{me=u||null;ownProfile=null;document.getElementById('chamaProfileRequiredBadge')?.remove();if(u)syncOwn(u)});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
