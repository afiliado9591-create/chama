(()=>{
  const STYLE_ID='chamaProfileHomeMessageStyleV1';
  const CACHE_PREFIX='chama_home_message_v1_';
  let me=null,db=null,fs=null,loadedUid='',cached={type:'social',text:''};

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-home-message-box{margin-top:4px;padding:12px;border:1px solid #dfe8e3;border-radius:14px;background:#fafcfb;display:grid;gap:8px}
      .chama-home-message-title{font-size:13px;font-weight:900;color:#405048}
      .chama-home-message-options{display:flex;gap:8px}
      .chama-home-message-type{flex:1;border:1px solid #d4ddd8;background:#fff;color:#405048;border-radius:11px;padding:10px 8px;font-weight:800;cursor:pointer}
      .chama-home-message-type.active[data-type="social"]{background:#eaf6f0;border-color:#b9dfcd;color:#0b7a53}
      .chama-home-message-type.active[data-type="commercial"]{background:#fff5df;border-color:#efcf8c;color:#8a5600}
      .chama-home-message-input{width:100%!important;border:1px solid #cfd8d3!important;border-radius:12px!important;padding:11px 12px!important;outline:none}
      .chama-home-message-save{border:0;background:#17372b;color:#fff;border-radius:11px;padding:10px 12px;font-weight:850;cursor:pointer}
      .chama-home-message-save:disabled{opacity:.65}
      .chama-home-message-help{font-size:11px;color:#78837d;line-height:1.4}
      .chama-home-message-msg{font-size:12px;color:#0b7a53;font-weight:800;min-height:16px}
    `;document.head.appendChild(s);
  }

  function cleanType(v){return v==='commercial'?'commercial':'social'}
  function cleanText(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,70)}
  function readLocal(uid){
    try{const d=JSON.parse(localStorage.getItem(CACHE_PREFIX+uid)||'{}');return {type:cleanType(d.type),text:cleanText(d.text)}}catch{return {type:'social',text:''}}
  }
  function writeLocal(uid,data){try{localStorage.setItem(CACHE_PREFIX+uid,JSON.stringify({type:cleanType(data.type),text:cleanText(data.text)}))}catch(_){}}

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
      authMod.onAuthStateChanged(auth,u=>{me=u||null;loadedUid='';cached=u?readLocal(u.uid):{type:'social',text:''}});
    }catch(e){console.warn('Chama: mensagem da home não iniciou',e)}
  }

  function setActive(box,type){
    box.querySelectorAll('.chama-home-message-type').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  }

  async function loadServer(box){
    if(!me||!db||!fs||loadedUid===me.uid)return;
    loadedUid=me.uid;
    try{
      const snap=await fs.getDoc(fs.doc(db,'publicProfiles',me.uid));
      if(snap.exists()){
        const d=snap.data()||{};cached={type:cleanType(d.homeMessageType),text:cleanText(d.homeMessage)};writeLocal(me.uid,cached);
        const input=box.querySelector('.chama-home-message-input');if(input)input.value=cached.text;setActive(box,cached.type);
      }
    }catch(e){console.warn('Chama: não foi possível carregar a mensagem da home',e)}
  }

  function inject(){
    if(!me)return;
    const modal=document.getElementById('chamaProfileModal');if(!modal||!modal.querySelector('#chamaProfilePhotoBtn'))return;
    const edit=modal.querySelector('.chama-profile-edit'),saveProfile=modal.querySelector('#chamaProfileSave');
    if(!edit||!saveProfile||modal.querySelector('#chamaHomeMessageBox'))return;

    const box=document.createElement('div');box.id='chamaHomeMessageBox';box.className='chama-home-message-box';
    cached=readLocal(me.uid);
    box.innerHTML=`<div class="chama-home-message-title">Mensagem abaixo do seu nome na home</div><div class="chama-home-message-options"><button type="button" class="chama-home-message-type" data-type="social">💬 Social</button><button type="button" class="chama-home-message-type" data-type="commercial">🛍️ Comercial</button></div><input class="chama-home-message-input" maxlength="70" placeholder="Ex.: Bom dia! Deus abençoe 🙏" value=""><div class="chama-home-message-help">Social: recado pessoal. Comercial: promoção, serviço ou divulgação. Deixe vazio para não exibir mensagem.</div><button type="button" class="chama-home-message-save">Salvar mensagem da home</button><div class="chama-home-message-msg"></div>`;
    edit.insertBefore(box,saveProfile);
    const input=box.querySelector('.chama-home-message-input');input.value=cached.text;setActive(box,cached.type);
    box.querySelectorAll('.chama-home-message-type').forEach(btn=>btn.onclick=()=>{cached.type=cleanType(btn.dataset.type);setActive(box,cached.type);input.placeholder=cached.type==='commercial'?'Ex.: 🛍️ Ofertas novas na minha vitrine':'Ex.: Bom dia! Deus abençoe 🙏'});
    const save=box.querySelector('.chama-home-message-save'),msg=box.querySelector('.chama-home-message-msg');
    save.onclick=async()=>{
      if(!me||!db||!fs)return;
      const type=cleanType(cached.type),text=cleanText(input.value);save.disabled=true;save.textContent='Salvando...';msg.textContent='';
      try{
        await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{homeMessageType:type,homeMessage:text,homeMessageUpdatedAt:fs.serverTimestamp()},{merge:true});
        cached={type,text};writeLocal(me.uid,cached);msg.textContent=text?'Mensagem salva ✓':'Mensagem removida ✓';
        document.dispatchEvent(new CustomEvent('chama-profile-message-updated',{detail:{uid:me.uid,type,text}}));
      }catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}
      finally{save.disabled=false;save.textContent='Salvar mensagem da home'}
    };
    loadServer(box);
  }

  function scheduleInject(){setTimeout(inject,0);setTimeout(inject,120);setTimeout(inject,350)}

  function start(){
    addStyle();initFirebase();
    document.addEventListener('chama-open-my-profile',scheduleInject);
    document.addEventListener('click',e=>{if(e.target.closest?.('#meName,#chamaMeAvatar,#chamaProfileRequiredBadge'))scheduleInject()},true);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();