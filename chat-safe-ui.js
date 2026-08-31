(()=>{
  function closeChat(){document.getElementById('chatPanel')?.classList.add('hidden-mobile')}
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
    if(back){e.preventDefault();e.stopPropagation();closeChat();return}
    const name=e.target.closest?.('#chatName');
    if(name){e.preventDefault();e.stopPropagation();openProfile();}
  }
  document.addEventListener('click',handler,true);
})();
