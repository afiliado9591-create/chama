(()=>{
  function addStyle(){if(document.getElementById('chatBackStyle'))return;const s=document.createElement('style');s.id='chatBackStyle';s.textContent=`#backBtn{display:none;align-items:center;justify-content:center;width:44px;height:44px;min-width:44px;padding:0!important;border:0!important;border-radius:50%!important;background:#e8f5ef!important;color:#0b7a53!important;font-size:0!important;box-shadow:0 1px 4px #00000016;cursor:pointer;transition:transform .12s ease,background .12s ease}#backBtn:before{content:'‹';font-size:36px;line-height:1;font-weight:500;transform:translateY(-1px)}#backBtn:active{transform:scale(.94);background:#d9eee5!important}@media(max-width:700px){#backBtn{display:inline-flex!important}.chat-head{padding-left:10px!important}}`;document.head.appendChild(s)}
  function closeOverlays(){
    let closed=false;
    for(const id of ['profileModal','offersModal','businessDirectoryModal','channelsModal','bulkShareModal']){
      const el=document.getElementById(id);if(el&&!el.classList.contains('hidden')){el.classList.add('hidden');closed=true}
    }
    return closed;
  }
  function closeChat(){const p=document.getElementById('chatPanel');if(!p)return false;const visible=!p.classList.contains('hidden-mobile');if(visible)p.classList.add('hidden-mobile');return visible}
  function goHome(){closeOverlays();closeChat();try{history.replaceState({chamaHome:true},'',location.pathname)}catch{} }
  function armHomeHistory(){
    if(!history.state?.chamaHome){try{history.replaceState({...(history.state||{}),chamaHome:true},'',location.href)}catch{}}
  }
  function openProfile(){
    const modal=document.getElementById('profileModal'); if(!modal)return;
    const name=(document.getElementById('chatName')?.textContent||'Usuário').trim();
    const email=(document.getElementById('chatEmail')?.textContent||'').trim();
    const pn=document.getElementById('profileName'),pe=document.getElementById('profileEmail');
    if(pn)pn.textContent=name;if(pe)pe.textContent=email;
    document.getElementById('profileView')?.classList.remove('hidden');
    document.getElementById('profileEdit')?.classList.add('hidden');
    modal.classList.remove('hidden');
  }
  function handler(e){
    const back=e.target.closest?.('#backBtn');
    if(back){e.preventDefault();e.stopPropagation();goHome();return}
    const name=e.target.closest?.('#chatName');
    if(name){e.preventDefault();e.stopPropagation();openProfile();}
  }
  addStyle();armHomeHistory();
  document.addEventListener('click',handler,true);
  window.addEventListener('popstate',()=>{
    const logged=document.getElementById('app')&&!document.getElementById('app').classList.contains('hidden');
    if(!logged)return;
    const overlayClosed=closeOverlays(),chatClosed=closeChat();
    if(overlayClosed||chatClosed){try{history.pushState({chamaHome:true},'',location.pathname)}catch{};return}
    // Mantém o usuário logado na tela principal do Chama em vez de cair em perfil/link público anterior.
    try{history.pushState({chamaHome:true},'',location.pathname)}catch{}
  });
})();
