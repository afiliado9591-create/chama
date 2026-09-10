(()=>{
  const STYLE_ID='chamaTopbarMenuReplaceV1';
  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='#logoutBtn{display:none!important}';
    document.head.appendChild(s);
  }
  function addLogoutToMenu(){
    const panel=document.querySelector('#chamaMainMenu .chama-menu-links');
    if(!panel||panel.querySelector('[data-chama-menu-logout]'))return;
    const logout=document.getElementById('logoutBtn');
    if(!logout)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='chama-menu-link';
    b.setAttribute('data-chama-menu-logout','1');
    b.innerHTML='<span class="chama-menu-icon">🚪</span><span>Sair</span>';
    b.onclick=()=>logout.click();
    panel.appendChild(b);
  }
  function start(){
    addStyle();
    addLogoutToMenu();
    const obs=new MutationObserver(addLogoutToMenu);
    obs.observe(document.body,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
