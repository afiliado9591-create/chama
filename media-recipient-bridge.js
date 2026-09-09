(()=>{
  const KEY='__chamaActiveChat';
  function remember(uid,email='',nome=''){
    uid=String(uid||'').trim();
    if(!uid)return;
    window[KEY]={...(window[KEY]||{}),uid,email,nome};
    const chat=document.getElementById('activeChat');
    if(chat)chat.dataset.uid=uid;
  }
  document.addEventListener('click',e=>{
    const row=e.target?.closest?.('#usersList .user');
    if(!row)return;
    remember(row.dataset.uid||'',row.querySelector('.user-email')?.textContent||'',row.querySelector('.user-name')?.textContent||'');
  },true);
  document.addEventListener('chama-chat-opened',e=>{
    remember(e.detail?.uid||'',e.detail?.email||'',e.detail?.nome||'');
  });
})();