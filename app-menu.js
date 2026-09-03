(()=>{
  let adminAllowed=false;

  function addMenuStyles(){
    if(document.getElementById('chamaAppMenuStyle'))return;
    const s=document.createElement('style');
    s.id='chamaAppMenuStyle';
    s.textContent=`
      .chama-main-menu-btn{border:0;background:#ffffff18;color:#fff;width:42px;height:42px;border-radius:12px;font-size:23px;display:grid;place-items:center;cursor:pointer;flex:0 0 42px;padding:0}
      .chama-main-menu-btn:active{background:#ffffff2b}
      .chama-menu-backdrop{position:fixed;inset:0;background:#0006;z-index:2000;display:flex;justify-content:flex-end}
      .chama-menu-panel{width:min(330px,88vw);height:100%;background:#fff;box-shadow:-12px 0 35px #0003;padding:max(18px,env(safe-area-inset-top)) 14px max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column}
      .chama-menu-head{display:flex;align-items:center;gap:10px;padding:6px 6px 18px;border-bottom:1px solid #e8ecea}
      .chama-menu-logo{width:42px;height:42px;border-radius:14px;background:#0b7a53;color:#fff;display:grid;place-items:center;font-weight:900;font-size:22px}
      .chama-menu-head-text{flex:1;min-width:0}.chama-menu-head-text strong{display:block;font-size:18px;color:#14221c}.chama-menu-head-text small{color:#65736c}
      .chama-menu-close{border:0;background:#eef4f1;color:#0b7a53;width:38px;height:38px;border-radius:12px;font-size:20px;cursor:pointer}
      .chama-menu-links{display:grid;gap:5px;padding-top:12px}
      .chama-menu-link{display:flex;align-items:center;gap:12px;width:100%;border:0;background:#fff;color:#1d2b24;text-decoration:none;padding:14px 12px;border-radius:13px;font-size:16px;text-align:left;cursor:pointer}
      .chama-menu-link:active,.chama-menu-link:hover{background:#f0f6f3}
      .chama-menu-link.sell{background:#e7f7ef;color:#0b7a53;font-weight:900;border:1px solid #cbe9da}
      .chama-menu-icon{width:28px;text-align:center;font-size:20px}
      .chama-menu-note{margin-top:auto;padding:14px 10px 4px;color:#738078;font-size:12px;line-height:1.45}
      .chama-auth-privacy{display:block;text-align:center;margin-top:16px;color:#0b7a53;text-decoration:none;font-size:13px;font-weight:700}
      #usersList .user-email,#chatEmail{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function closeMenu(){document.getElementById('chamaMainMenu')?.remove()}

  function addLink(links,icon,label,href){
    const a=document.createElement('a');
    a.className='chama-menu-link';a.href=href;a.innerHTML=`<span class="chama-menu-icon">${icon}</span><span>${label}</span>`;
    links.appendChild(a);return a;
  }

  function addAction(links,icon,label,onClick){
    const b=document.createElement('button');b.type='button';b.className='chama-menu-link';
    b.innerHTML=`<span class="chama-menu-icon">${icon}</span><span>${label}</span>`;
    b.onclick=()=>{closeMenu();onClick()};links.appendChild(b);return b;
  }

  function openMenu(){
    closeMenu();
    const backdrop=document.createElement('div');backdrop.id='chamaMainMenu';backdrop.className='chama-menu-backdrop';
    const panel=document.createElement('aside');panel.className='chama-menu-panel';panel.setAttribute('aria-label','Menu do Chama');
    const head=document.createElement('div');head.className='chama-menu-head';head.innerHTML='<div class="chama-menu-logo">C</div><div class="chama-menu-head-text"><strong>Chama</strong><small>Menu</small></div>';
    const close=document.createElement('button');close.type='button';close.className='chama-menu-close';close.setAttribute('aria-label','Fechar menu');close.textContent='✕';close.onclick=closeMenu;head.appendChild(close);
    const links=document.createElement('nav');links.className='chama-menu-links';
    addLink(links,'🏠','Início','./');
    addAction(links,'🎁','Indique o Chama',()=>document.dispatchEvent(new CustomEvent('chama-open-referral')));
    const sell=addLink(links,'🛍️','Venda seu produto','https://alibr.com.br/');sell.classList.add('sell');sell.target='_blank';sell.rel='noopener noreferrer';
    if(adminAllowed)addLink(links,'🛡️','Painel do Admin','./admin.html');
    addLink(links,'🔒','Política de Privacidade','./politica-de-privacidade.html');

    const install=document.getElementById('installBtn');
    if(install&&!install.classList.contains('hidden')){
      addAction(links,'📲','Instalar Chama',()=>install.click());
    }

    const note=document.createElement('div');note.className='chama-menu-note';note.textContent=adminAllowed?'O painel do administrador é exibido somente para contas marcadas como admin.':'Crie sua vitrine no ChatShop e depois cole o link no seu perfil do Chama.';
    panel.append(head,links,note);backdrop.appendChild(panel);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeMenu()});document.body.appendChild(backdrop);
  }

  function installTopMenu(){
    if(document.getElementById('chamaMainMenuBtn'))return;const topbar=document.querySelector('.topbar');if(!topbar)return;
    const btn=document.createElement('button');btn.id='chamaMainMenuBtn';btn.type='button';btn.className='chama-main-menu-btn';btn.title='Menu';btn.setAttribute('aria-label','Abrir menu');btn.textContent='☰';
    const logout=document.getElementById('logoutBtn');if(logout)topbar.insertBefore(btn,logout);else topbar.appendChild(btn);btn.onclick=openMenu;
  }

  function installAuthPrivacy(){
    if(document.getElementById('chamaAuthPrivacy'))return;const card=document.querySelector('.auth-card');if(!card)return;
    const a=document.createElement('a');a.id='chamaAuthPrivacy';a.className='chama-auth-privacy';a.href='./politica-de-privacidade.html';a.textContent='Política de Privacidade';card.appendChild(a);
  }

  async function waitForFirebase(attempt=0){
    try{const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');const app=appMod.getApps()[0];if(app)return app;if(attempt>=20)return null;await new Promise(r=>setTimeout(r,100));return waitForFirebase(attempt+1)}catch{return null}
  }

  async function initAdminAccess(){
    const app=await waitForFirebase();if(!app)return;
    try{
      const [authMod,fs]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      const auth=authMod.getAuth(app),db=fs.getFirestore(app);
      authMod.onAuthStateChanged(auth,async user=>{adminAllowed=false;if(!user)return;try{const snap=await fs.getDoc(fs.doc(db,'users',user.uid));adminAllowed=snap.exists()&&snap.data().admin===true}catch{adminAllowed=false}});
    }catch{adminAllowed=false}
  }

  function start(){addMenuStyles();installTopMenu();installAuthPrivacy();initAdminAccess()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();