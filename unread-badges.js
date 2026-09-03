(()=>{
  const STYLE_ID='chamaUnreadStyleV1';
  let meUid='';
  let db=null;
  let firestore=null;
  const conversations=new Map();

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #usersList .user{position:relative}
      #usersList .user.has-unread .user-name{color:#0b7a53;font-weight:850}
      .chama-conversation-side{margin-left:auto;display:grid;justify-items:end;gap:5px;flex:0 0 auto;min-width:34px}
      .chama-unread-badge{min-width:23px;height:23px;padding:0 7px;border-radius:999px;background:#16a36a;color:#fff;display:grid;place-items:center;font-size:12px;font-weight:850;line-height:1}
      .chama-last-message{font-size:11px;color:#7a8580;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #usersList .user.has-unread .chama-last-message{color:#0b7a53;font-weight:700}
    `;
    document.head.appendChild(s);
  }

  function countValue(data){
    const n=Number(data?.unreadCounts?.[meUid]||0);
    return Number.isFinite(n)&&n>0?Math.floor(n):0;
  }

  function preview(text=''){
    if(!text)return '';
    if(text.startsWith('__CHAMA_MEDIA__')){
      try{
        const m=JSON.parse(text.slice('__CHAMA_MEDIA__'.length));
        if(m.kind==='audio')return '🎤 Áudio';
        if(m.kind==='image')return '📷 Imagem';
        if(m.kind==='video')return '🎥 Vídeo';
      }catch(_){ }
    }
    return text.length>28?text.slice(0,28)+'…':text;
  }

  function conversationForRow(row){
    return conversations.get(row?.dataset?.uid||'')||null;
  }

  function renderRow(row){
    if(!row?.dataset?.uid)return;
    row.querySelector('.chama-conversation-side')?.remove();
    row.classList.remove('has-unread');

    const c=conversationForRow(row);
    if(!c)return;

    const side=document.createElement('div');
    side.className='chama-conversation-side';

    if(c.unread>0){
      row.classList.add('has-unread');
      const badge=document.createElement('span');
      badge.className='chama-unread-badge';
      badge.textContent=c.unread>99?'99+':String(c.unread);
      badge.title=c.unread===1?'1 mensagem não lida':`${c.unread} mensagens não lidas`;
      side.appendChild(badge);
    }

    if(c.lastMessage){
      const last=document.createElement('span');
      last.className='chama-last-message';
      last.textContent=preview(c.lastMessage);
      side.appendChild(last);
    }

    if(side.childNodes.length)row.appendChild(side);

    if(row.dataset.chamaUnreadClick!=='1'){
      row.dataset.chamaUnreadClick='1';
      row.addEventListener('click',()=>resetUnread(row));
    }
  }

  function renderAll(){
    document.querySelectorAll('#usersList .user').forEach(renderRow);
  }

  function renderWhenUsersReady(attempt=0){
    const rows=document.querySelectorAll('#usersList .user');
    if(rows.length){renderAll();return}
    if(attempt<40)setTimeout(()=>renderWhenUsersReady(attempt+1),125);
  }

  async function resetUnread(row){
    const c=conversationForRow(row);
    if(!c||c.unread<=0||!meUid||!db||!firestore||c.resetting)return;
    c.resetting=true;
    const previous=c.unread;
    c.unread=0;
    renderRow(row);
    try{
      await firestore.updateDoc(
        firestore.doc(db,'chats',c.chatId),
        {[`unreadCounts.${meUid}`]:0}
      );
    }catch(e){
      console.error('Chama: não foi possível zerar não lidas',e);
      c.unread=previous;
      renderRow(row);
    }finally{
      c.resetting=false;
    }
  }

  async function getFirebaseApp(attempt=0){
    const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
    const app=appMod.getApps()[0];
    if(app)return {app,appMod};
    if(attempt>=20)return null;
    await new Promise(r=>setTimeout(r,100));
    return getFirebaseApp(attempt+1);
  }

  async function loadConversations(user){
    meUid=user.uid;
    try{
      const found=await getFirebaseApp();
      if(!found)return;
      const fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
      db=fs.getFirestore(found.app);
      firestore=fs;

      const q=fs.query(
        fs.collection(db,'chats'),
        fs.where('participants','array-contains',meUid),
        fs.limit(20)
      );
      const snap=await fs.getDocs(q);
      conversations.clear();
      snap.forEach(d=>{
        const data=d.data()||{};
        const participants=Array.isArray(data.participants)?data.participants:[];
        const otherUid=participants.find(uid=>uid&&uid!==meUid);
        if(!otherUid)return;
        conversations.set(otherUid,{
          chatId:d.id,
          unread:countValue(data),
          lastMessage:data.lastMessage||''
        });
      });
      renderWhenUsersReady();
    }catch(e){
      console.error('Chama: não foi possível carregar contadores',e);
    }
  }

  async function start(){
    addStyle();
    try{
      const found=await getFirebaseApp();
      if(!found)return;
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');
      const auth=authMod.getAuth(found.app);
      authMod.onAuthStateChanged(auth,user=>{
        if(!user){
          meUid='';db=null;firestore=null;conversations.clear();renderAll();return;
        }
        loadConversations(user);
      });
    }catch(e){
      console.error('Chama: contador não iniciou',e);
    }
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();