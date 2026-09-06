(()=>{
  let adminAllowed=false,adminCheckDone=false,adminCheckPromise=null,customItems=[];
  const DEFAULT_ITEMS=[{type:'external',label:'ChatShop',icon:'🛍️',url:'https://alibr.com.br/',enabled:true,highlight:true}];

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
      .chama-menu-links{display:grid;gap:5px;padding-top:12px;overflow:auto}
      .chama-menu-link{display:flex;align-items:center;gap:12px;width:100%;border:0;background:#fff;color:#1d2b24;text-decoration:none;padding:14px 12px;border-radius:13px;font-size:16px;text-align:left;cursor:pointer}
      .chama-menu-link:active,.chama-menu-link:hover{background:#f0f6f3}
      .chama-menu-link.custom-highlight{background:#e7f7ef;color:#0b7a53;font-weight:900;border:1px solid #cbe9da}
      .chama-menu-link.tutorial{background:#f4f1ff;color:#563a91;font-weight:850;border:1px solid #e2daf7}
      .chama-menu-link.admin{background:#eef3ff;color:#244a9a;font-weight:900;border:1px solid #d8e2ff}
      .chama-menu-link.admin-pages{background:#fff8e8;color:#805100;font-weight:900;border:1px solid #f0ddb0}
      .chama-menu-icon{width:28px;text-align:center;font-size:20px}
      .chama-menu-note{margin-top:auto;padding:14px 10px 4px;color:#738078;font-size:12px;line-height:1.45}
      .chama-auth-privacy{display:block;text-align:center;margin-top:16px;color:#0b7a53;text-decoration:none;font-size:13px;font-weight:700}
      #usersList .user-email,#chatEmail{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function closeMenu(){document.getElementById('chamaMainMenu')?.remove()}
  function safeUrl(v){try{const u=new URL(String(v||''));return u.protocol==='https:'?u.href:''}catch{return ''}}
  function safeSlug(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,48)}
  function normalizeCustom(x={}){
    const type=x.type==='page'?'page':'external',label=String(x.label||'').trim().slice(0,28),icon=String(x.icon||'🔗').trim().slice(0,4)||'🔗';
    return {type,label,icon,url:safeUrl(x.url),slug:safeSlug(x.slug),enabled:x.enabled===true,highlight:x.highlight===true};
  }

  function addLink(links,icon,label,href){
    const a=document.createElement('a');a.className='chama-menu-link';a.href=href;a.innerHTML=`<span class="chama-menu-icon">${icon}</span><span>${label}</span>`;links.appendChild(a);return a;
  }

  function addAction(links,icon,label,onClick){
    const b=document.createElement('button');b.type='button';b.className='chama-menu-link';b.innerHTML=`<span class="chama-menu-icon">${icon}</span><span>${label}</span>`;b.onclick=()=>{closeMenu();onClick()};links.appendChild(b);return b;
  }

  async function waitAdminCheck(){
    const until=Date.now()+1800;
    while(!adminCheckDone&&Date.now()<until){
      if(adminCheckPromise){try{await Promise.race([adminCheckPromise,new Promise(r=>setTimeout(r,180))])}catch{} }
      else await new Promise(r=>setTimeout(r,80));
    }
  }

  async function openMenu(){
    await waitAdminCheck();closeMenu();
    const backdrop=document.createElement('div');backdrop.id='chamaMainMenu';backdrop.className='chama-menu-backdrop';
    const panel=document.createElement('aside');panel.className='chama-menu-panel';panel.setAttribute('aria-label','Menu do Chama');
    const head=document.createElement('div');head.className='chama-menu-head';head.innerHTML='<div class="chama-menu-logo">C</div><div class="chama-menu-head-text"><strong>Chama</strong><small>Menu</small></div>';
    const close=document.createElement('button');close.type='button';close.className='chama-menu-close';close.setAttribute('aria-label','Fechar menu');close.textContent='✕';close.onclick=closeMenu;head.appendChild(close);
    const links=document.createElement('nav');links.className='chama-menu-links';
    addLink(links,'🏠','Início','./');
    addAction(links,'🔥','Fale com o Chama',()=>document.dispatchEvent(new CustomEvent('chama-open-support')));
    addAction(links,'🎁','Indique o Chama',()=>document.dispatchEvent(new CustomEvent('chama-open-referral')));
    addAction(links,'🔥','Achadinhos da Comunidade',()=>document.dispatchEvent(new CustomEvent('chama-open-community-offers')));
    const tutorial=addLink(links,'🎓','Como usar o Chama','./como-usar.html');tutorial.classList.add('tutorial');

    for(const item of customItems){
      if(!item.enabled||!item.label)continue;
      const href=item.type==='page'&&item.slug?`./pagina.html?p=${encodeURIComponent(item.slug)}`:item.url;
      if(!href)continue;const a=addLink(links,item.icon,item.label,href);if(item.highlight)a.classList.add('custom-highlight');if(item.type==='external'){a.target='_blank';a.rel='noopener noreferrer'}
    }

    if(adminAllowed){
      const admin=addLink(links,'🛡️','Painel do Admin','./admin.html');admin.classList.add('admin');
      const pages=addLink(links,'📄','Páginas e Menu','./admin.html#pagesMenuCard');pages.classList.add('admin-pages');
    }
    addLink(links,'🔒','Política de Privacidade','./politica-de-privacidade.html');
    const install=document.getElementById('installBtn');if(install&&!install.classList.contains('hidden'))addAction(links,'📲','Instalar Chama',()=>install.click());
    const note=document.createElement('div');note.className='chama-menu-note';note.textContent=adminAllowed?'Sua conta é administradora. Use “Páginas e Menu” para criar páginas e editar os itens deste menu.':'Use o Chama para conversar, divulgar e acessar suas ferramentas.';
    panel.append(head,links,note);backdrop.appendChild(panel);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeMenu()});document.body.appendChild(backdrop);
  }

  function installTopMenu(){
    if(document.getElementById('chamaMainMenuBtn'))return;const topbar=document.querySelector('.topbar');if(!topbar)return;
    const btn=document.createElement('button');btn.id='chamaMainMenuBtn';btn.type='button';btn.className='chama-main-menu-btn';btn.title='Menu';btn.setAttribute('aria-label','Abrir menu');btn.textContent='☰';
    const logout=document.getElementById('logoutBtn');if(logout)topbar.insertBefore(btn,logout);else topbar.appendChild(btn);btn.onclick=()=>openMenu();
  }

  function installAuthPrivacy(){
    if(document.getElementById('chamaAuthPrivacy'))return;const card=document.querySelector('.auth-card');if(!card)return;
    const a=document.createElement('a');a.id='chamaAuthPrivacy';a.className='chama-auth-privacy';a.href='./politica-de-privacidade.html';a.textContent='Política de Privacidade';card.appendChild(a);
  }

  async function waitForFirebase(attempt=0){
    try{const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');const app=appMod.getApps()[0];if(app)return app;if(attempt>=20)return null;await new Promise(r=>setTimeout(r,100));return waitForFirebase(attempt+1)}catch{return null}
  }

  async function initAdminAccess(){
    const app=await waitForFirebase();if(!app){adminCheckDone=true;customItems=DEFAULT_ITEMS.map(normalizeCustom);return}
    try{
      const [authMod,fs]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      const auth=authMod.getAuth(app),db=fs.getFirestore(app);
      authMod.onAuthStateChanged(auth,user=>{
        adminAllowed=false;adminCheckDone=false;customItems=[];
        adminCheckPromise=(async()=>{
          if(!user){customItems=DEFAULT_ITEMS.map(normalizeCustom);adminCheckDone=true;return}
          try{
            const [userSnap,menuSnap]=await Promise.all([fs.getDoc(fs.doc(db,'users',user.uid)),fs.getDoc(fs.doc(db,'appConfig','customPagesMenu'))]);
            adminAllowed=userSnap.exists()&&userSnap.data().admin===true;
            const source=menuSnap.exists()?(Array.isArray(menuSnap.data()?.items)?menuSnap.data().items:[]):DEFAULT_ITEMS;
            customItems=source.slice(0,5).map(normalizeCustom);
          }catch{adminAllowed=false;customItems=DEFAULT_ITEMS.map(normalizeCustom)}
          finally{adminCheckDone=true}
        })();
      });
    }catch{adminAllowed=false;customItems=DEFAULT_ITEMS.map(normalizeCustom);adminCheckDone=true}
  }

  function start(){addMenuStyles();installTopMenu();installAuthPrivacy();initAdminAccess()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
