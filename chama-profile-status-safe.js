(()=>{
  if(window.__CHAMA_PROFILE_STATUS_SAFE__) return;
  window.__CHAMA_PROFILE_STATUS_SAFE__=true;

  const STYLE_ID='chamaProfileStatusSafeStyle';
  let db=null,fs=null,auth=null,me=null;

  const wait=(p,ms=5000)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  function style(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #meName{cursor:pointer}
      .chama-ps-modal{position:fixed;inset:0;background:#0008;z-index:5000;display:grid;place-items:center;padding:16px}
      .chama-ps-card{width:min(420px,100%);max-height:90dvh;overflow:auto;background:#fff;border-radius:22px;box-shadow:0 20px 70px #0005}
      .chama-ps-head{background:#0b7a53;color:#fff;padding:20px;display:flex;align-items:center;gap:12px}
      .chama-ps-head strong{font-size:20px;flex:1}.chama-ps-close{border:0;background:#ffffff22;color:#fff;border-radius:10px;width:38px;height:38px;font-size:18px;cursor:pointer}
      .chama-ps-body{padding:20px}.chama-ps-field{display:grid;gap:6px;margin-bottom:13px}.chama-ps-field label{font-size:13px;font-weight:800;color:#42534a}.chama-ps-field input,.chama-ps-field textarea{width:100%;box-sizing:border-box;border:1px solid #ccd7d1;border-radius:12px;padding:12px;outline:none;font:inherit}.chama-ps-field textarea{min-height:80px;resize:vertical}.chama-ps-field input:focus,.chama-ps-field textarea:focus{border-color:#0b7a53}.chama-ps-save{width:100%;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:13px;font-weight:900;cursor:pointer}.chama-ps-save:disabled{opacity:.6}.chama-ps-status{font-size:12px;color:#66756d;margin-top:10px;min-height:16px}
      .chama-status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#24a148;margin-left:6px;vertical-align:middle}
    `;document.head.appendChild(s);
  }

  async function firebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      const app=appMod.getApps()[0]; if(!app) return false;
      const [am,fm]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      auth=am.getAuth(app);db=fm.getFirestore(app);fs=fm;
      am.onAuthStateChanged(auth,u=>{me=u||null; if(u) refreshUser(u)});
      return true;
    }catch(e){console.warn('Chama perfil/status:',e);return false}
  }

  async function refreshUser(u){
    if(!db||!fs||!u)return;
    try{
      const snap=await wait(fs.getDoc(fs.doc(db,'users',u.uid)),4500);
      const d=snap.exists()?snap.data():{};
      window.__chamaPsUser=d;
      const name=document.getElementById('meName');
      if(name && !name.dataset.psBound){name.dataset.psBound='1';name.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openProfile()});}
    }catch(_){ }
  }

  function close(){document.getElementById('chamaPsModal')?.remove()}

  async function openProfile(){
    if(!me||!db||!fs)return;
    close();
    let d=window.__chamaPsUser||{};
    try{const snap=await wait(fs.getDoc(fs.doc(db,'users',me.uid)),4500);if(snap.exists())d=snap.data();window.__chamaPsUser=d}catch(_){ }
    const name=d.nome||me.displayName||me.email?.split('@')[0]||'Usuário';
    const city=d.cidade||'';
    const status=d.statusTexto||d.status||'';
    const card=document.createElement('div');card.className='chama-ps-card';
    card.innerHTML=`<div class="chama-ps-head"><strong>Meu perfil</strong><button class="chama-ps-close" type="button">✕</button></div><div class="chama-ps-body"><div class="chama-ps-field"><label>Nome</label><input id="chamaPsName" maxlength="80" value="${esc(name)}"></div><div class="chama-ps-field"><label>Cidade</label><input id="chamaPsCity" maxlength="80" placeholder="Ex.: São Paulo" value="${esc(city)}"></div><div class="chama-ps-field"><label>Status</label><textarea id="chamaPsStatus" maxlength="180" placeholder="O que você está fazendo?">${esc(status)}</textarea></div><button id="chamaPsSave" class="chama-ps-save" type="button">Salvar perfil</button><div id="chamaPsMsg" class="chama-ps-status"></div></div>`;
    const modal=document.createElement('div');modal.id='chamaPsModal';modal.className='chama-ps-modal';modal.appendChild(card);document.body.appendChild(modal);
    card.querySelector('.chama-ps-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});
    card.querySelector('#chamaPsSave').onclick=async()=>{
      const btn=card.querySelector('#chamaPsSave'),msg=card.querySelector('#chamaPsMsg');
      const nome=card.querySelector('#chamaPsName').value.trim().replace(/\s+/g,' '),cidade=card.querySelector('#chamaPsCity').value.trim().replace(/\s+/g,' '),statusTexto=card.querySelector('#chamaPsStatus').value.trim();
      if(!nome)return msg.textContent='Informe seu nome.';
      if(!cidade)return msg.textContent='Informe sua cidade.';
      btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
      try{
        const data={uid:me.uid,nome,cidade,statusTexto,statusUpdatedAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()};
        await wait(fs.setDoc(fs.doc(db,'users',me.uid),data,{merge:true}),5000);
        await wait(fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{uid:me.uid,nome,cidade,statusTexto,statusUpdatedAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()},{merge:true}),5000);
        window.__chamaPsUser={...(window.__chamaPsUser||{}),...data,nome,cidade,statusTexto};
        const top=document.getElementById('meName');if(top)top.textContent=nome;
        msg.textContent='Perfil salvo com sucesso.';btn.textContent='Salvo ✓';
        setTimeout(close,700);
      }catch(e){console.error(e);msg.textContent='Não foi possível salvar agora. Tente novamente.';btn.disabled=false;btn.textContent='Salvar perfil'}
    };
  }

  function boot(){style();firebase();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();