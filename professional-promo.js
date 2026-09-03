(()=>{
  const PREFIX='__CHAMA_PROMO__';
  const STYLE_ID='chamaProfessionalPromoStyleV1';
  let me=null,db=null,fs=null,ownProfile=null;
  const profileCache=new Map();

  const cleanText=(v,max)=>String(v||'').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>String(v||'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  function safeHttps(value){
    let v=String(value||'').trim();if(!v)return '';
    if(!/^https?:\/\//i.test(v))v='https://'+v;
    try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}
  }
  function normalizePromo(d={}){
    return {
      title:cleanText(d.title,70),
      description:cleanText(d.description,180),
      imageUrl:safeHttps(d.imageUrl),
      affiliateUrl:safeHttps(d.affiliateUrl),
      pinned:d.pinned===true
    };
  }
  function normalizeProfile(d={}){
    return {profileType:d.profileType==='professional'?'professional':'social',professionalPromo:normalizePromo(d.professionalPromo||{})};
  }
  function promoReady(p){return !!(p?.title&&p?.affiliateUrl)}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-prof-box{margin-top:4px;padding:13px;border:1px solid #dfe8e3;border-radius:15px;background:#fbfcfb;display:grid;gap:10px}
      .chama-prof-title{font-size:13px;font-weight:900;color:#33463d}.chama-prof-types{display:flex;gap:8px}.chama-prof-type{flex:1;border:1px solid #d5ddd9;background:#fff;color:#4c5c54;border-radius:11px;padding:10px 8px;font-weight:850;cursor:pointer}.chama-prof-type.active{background:#eaf6f0;color:#0b7a53;border-color:#b7ddca}.chama-prof-fields{display:grid;gap:8px}.chama-prof-fields[hidden]{display:none!important}.chama-prof-fields input,.chama-prof-fields textarea{width:100%;border:1px solid #cfd8d3;border-radius:12px;padding:11px 12px;font:inherit;outline:none}.chama-prof-fields textarea{min-height:76px;resize:vertical}.chama-prof-fields input:focus,.chama-prof-fields textarea:focus{border-color:#0b7a53}.chama-prof-check{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:800;color:#46574f}.chama-prof-save{border:0;background:#17372b;color:#fff;border-radius:11px;padding:11px 12px;font-weight:900;cursor:pointer}.chama-prof-save:disabled{opacity:.65}.chama-prof-note{font-size:11px;color:#77837c;line-height:1.4}.chama-prof-msg{min-height:16px;font-size:12px;color:#0b7a53;font-weight:850}
      .chama-promo-send-btn{border:0;background:#fff5df;color:#986000;width:42px;height:42px;border-radius:50%;font-size:19px;display:grid;place-items:center;cursor:pointer;flex:0 0 42px}.chama-promo-send-btn:active{background:#ffedc4}
      .chama-pinned-promo{margin:8px 12px 0;border:1px solid #efcf8c;background:#fffaf0;border-radius:16px;padding:10px;display:grid;grid-template-columns:64px 1fr;gap:10px;box-shadow:0 3px 12px #5b3a0010}.chama-pinned-promo img{width:64px;height:64px;object-fit:cover;border-radius:12px;background:#eee}.chama-pinned-promo .body{min-width:0}.chama-pinned-promo .flag{font-size:10px;font-weight:900;color:#9a5b00}.chama-pinned-promo strong{display:block;font-size:14px;color:#2b342f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:2px 0}.chama-pinned-promo p{font-size:12px;color:#66736d;margin:0 0 7px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.chama-pinned-promo a{display:inline-flex;text-decoration:none;background:#0b7a53;color:#fff;border-radius:9px;padding:7px 10px;font-size:12px;font-weight:900}
      .chama-promo-card{width:min(300px,72vw);border:1px solid #ead39f;background:#fffdf7;border-radius:14px;overflow:hidden}.chama-promo-card img{width:100%;height:150px;object-fit:cover;background:#eee;display:block}.chama-promo-card-body{padding:10px}.chama-promo-card .tag{font-size:10px;font-weight:900;color:#9a5b00}.chama-promo-card strong{display:block;font-size:15px;margin:3px 0;color:#26342d}.chama-promo-card p{font-size:12px;color:#66736d;margin:0 0 9px;line-height:1.35}.chama-promo-card a{display:flex;justify-content:center;text-decoration:none;background:#0b7a53;color:#fff;border-radius:10px;padding:9px 10px;font-size:13px;font-weight:900}
    `;document.head.appendChild(s);
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async u=>{
        me=u||null;ownProfile=null;profileCache.clear();removeSendButton();
        if(!u)return;
        ownProfile=await readProfile(u.uid);installSendButton();
      });
    }catch(e){console.warn('Chama: perfil profissional não iniciou',e)}
  }

  async function readProfile(uid,force=false){
    if(!uid||!db||!fs)return normalizeProfile({});
    if(!force&&profileCache.has(uid))return profileCache.get(uid);
    try{const snap=await fs.getDoc(fs.doc(db,'publicProfiles',uid));const p=normalizeProfile(snap.exists()?snap.data()||{}:{});profileCache.set(uid,p);return p}catch{return normalizeProfile({})}
  }

  function setType(box,type){
    const professional=type==='professional';box.dataset.type=professional?'professional':'social';
    box.querySelectorAll('.chama-prof-type').forEach(b=>b.classList.toggle('active',b.dataset.type===box.dataset.type));
    const fields=box.querySelector('.chama-prof-fields');if(fields)fields.hidden=!professional;
  }

  async function injectEditor(){
    const modal=document.getElementById('chamaProfileModal');
    if(!me||!modal||!modal.querySelector('#chamaProfilePhotoBtn')||modal.querySelector('#chamaProfessionalPromoBox'))return;
    const edit=modal.querySelector('.chama-profile-edit'),saveProfile=modal.querySelector('#chamaProfileSave');if(!edit||!saveProfile)return;
    const p=await readProfile(me.uid,true);ownProfile=p;
    const promo=p.professionalPromo;
    const box=document.createElement('div');box.id='chamaProfessionalPromoBox';box.className='chama-prof-box';
    box.innerHTML=`<div class="chama-prof-title">Tipo de perfil e promoção</div><div class="chama-prof-types"><button type="button" class="chama-prof-type" data-type="social">👤 Social</button><button type="button" class="chama-prof-type" data-type="professional">💼 Profissional</button></div><div class="chama-prof-fields"><input class="chama-prof-promo-title" maxlength="70" placeholder="Título do produto ou promoção" value="${esc(promo.title)}"><textarea class="chama-prof-promo-description" maxlength="180" placeholder="Descrição curta da promoção">${esc(promo.description)}</textarea><input class="chama-prof-promo-image" maxlength="900" placeholder="Link https:// da imagem" value="${esc(promo.imageUrl)}"><input class="chama-prof-promo-link" maxlength="900" placeholder="Link de afiliado: Mercado Livre, Shopee, etc." value="${esc(promo.affiliateUrl)}"><label class="chama-prof-check"><input class="chama-prof-promo-pinned" type="checkbox" ${promo.pinned?'checked':''}> 📌 Mostrar esta promoção fixa quando alguém abrir meu chat</label><div class="chama-prof-note">O link pode ser de qualquer site, desde que use https://. A imagem também é carregada pelo link informado.</div><button type="button" class="chama-prof-save">Salvar perfil profissional</button><div class="chama-prof-msg"></div></div>`;
    edit.insertBefore(box,saveProfile);setType(box,p.profileType);
    box.querySelectorAll('.chama-prof-type').forEach(btn=>btn.onclick=()=>setType(box,btn.dataset.type));
    box.querySelector('.chama-prof-save').onclick=async()=>{
      const type=box.dataset.type==='professional'?'professional':'social';
      const fields={
        title:cleanText(box.querySelector('.chama-prof-promo-title').value,70),
        description:cleanText(box.querySelector('.chama-prof-promo-description').value,180),
        imageUrl:safeHttps(box.querySelector('.chama-prof-promo-image').value),
        affiliateUrl:safeHttps(box.querySelector('.chama-prof-promo-link').value),
        pinned:!!box.querySelector('.chama-prof-promo-pinned').checked
      };
      if(type==='professional'&&(!fields.title||!fields.affiliateUrl))return alert('No perfil profissional, informe pelo menos o título e o link do produto.');
      if(type==='professional'&&box.querySelector('.chama-prof-promo-link').value.trim()&&!fields.affiliateUrl)return alert('Use um link seguro começando com https://');
      if(box.querySelector('.chama-prof-promo-image').value.trim()&&!fields.imageUrl)return alert('O link da imagem precisa começar com https://');
      const btn=box.querySelector('.chama-prof-save'),msg=box.querySelector('.chama-prof-msg');btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
      try{
        await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{profileType:type,professionalPromo:fields,professionalPromoUpdatedAt:fs.serverTimestamp()},{merge:true});
        ownProfile={profileType:type,professionalPromo:fields};profileCache.set(me.uid,ownProfile);msg.textContent=type==='professional'?'Perfil profissional salvo ✓':'Perfil social salvo ✓';installSendButton();
      }catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}
      finally{btn.disabled=false;btn.textContent='Salvar perfil profissional'}
    };
  }

  function scheduleEditor(){setTimeout(injectEditor,60);setTimeout(injectEditor,220);setTimeout(injectEditor,500)}

  function removeSendButton(){document.getElementById('chamaPromoSendBtn')?.remove()}
  function installSendButton(){
    removeSendButton();if(!me||ownProfile?.profileType!=='professional'||!promoReady(ownProfile.professionalPromo))return;
    const composer=document.getElementById('composer'),input=document.getElementById('messageInput');if(!composer||!input)return;
    const btn=document.createElement('button');btn.id='chamaPromoSendBtn';btn.type='button';btn.className='chama-promo-send-btn';btn.title='Enviar minha promoção';btn.setAttribute('aria-label','Enviar minha promoção');btn.textContent='🏷️';
    composer.insertBefore(btn,input);btn.onclick=sendOwnPromo;
  }

  async function sendOwnPromo(){
    if(!me||ownProfile?.profileType!=='professional'||!promoReady(ownProfile.professionalPromo))return alert('Salve sua promoção no perfil profissional primeiro.');
    const otherUid=document.getElementById('activeChat')?.dataset?.uid||'';if(!otherUid)return alert('Abra uma conversa antes de enviar sua promoção.');
    const title=ownProfile.professionalPromo.title;if(!confirm(`Enviar a promoção “${title}” para esta pessoa?`))return;
    try{
      const ids=[me.uid,otherUid].sort(),chatId=ids.join('_'),text=PREFIX+JSON.stringify(ownProfile.professionalPromo);
      await fs.addDoc(fs.collection(db,'chats',chatId,'messages'),{text,senderId:me.uid,receiverId:otherUid,createdAt:fs.serverTimestamp()});
      await fs.setDoc(fs.doc(db,'chats',chatId),{participants:ids,lastMessage:'🏷️ Promoção',lastSenderId:me.uid,updatedAt:fs.serverTimestamp(),unreadCounts:{[otherUid]:fs.increment(1),[me.uid]:0}},{merge:true});
    }catch(e){console.error(e);alert('Não foi possível enviar a promoção agora.')}
  }

  function rawText(b){
    let out='';for(const n of b.childNodes){if(n.nodeType===Node.TEXT_NODE)out+=n.nodeValue||'';else if(n.nodeType===Node.ELEMENT_NODE&&!n.classList.contains('time')&&!n.classList.contains('chama-msg-menu-btn'))out+=n.textContent||''}return out.trim();
  }
  function buildCard(p,compact=false){
    const promo=normalizePromo(p);const root=document.createElement('div');root.className=compact?'chama-pinned-promo':'chama-promo-card';
    if(compact){
      if(promo.imageUrl){const img=document.createElement('img');img.src=promo.imageUrl;img.alt='Promoção';img.loading='lazy';img.onerror=()=>img.remove();root.appendChild(img)}
      const body=document.createElement('div');body.className='body';body.innerHTML=`<span class="flag">📌 OFERTA FIXA</span><strong>${esc(promo.title)}</strong>${promo.description?`<p>${esc(promo.description)}</p>`:''}<a href="${esc(promo.affiliateUrl)}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta</a>`;root.appendChild(body);return root;
    }
    if(promo.imageUrl){const img=document.createElement('img');img.src=promo.imageUrl;img.alt='Produto';img.loading='lazy';img.onerror=()=>img.remove();root.appendChild(img)}
    const body=document.createElement('div');body.className='chama-promo-card-body';body.innerHTML=`<span class="tag">🏷️ PROMOÇÃO</span><strong>${esc(promo.title)}</strong>${promo.description?`<p>${esc(promo.description)}</p>`:''}<a href="${esc(promo.affiliateUrl)}" target="_blank" rel="noopener noreferrer sponsored">Ver produto</a>`;root.appendChild(body);return root;
  }
  function renderPromoBubble(b){
    if(!b||b.dataset.chamaPromoReady==='1')return;const raw=rawText(b);if(!raw.startsWith(PREFIX))return;
    let p;try{p=normalizePromo(JSON.parse(raw.slice(PREFIX.length)))}catch{return}if(!promoReady(p))return;
    const time=b.querySelector('.time')?.cloneNode(true);b.textContent='';b.appendChild(buildCard(p,false));if(time)b.appendChild(time);b.dataset.chamaPromoReady='1';b.dataset.linksReady='1';
  }
  function scanPromoBubbles(){document.querySelectorAll('#messages .bubble').forEach(renderPromoBubble)}

  async function showPinned(detail={}){
    document.getElementById('chamaPinnedProfessionalPromo')?.remove();
    const uid=String(detail.uid||'');if(!uid)return;
    const p=await readProfile(uid,true);if(p.profileType!=='professional'||!p.professionalPromo.pinned||!promoReady(p.professionalPromo))return;
    const active=document.getElementById('activeChat');if(!active||active.dataset.uid!==uid)return;
    const head=active.querySelector('.chat-head');if(!head)return;const card=buildCard(p.professionalPromo,true);card.id='chamaPinnedProfessionalPromo';head.insertAdjacentElement('afterend',card);
  }

  function start(){
    addStyle();initFirebase();
    document.addEventListener('click',e=>{if(e.target.closest?.('#meName,#chamaMeAvatar,#chamaProfileRequiredBadge'))scheduleEditor()},true);
    document.addEventListener('chama-open-my-profile',scheduleEditor);
    document.addEventListener('chama-chat-opened',e=>showPinned(e.detail||{}));
    const messages=document.getElementById('messages');if(messages)new MutationObserver(()=>setTimeout(scanPromoBubbles,0)).observe(messages,{childList:true,subtree:true});
    setTimeout(()=>{installSendButton();scanPromoBubbles()},1000);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();