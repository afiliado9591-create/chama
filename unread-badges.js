(()=>{
  const STYLE_ID='chamaUnreadStyleV3';
  const PAGE_SIZE=20;
  let meUid='';
  let db=null;
  let firestore=null;
  let lastConversationDoc=null;
  let hasMore=true;
  let loadingPage=false;
  let observer=null;
  const conversations=new Map();
  const profiles=new Map();

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
      #usersList .chama-conversation-generated .avatar{overflow:hidden}
      #usersList .chama-conversation-generated .avatar img{width:100%;height:100%;object-fit:cover;display:block}
      .chama-conversation-more-wrap{padding:12px 16px 18px;text-align:center;background:#fff}
      .chama-conversation-more{border:1px solid #cfe0d7;background:#eef8f3;color:#0b7a53;border-radius:999px;padding:10px 16px;font-weight:850;cursor:pointer}
      .chama-conversation-more:disabled{opacity:.6;cursor:default}
      .chama-conversation-end{font-size:12px;color:#7a8580;padding:8px 0}
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

  function safePhotoUrl(value){
    const v=String(value||'').trim();if(!v)return '';
    try{const u=new URL(v,location.origin);if(u.origin!==location.origin||u.pathname!=='/api/media'||!u.searchParams.get('key'))return '';return u.href}catch{return ''}
  }

  function timeValue(v){
    try{if(v?.toMillis)return v.toMillis();if(v?.toDate)return v.toDate().getTime();const n=Number(v||0);return Number.isFinite(n)?n:0}catch{return 0}
  }

  function conversationForRow(row){return conversations.get(row?.dataset?.uid||'')||null}

  function renderRow(row){
    if(!row?.dataset?.uid)return;
    row.querySelector('.chama-conversation-side')?.remove();
    row.classList.remove('has-unread');
    const c=conversationForRow(row);if(!c)return;
    const side=document.createElement('div');side.className='chama-conversation-side';
    if(c.unread>0){
      row.classList.add('has-unread');
      const badge=document.createElement('span');badge.className='chama-unread-badge';badge.textContent=c.unread>99?'99+':String(c.unread);badge.title=c.unread===1?'1 mensagem não lida':`${c.unread} mensagens não lidas`;side.appendChild(badge);
    }
    if(c.lastMessage){const last=document.createElement('span');last.className='chama-last-message';last.textContent=preview(c.lastMessage);side.appendChild(last)}
    if(side.childNodes.length)row.appendChild(side);
    if(row.dataset.chamaUnreadClick!=='1'){row.dataset.chamaUnreadClick='1';row.addEventListener('click',()=>resetUnread(row))}
  }

  function renderAll(){document.querySelectorAll('#usersList .user').forEach(renderRow)}

  function setAvatar(row,photoUrl,name){
    const avatar=row?.querySelector(':scope > .avatar');if(!avatar)return;
    const safe=safePhotoUrl(photoUrl);avatar.textContent='';
    if(!safe){avatar.textContent=(String(name||'U').trim().charAt(0)||'U').toUpperCase();return}
    const img=document.createElement('img');img.alt='Foto de perfil';img.loading='lazy';img.src=safe;img.onerror=()=>{avatar.textContent=(String(name||'U').trim().charAt(0)||'U').toUpperCase()};avatar.appendChild(img);
  }

  function profileFor(uid){return profiles.get(uid)||{uid,nome:'Usuário',email:'',photoUrl:''}}

  function openGeneratedConversation(uid){
    const p=profileFor(uid);
    if(typeof window.chamaOpenChat!=='function')return alert('A conversa ainda está carregando. Tente novamente em alguns segundos.');
    window.chamaOpenChat({uid,nome:p.nome||'Usuário',email:p.email||`${uid}@chama.local`,photoUrl:p.photoUrl||''});
  }

  function ensureConversationRow(uid){
    const list=document.getElementById('usersList');if(!list||!uid)return null;
    let row=[...list.querySelectorAll('.user')].find(r=>r.dataset.uid===uid);
    const p=profileFor(uid);
    if(!row){
      row=document.createElement('div');row.className='user chama-conversation-generated';row.dataset.uid=uid;
      row.innerHTML='<div class="avatar">U</div><div class="user-main"><div class="user-name"></div><div class="user-email"></div></div>';
      row.onclick=()=>openGeneratedConversation(uid);list.appendChild(row);
    }
    const name=row.querySelector('.user-name'),email=row.querySelector('.user-email');
    if(name&&(row.classList.contains('chama-conversation-generated')||!name.textContent.trim()))name.textContent=p.nome||'Usuário';
    if(email&&row.classList.contains('chama-conversation-generated'))email.textContent=p.email||'';
    if(row.classList.contains('chama-conversation-generated'))setAvatar(row,p.photoUrl,p.nome);
    renderRow(row);return row;
  }

  function sortConversationRows(){
    const list=document.getElementById('usersList');if(!list)return;
    const rows=[...list.querySelectorAll('.user')].filter(r=>conversations.has(r.dataset.uid));
    rows.sort((a,b)=>(conversations.get(b.dataset.uid)?.updatedAt||0)-(conversations.get(a.dataset.uid)?.updatedAt||0));
    rows.forEach(row=>list.appendChild(row));
    const more=document.getElementById('chamaConversationMoreWrap');if(more)list.appendChild(more);
    document.getElementById('chamaEmptyConversations')?.remove();
  }

  async function waitForBaseList(){
    const end=Date.now()+4500;
    while(Date.now()<end){const list=document.getElementById('usersList');if(list&&!/Carregando pessoas/i.test(list.textContent||''))return list;await new Promise(r=>setTimeout(r,120))}
    return document.getElementById('usersList');
  }

  async function loadProfiles(ids){
    if(!firestore||!db||!ids.length)return;
    const unique=[...new Set(ids.filter(Boolean).filter(uid=>!profiles.has(uid)))];if(!unique.length)return;
    const missing=[];
    for(let i=0;i<unique.length;i+=30){
      const batch=unique.slice(i,i+30);
      try{
        const snap=await firestore.getDocs(firestore.query(firestore.collection(db,'publicProfiles'),firestore.where(firestore.documentId(),'in',batch)));
        const found=new Set();snap.forEach(d=>{const x=d.data()||{};found.add(d.id);profiles.set(d.id,{uid:d.id,nome:String(x.nome||'Usuário'),email:'',photoUrl:safePhotoUrl(x.photoUrl||'')})});batch.forEach(uid=>{if(!found.has(uid))missing.push(uid)});
      }catch{missing.push(...batch)}
    }
    for(let i=0;i<missing.length;i+=30){
      const batch=missing.slice(i,i+30);
      try{const snap=await firestore.getDocs(firestore.query(firestore.collection(db,'users'),firestore.where(firestore.documentId(),'in',batch)));snap.forEach(d=>{const x=d.data()||{};profiles.set(d.id,{uid:d.id,nome:String(x.nome||x.email||'Usuário'),email:String(x.email||''),photoUrl:''})})}catch(_){ }
    }
    unique.forEach(uid=>{if(!profiles.has(uid))profiles.set(uid,{uid,nome:'Usuário',email:'',photoUrl:''})});
  }

  function ensureMoreControl(){
    const list=document.getElementById('usersList');if(!list)return;
    let wrap=document.getElementById('chamaConversationMoreWrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='chamaConversationMoreWrap';wrap.className='chama-conversation-more-wrap';
      const btn=document.createElement('button');btn.id='chamaConversationMore';btn.type='button';btn.className='chama-conversation-more';btn.onclick=()=>loadConversationPage(false);wrap.appendChild(btn);list.appendChild(wrap);
      observer?.disconnect();observer=new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting)&&hasMore&&!loadingPage)loadConversationPage(false)},{root:null,rootMargin:'220px 0px'});observer.observe(wrap);
    }
    const btn=document.getElementById('chamaConversationMore');if(!btn)return;
    if(loadingPage){btn.disabled=true;btn.textContent='Carregando...';wrap.hidden=false}
    else if(hasMore){btn.disabled=false;btn.textContent='Carregar mais conversas';wrap.hidden=false}
    else{btn.disabled=true;btn.textContent='Todas as conversas carregadas';wrap.hidden=conversations.size===0}
  }

  async function resetUnread(row){
    const c=conversationForRow(row);if(!c||c.unread<=0||!meUid||!db||!firestore||c.resetting)return;
    c.resetting=true;const previous=c.unread;c.unread=0;renderRow(row);
    try{await firestore.updateDoc(firestore.doc(db,'chats',c.chatId),{[`unreadCounts.${meUid}`]:0})}
    catch(e){console.error('Chama: não foi possível zerar não lidas',e);c.unread=previous;renderRow(row)}finally{c.resetting=false}
  }

  async function getFirebaseApp(attempt=0){
    const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');const app=appMod.getApps()[0];if(app)return {app,appMod};if(attempt>=20)return null;await new Promise(r=>setTimeout(r,100));return getFirebaseApp(attempt+1);
  }

  async function loadConversationPage(reset=false){
    if(!meUid||!db||!firestore||loadingPage)return;
    if(reset){lastConversationDoc=null;hasMore=true;conversations.clear();profiles.clear();document.querySelectorAll('#usersList .chama-conversation-generated').forEach(x=>x.remove())}
    if(!hasMore)return;
    loadingPage=true;ensureMoreControl();
    try{
      let q=firestore.query(firestore.collection(db,'chats'),firestore.where('participants','array-contains',meUid),firestore.orderBy('updatedAt','desc'),firestore.limit(PAGE_SIZE));
      if(lastConversationDoc)q=firestore.query(firestore.collection(db,'chats'),firestore.where('participants','array-contains',meUid),firestore.orderBy('updatedAt','desc'),firestore.startAfter(lastConversationDoc),firestore.limit(PAGE_SIZE));
      let snap;
      try{snap=await firestore.getDocs(q)}catch(indexErr){
        if(lastConversationDoc)throw indexErr;
        console.warn('Chama: índice de conversas recentes indisponível; usando primeiro lote sem ordenação.',indexErr);
        snap=await firestore.getDocs(firestore.query(firestore.collection(db,'chats'),firestore.where('participants','array-contains',meUid),firestore.limit(PAGE_SIZE)));
        hasMore=false;
      }
      const newIds=[];
      snap.forEach(d=>{
        const data=d.data()||{},participants=Array.isArray(data.participants)?data.participants:[],otherUid=participants.find(uid=>uid&&uid!==meUid);if(!otherUid)return;
        conversations.set(otherUid,{chatId:d.id,unread:countValue(data),lastMessage:data.lastMessage||'',updatedAt:timeValue(data.updatedAt)});newIds.push(otherUid);
      });
      if(snap.docs.length){lastConversationDoc=snap.docs[snap.docs.length-1]}
      if(snap.docs.length<PAGE_SIZE)hasMore=false;
      await waitForBaseList();await loadProfiles(newIds);newIds.forEach(ensureConversationRow);renderAll();sortConversationRows();
    }catch(e){console.error('Chama: não foi possível carregar mais conversas',e);hasMore=false}
    finally{loadingPage=false;ensureMoreControl()}
  }

  async function loadConversations(user){
    meUid=user.uid;
    try{
      const found=await getFirebaseApp();if(!found)return;
      const fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');db=fs.getFirestore(found.app);firestore=fs;
      await loadConversationPage(true);
    }catch(e){console.error('Chama: não foi possível carregar conversas',e)}
  }

  function handleSent(e){
    const d=e?.detail||{},uid=String(d.uid||'');if(!meUid||!uid||uid===meUid)return;
    profiles.set(uid,{uid,nome:String(d.nome||'Usuário'),email:String(d.email||''),photoUrl:safePhotoUrl(d.photoUrl||'')});
    conversations.set(uid,{chatId:[meUid,uid].sort().join('_'),unread:0,lastMessage:String(d.lastMessage||''),updatedAt:Date.now()});
    const row=ensureConversationRow(uid);if(row){row.classList.remove('chama-search-bridge');row.style.removeProperty('display');renderRow(row);sortConversationRows()}
  }

  async function start(){
    addStyle();document.addEventListener('chama-message-sent',handleSent);
    try{
      const found=await getFirebaseApp();if(!found)return;
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');const auth=authMod.getAuth(found.app);
      authMod.onAuthStateChanged(auth,user=>{
        if(!user){meUid='';db=null;firestore=null;lastConversationDoc=null;hasMore=true;loadingPage=false;conversations.clear();profiles.clear();observer?.disconnect();document.getElementById('chamaConversationMoreWrap')?.remove();renderAll();return}
        loadConversations(user);
      });
    }catch(e){console.error('Chama: conversas da home não iniciaram',e)}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();