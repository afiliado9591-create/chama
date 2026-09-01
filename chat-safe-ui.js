(()=>{
  function addStyle(){if(document.getElementById('chatBackStyle'))return;const s=document.createElement('style');s.id='chatBackStyle';s.textContent=`#backBtn{display:none;align-items:center;justify-content:center;width:44px;height:44px;min-width:44px;padding:0!important;border:0!important;border-radius:50%!important;background:#e8f5ef!important;color:#0b7a53!important;font-size:0!important;box-shadow:0 1px 4px #00000016;cursor:pointer}#backBtn:before{content:'‹';font-size:36px;line-height:1;font-weight:500}@media(max-width:700px){#backBtn{display:inline-flex!important}.chat-head{padding-left:10px!important}}`;document.head.appendChild(s)}
  const overlays=['profileModal','offersModal','businessDirectoryModal','channelsModal','bulkShareModal','offerEditor','twoOffersManager','twoOfferEditor'];
  const logged=()=>{const a=document.getElementById('app');return !!a&&!a.classList.contains('hidden')};
  function closeOverlays(){let c=false;for(const id of overlays){const e=document.getElementById(id);if(e&&!e.classList.contains('hidden')){e.classList.add('hidden');c=true}}return c}
  function chatOpen(){const p=document.getElementById('chatPanel');return !!p&&!p.classList.contains('hidden-mobile')}
  function closeChat(){const p=document.getElementById('chatPanel');if(chatOpen()){p.classList.add('hidden-mobile');return true}return false}
  function home(){closeOverlays();closeChat();try{history.replaceState({chama:'home'},'',location.pathname)}catch{}}
  function arm(){
    // PWA precisa de uma entrada anterior interna. Assim o primeiro Voltar do Android não fecha o app.
    try{
      history.replaceState({chama:'guard'},'',location.pathname+location.search);
      history.pushState({chama:'home'},'',location.pathname+location.search);
    }catch{}
  }
  function enterInternal(){if(!logged())return;try{if(history.state?.chama!=='inside')history.pushState({chama:'inside'},'',location.pathname+location.search)}catch{}}
  function openProfile(){const m=document.getElementById('profileModal');if(!m)return;const n=(document.getElementById('chatName')?.textContent||'Usuário').trim(),e=(document.getElementById('chatEmail')?.textContent||'').trim();if(document.getElementById('profileName'))document.getElementById('profileName').textContent=n;if(document.getElementById('profileEmail'))document.getElementById('profileEmail').textContent=e;document.getElementById('profileView')?.classList.remove('hidden');document.getElementById('profileEdit')?.classList.add('hidden');m.classList.remove('hidden');enterInternal()}
  addStyle();arm();
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#backBtn');if(b){e.preventDefault();e.stopPropagation();home();return}
    const n=e.target.closest?.('#chatName');if(n){e.preventDefault();e.stopPropagation();openProfile();return}
    // Ao abrir uma conversa/tela interna, cria uma etapa real no histórico do PWA.
    if(e.target.closest?.('#usersList .user,[data-talk],[data-catalog],#offersTopBtn,#channelsBtn,#businessDirectoryBtn,#bulkShareBtn,#myProfileBtn'))setTimeout(enterInternal,0);
  },true);
  window.addEventListener('popstate',()=>{
    if(!logged())return;
    if(closeOverlays()||closeChat()){
      try{history.replaceState({chama:'home'},'',location.pathname)}catch{}
      return;
    }
    // Se já estava na principal, mantém uma proteção para não fechar no primeiro Voltar acidental.
    if(history.state?.chama==='guard'){
      try{history.pushState({chama:'home'},'',location.pathname)}catch{}
    }
  });
})();
