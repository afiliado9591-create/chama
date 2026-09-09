(()=>{
  function rememberTarget(uid){
    if(!uid)return;
    const list=document.getElementById('usersList');
    if(!list)return;
    const existing=[...list.querySelectorAll('.user')].find(row=>row.dataset.uid===uid);
    if(existing)return;
    const email=(document.getElementById('chatEmail')?.textContent||'').trim();
    const row=document.createElement('div');
    row.className='user';
    row.dataset.uid=uid;
    row.style.display='none';
    row.innerHTML=`<div class="user-main"><div class="user-email"></div></div>`;
    row.querySelector('.user-email').textContent=email;
    list.appendChild(row);
  }

  document.addEventListener('chama-chat-opened',event=>rememberTarget(event.detail?.uid||''));

  // Recupera também a conversa que já estava aberta quando este módulo carregou.
  const active=document.getElementById('activeChat');
  if(active?.dataset?.uid)rememberTarget(active.dataset.uid);
})();
