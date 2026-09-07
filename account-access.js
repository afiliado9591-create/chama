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
      #chamaUpgradeAccount{color:#795600;background:#fff8df;border-color:#ecd48d}
    `;document.head.appendChild(s)
  }

  function professional(){return admin||type==='profissional'}

  function restrictOwnProfile(){
    const modal=document.getElementById('chamaProfileModal');if(!modal||!modal.querySelector('#chamaProfileSave'))return;
    const restricted=!professional();
    for(const el of [modal.querySelector('.chama-shop-create'),modal.querySelector('#chamaProfileShopArea'),modal.querySelector('label[for="chamaProfileShopInput"]'),modal.querySelector('#chamaProfileShopInput')])if(el)el.style.display=restricted?'none':'';
  }

  function installUpgrade(){
    const old=document.getElementById('chamaUpgradeAccount');if(professional()||!me){old?.remove();return}if(old)return;
    const quick=document.getElementById('chamaQuickMenu');if(!quick)return;
    const b=document.createElement('button');b.id='chamaUpgradeAccount';b.type='button';b.className='chama-quick-item';b.innerHTML='<span>💼</span><span>Profissional</span>';b.title='Migrar para conta profissional';
    b.onclick=upgrade;const finds=quick.querySelector('[data-action="finds"]');if(finds)finds.insertAdjacentElement('afterend',b);else quick.appendChild(b);
  }

  async function upgrade(){
    if(!me||!db||!fs)return alert('Entre novamente no Chama.');
    if(!confirm('Migrar para conta profissional e liberar catálogo, links e ferramentas comerciais?'))return;
    const b=document.getElementById('chamaUpgradeAccount');if(b){b.disabled=true;b.textContent='Ativando conta profissional...'}
    try{await fs.setDoc(fs.doc(db,'users',me.uid),{tipoPerfil:'profissional',professionalSince:fs.serverTimestamp()},{merge:true});type='profissional';apply();alert('Conta profissional ativada ✓')}
    catch(e){console.error(e);if(b){b.disabled=false;b.innerHTML='<span>💼</span><span>Profissional</span>'}alert('Não foi possível migrar a conta agora.')}
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
