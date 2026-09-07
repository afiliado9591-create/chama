(()=>{
  const STYLE_ID='chamaAccountAccessStyleV1';
  let me=null,db=null,fs=null,type='social',admin=false;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      body[data-profile-type="social"] #chamaAffiliateToolsEntry,
      body[data-profile-type="social"] #chamaAffiliateToolsModal,
      body[data-profile-type="social"] #chamaAffiliateMenu,
      body[data-profile-type="social"] #chamaChatShopPromo,
      body[data-profile-type="social"] #chamaQuickMenu [data-action="tools"],
      body[data-profile-type="social"] #chamaQuickMenu .chatshop,
      body[data-profile-type="social"] [data-professional-only="true"],
      body[data-profile-type="social"] .chama-community-editor,
      body[data-profile-type="social"] .chama-affcat-edit{display:none!important}
      body[data-profile-type="profissional"] #chamaQuickMenu [data-action="finds"]{display:none!important}
      .chama-upgrade-entry{margin:9px 12px;border:1px solid #ecd48d;background:#fff8df;color:#684c00;border-radius:14px;padding:11px 12px;display:flex;align-items:center;gap:9px;font-weight:900;cursor:pointer;width:calc(100% - 24px);text-align:left}
      .chama-upgrade-entry span{font-size:20px}.chama-upgrade-entry small{display:block;font-size:11px;font-weight:600;color:#7a681f;margin-top:2px}
    `;document.head.appendChild(s)
  }

  function professional(){return admin||type==='profissional'}

  function restrictOwnProfile(){
    const modal=document.getElementById('chamaProfileModal');if(!modal||!modal.querySelector('#chamaProfileSave'))return;
    const restricted=!professional();
    for(const el of [modal.querySelector('.chama-shop-create'),modal.querySelector('#chamaProfileShopArea'),modal.querySelector('label[for="chamaProfileShopInput"]'),modal.querySelector('#chamaProfileShopInput')])if(el)el.style.display=restricted?'none':'';
  }

  function installUpgrade(){
    document.getElementById('chamaUpgradeAccount')?.remove();if(professional()||!me)return;
    const sidebar=document.querySelector('.sidebar'),quick=document.getElementById('chamaQuickMenu');if(!sidebar)return;
    const b=document.createElement('button');b.id='chamaUpgradeAccount';b.type='button';b.className='chama-upgrade-entry';b.innerHTML='<span>💼</span><span>Migrar para conta profissional<small>Libere catálogo, links e ferramentas comerciais</small></span>';
    b.onclick=upgrade;(quick||sidebar.firstElementChild)?.insertAdjacentElement('afterend',b);
  }

  async function upgrade(){
    if(!me||!db||!fs)return alert('Entre novamente no Chama.');
    if(!confirm('Migrar para conta profissional e liberar catálogo, links e ferramentas comerciais?'))return;
    const b=document.getElementById('chamaUpgradeAccount');if(b){b.disabled=true;b.textContent='Ativando conta profissional...'}
    try{await fs.setDoc(fs.doc(db,'users',me.uid),{tipoPerfil:'profissional',professionalSince:fs.serverTimestamp()},{merge:true});type='profissional';apply();alert('Conta profissional ativada ✓')}
    catch(e){console.error(e);if(b){b.disabled=false;b.innerHTML='<span>💼</span><span>Migrar para conta profissional<small>Libere catálogo, links e ferramentas comerciais</small></span>'}alert('Não foi possível migrar a conta agora.')}
  }

  function apply(){
    const effective=professional()?'profissional':'social';document.body.dataset.profileType=effective;window.__chamaProfileType=effective;
    installUpgrade();restrictOwnProfile();document.dispatchEvent(new CustomEvent('chama-profile-type',{detail:{type:effective}}));
  }

  async function init(){
    addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{me=user||null;type='social';admin=false;if(user){try{const snap=await fs.getDoc(fs.doc(db,'users',user.uid)),d=snap.exists()?snap.data()||{}:{};type=d.tipoPerfil==='profissional'?'profissional':'social';admin=d.admin===true}catch(_){}}apply()});
    }catch(e){console.warn('Chama: controle de acesso não iniciou',e)}
    new MutationObserver(()=>{installUpgrade();restrictOwnProfile()}).observe(document.body,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
