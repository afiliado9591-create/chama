(()=>{
  const KEY='__chamaActiveChat';
  function rememberFromRow(row){
    const uid=(row?.dataset?.uid||'').trim();
    if(!uid)return;
    const email=(row.querySelector('.user-email')?.textContent||'').trim();
    const nome=(row.querySelector('.user-name')?.textContent||'').trim();
    window[KEY]={uid,email,nome};
    const chat=document.getElementById('activeChat');
    if(chat)chat.dataset.uid=uid;
  }
  document.addEventListener('click',e=>{
    const row=e.target?.closest?.('#usersList .user');
    if(row)rememberFromRow(row);
  },true);
  function sync(){
    const chat=document.getElementById('activeChat');
    if(!chat||chat.classList.contains('hidden'))return;
    const uid=(chat.dataset.uid||window[KEY]?.uid||'').trim();
    if(!uid)return;
    const email=(document.getElementById('chatEmail')?.textContent||'').trim();
    window[KEY]={...(window[KEY]||{}),uid,email};
    const list=document.getElementById('usersList');
    if(!list||!email)return;
    const found=[...list.querySelectorAll('.user')].some(r=>r.dataset.uid===uid&&((r.querySelector('.user-email')?.textContent||'').trim()===email));
    if(found)return;
    let bridge=list.querySelector('[data-chama-recipient-bridge="1"]');
    if(!bridge){
      bridge=document.createElement('div');
      bridge.setAttribute('data-chama-recipient-bridge','1');
      bridge.style.display='none';
      bridge.innerHTML='<span class="user-email"></span>';
      list.appendChild(bridge);
    }
    bridge.dataset.uid=uid;
    bridge.querySelector('.user-email').textContent=email;
  }
  function boot(){
    document.addEventListener('chama-chat-opened',e=>{
      const uid=String(e.detail?.uid||'').trim();
      if(uid)window[KEY]={...(window[KEY]||{}),uid};
      setTimeout(sync,0);
      setTimeout(sync,100);
    });
    const root=document.body;
    if(root)new MutationObserver(sync).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-uid']});
    sync();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();