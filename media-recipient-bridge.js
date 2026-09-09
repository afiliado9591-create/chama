(()=> {
  const KEY='__chamaActiveChat';
  function remember(uid,email='',nome=''){
    uid=String(uid||'').trim();
    if(!uid)return;
    email=String(email||'').trim();
    window[KEY]={...(window[KEY]||{}),uid,email,nome};
    window.__chamaActiveChatUid=uid;
    const chat=document.getElementById('activeChat');
    if(chat)chat.dataset.uid=uid;
    const list=document.getElementById('usersList');
    if(list&&email){
      let row=[...list.querySelectorAll('.user')].find(r=>(r.querySelector('.user-email')?.textContent||'').trim().toLowerCase()===email.toLowerCase());
      if(!row){
        row=document.createElement('div');
        row.className='user';
        row.style.display='none';
        const mail=document.createElement('span');
        mail.className='user-email';
        mail.textContent=email;
        row.appendChild(mail);
        list.appendChild(row);
      }
      row.dataset.uid=uid;
    }
  }
  document.addEventListener('click',e=>{
    const row=e.target?.closest?.('#usersList .user');
    if(!row)return;
    remember(row.dataset.uid||'',row.querySelector('.user-email')?.textContent||'',row.querySelector('.user-name')?.textContent||'');
  },true);
  document.addEventListener('chama-chat-opened',e=>{
    const email=(document.getElementById('chatEmail')?.textContent||'').trim();
    remember(e.detail?.uid||'',email||e.detail?.email||'',e.detail?.nome||'');
  });
})();
