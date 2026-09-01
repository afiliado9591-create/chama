(()=>{
function install(){
  let s=document.getElementById('mobileTopbarFixStyle');
  if(!s){s=document.createElement('style');s.id='mobileTopbarFixStyle';document.head.appendChild(s)}
  s.textContent=`
    .chama-mobile-menu-btn,.chama-mobile-menu{display:none}
    @media(max-width:700px){
      #appView{max-width:100vw!important;overflow-x:hidden!important}
      .topbar{position:relative!important;display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:8px!important;padding:10px 12px!important;height:64px!important;min-height:64px!important;overflow:visible!important}
      .topbar>#notifBtn,.topbar>[id*="notif"],.topbar>#bizTopBtn,.topbar>#offersTopBtn,.topbar>#adminBtn,.topbar>#aboutBtn,.topbar>#privacyBtn,.topbar>#logoutBtn{display:none!important}
      .chama-mobile-menu-btn{display:flex!important;margin-left:auto!important;flex:0 0 44px!important;width:44px!important;height:44px!important;align-items:center!important;justify-content:center!important;border:1px solid #ffffff55!important;border-radius:13px!important;background:#ffffff18!important;color:#fff!important;font-size:25px!important;font-weight:900!important;padding:0!important;cursor:pointer!important}
      .chama-mobile-menu{display:none;position:fixed;top:68px;right:10px;z-index:1000;width:min(280px,calc(100vw - 20px));background:#fff;border:1px solid #dde6e1;border-radius:16px;box-shadow:0 12px 35px #0003;padding:8px;overflow:hidden}
      .chama-mobile-menu.open{display:block!important}
      .chama-mobile-menu button{display:flex!important;width:100%!important;align-items:center!important;gap:10px!important;border:0!important;background:#fff!important;color:#173f33!important;padding:13px 14px!important;border-radius:11px!important;text-align:left!important;font-size:15px!important;font-weight:800!important;cursor:pointer!important}
      .chama-mobile-menu button:active{background:#eef5f1!important}
      .chama-mobile-menu .menu-sep{height:1px;background:#edf1ef;margin:5px 4px}
      .chama-mobile-menu .menu-logout{color:#a52b2b!important}
    }`;

  const top=document.querySelector('.topbar');
  if(!top)return;
  let btn=document.getElementById('chamaMobileMenuBtn');
  if(!btn){
    btn=document.createElement('button');
    btn.id='chamaMobileMenuBtn';
    btn.className='chama-mobile-menu-btn';
    btn.type='button';
    btn.setAttribute('aria-label','Abrir menu');
    btn.textContent='☰';
    top.appendChild(btn);
  }
  let menu=document.getElementById('chamaMobileMenu');
  if(!menu){
    menu=document.createElement('div');
    menu.id='chamaMobileMenu';
    menu.className='chama-mobile-menu';
    document.body.appendChild(menu);
  }
  function build(){
    const items=[
      ['#notifBtn','🔔','Notificações'],
      ['[id*="notif"]','🔔','Notificações'],
      ['#bizTopBtn','📍','Negócios'],
      ['#offersTopBtn','🔥','Ofertas'],
      ['#aboutBtn','ℹ️','Sobre o Chama'],
      ['#privacyBtn','🔒','Política de Privacidade'],
      ['#adminBtn','🛡️','Admin']
    ];
    const seen=new Set();
    let html='';
    for(const [sel,icon,label] of items){
      const el=document.querySelector('.topbar '+sel);
      if(!el||seen.has(el))continue;
      seen.add(el);
      html+=`<button type="button" data-target="${el.id}"><span>${icon}</span><span>${label}</span></button>`;
    }
    const logout=document.getElementById('logoutBtn');
    if(logout)html+=`<div class="menu-sep"></div><button type="button" class="menu-logout" data-target="logoutBtn"><span>🚪</span><span>Sair</span></button>`;
    menu.innerHTML=html;
    menu.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{
      const target=document.getElementById(b.dataset.target);
      menu.classList.remove('open');
      btn.textContent='☰';
      if(target)target.click();
    });
  }
  btn.onclick=e=>{
    e.stopPropagation();
    build();
    const open=menu.classList.toggle('open');
    btn.textContent=open?'×':'☰';
  };
  document.addEventListener('click',e=>{
    if(!menu.contains(e.target)&&e.target!==btn){menu.classList.remove('open');btn.textContent='☰'}
  });
  window.addEventListener('resize',()=>{if(innerWidth>700){menu.classList.remove('open');btn.textContent='☰'}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
setTimeout(install,700);
})();