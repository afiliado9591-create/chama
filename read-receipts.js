(()=>{
  const STYLE_ID='chamaReadReceiptsStyleV2';
  let fs=null,db=null,me=null,activeOtherUid='',activeChatId='',stopChat=null;
  let ownSeenAt=0,otherSeenAt=0,chatReady=false,markTimer=null,marking=false,recoveryTimer=null,recovering=false,recoveredKey='';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`#messages .time .chama-seen-check{display:inline-block;margin-left:4px;color:#1685e6;font-size:11px;font-weight:950;line-height:1;vertical-align:baseline}.chama-chat-retry{border:0;background:#0b7a53;color:#fff;border-radius:11px;padding:10px 14px;font-weight:850;margin-top:10px}`;
    document.head.appendChild(s);
  }

  function millis(v){
    try{if(v?.toMillis)return v.toMillis();if(v?.toDate)return v.toDate().getTime();const n=Number(v||0);return Number.isFinite(n)?n:0}catch{return 0}
  }

  function visibleChat(){
    if(document.visibilityState!=='visible'||!activeOtherUid)return false;
    const active=document.getElementById('activeChat'),panel=document.getElementById('chatPanel');
    if(!active||active.classList.contains('hidden'))return false;
    if(panel&&getComputedStyle(panel).display==='none')return false;
    return !active.dataset.uid||active.dataset.uid===activeOtherUid;
  }

  function renderReceipts(){
    for(const b of document.querySelectorAll('#messages .bubble.mine')){
      b.querySelector('.chama-seen-check')?.remove();
      const created=Number(b.dataset.chamaCreatedMs||0);
      if(!created||!otherSeenAt||created>otherSeenAt)continue;
      const time=b.querySelector('.time');if(!time)continue;
      const mark=document.createElement('span');mark.className='chama-seen-check';mark.textContent='✓';mark.title='Visto';time.appendChild(mark);
    }
  }

  function latestIncomingTime(){
    let latest=0;
    for(const b of document.querySelectorAll('#messages .bubble.theirs')){const n=Number(b.dataset.chamaCreatedMs||0);if(n>latest)latest=n}
    return latest;
  }

  function maybeMarkSeen(){
    if(!me||!db||!fs||!chatReady||!activeChatId||marking||!visibleChat())return;
    const latest=latestIncomingTime();if(!latest||latest<=ownSeenAt)return;
    clearTimeout(markTimer);markTimer=setTimeout(markSeen,850);
  }

  async function markSeen(){
    if(!me||!db||!fs||!activeChatId||marking||!visibleChat())return;
    const latest=latestIncomingTime();if(!latest||latest<=ownSeenAt)return;
    marking=true;const chatId=activeChatId,uid=me.uid;
    try{
      await fs.updateDoc(fs.doc(db,'chats',chatId),{[`lastSeenAt.${uid}`]:fs.serverTimestamp(),[`unreadCounts.${uid}`]:0});
      ownSeenAt=Math.max(ownSeenAt,latest);
    }catch(e){if(!String(e?.code||'').includes('not-found'))console.warn('Chama: não foi possível marcar como visto',e)}
    finally{marking=false}
  }

  function isStillLoading(){
    const box=document.getElementById('messages');
    return !!box?.querySelector('[data-chama-chat-loading-v119]');
  }

  function appendFallbackMessage(box,d){
    const m=d.data()||{},mine=m.senderId===me?.uid;
    const b=document.createElement('div');b.className='bubble '+(mine?'mine':'theirs');b.dataset.messageId=d.id;b.dataset.chamaCreatedMs=m.createdAt?.toMillis?String(m.createdAt.toMillis()):'';b.dataset.senderId=m.senderId||'';b.setAttribute('data-chama-message-meta-v123','1');
    const raw=String(m.text||'');let rendered=false;
    if(raw.startsWith('__CHAMA_MEDIA__')){
      try{
        const meta=JSON.parse(raw.slice('__CHAMA_MEDIA__'.length));
        if(meta?.kind==='audio'&&/^https?:\/\//i.test(meta.url||'')){
          const label=document.createElement('div');label.className='audio-label';label.textContent='🎤 Áudio';const player=document.createElement('audio');player.className='audio-player';player.controls=true;player.preload='metadata';player.src=meta.url;b.append(label,player);rendered=true;
        }else if(meta?.kind==='image'&&/^https?:\/\//i.test(meta.url||'')){
          const img=document.createElement('img');img.src=meta.url;img.alt='Imagem enviada';img.loading='lazy';img.style.cssText='max-width:100%;border-radius:10px;display:block';b.appendChild(img);rendered=true;
        }else if(meta?.kind==='video'&&/^https?:\/\//i.test(meta.url||'')){
          const video=document.createElement('video');video.src=meta.url;video.controls=true;video.preload='metadata';video.style.cssText='max-width:100%;border-radius:10px;display:block';b.appendChild(video);rendered=true;
        }
      }catch(_){ }
    }
    if(!rendered){const text=document.createElement('span');text.textContent=raw;b.appendChild(text)}
    const time=document.createElement('span');time.className='time';time.textContent=m.createdAt?.toDate?m.createdAt.toDate().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'';b.appendChild(time);box.appendChild(b);
  }

  async function queryMessages(otherUid,allowBootstrap=true){
    const ids=[me.uid,otherUid].sort(),chatId=ids.join('_');
    const q=fs.query(fs.collection(db,'chats',chatId,'messages'),fs.orderBy('createdAt','desc'),fs.limit(20));
    try{return await fs.getDocs(q)}catch(e){
      if(allowBootstrap&&String(e?.code||'').includes('permission-denied')){
        try{
          await fs.setDoc(fs.doc(db,'chats',chatId),{participants:ids,createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()},{merge:true});
          return await fs.getDocs(q);
        }catch(_){ }
      }
      throw e;
    }
  }

  async function recoverConversation(otherUid,manual=false){
    if(!me||!db||!fs||!otherUid||recovering)return;
    const key=`${me.uid}|${otherUid}`;
    if(!manual&&recoveredKey===key)return;
    if(!manual&&!isStillLoading())return;
    recovering=true;recoveredKey=key;
    try{
      const snap=await queryMessages(otherUid,true);
      if(activeOtherUid!==otherUid)return;
      const box=document.getElementById('messages');if(!box)return;
      box.innerHTML='';const docs=[];snap.forEach(d=>docs.push(d));docs.reverse().forEach(d=>appendFallbackMessage(box,d));
      if(!docs.length)box.innerHTML='<div style="margin:auto;color:#6a756f;padding:20px;text-align:center">Nenhuma mensagem nesta conversa ainda.</div>';
      box.scrollTop=box.scrollHeight;renderReceipts();maybeMarkSeen();
      console.info('Chama: conversa recuperada por leitura única.');
    }catch(e){
      console.error('Chama: falha ao recuperar conversa',e);
      if(activeOtherUid!==otherUid)return;
      const box=document.getElementById('messages');if(box){box.innerHTML='<div style="margin:auto;color:#6a756f;padding:20px;text-align:center">Não foi possível carregar esta conversa agora.<br><button id="chamaChatRetryBtn" class="chama-chat-retry" type="button">Tentar novamente</button></div>';const btn=document.getElementById('chamaChatRetryBtn');if(btn)btn.onclick=()=>recoverConversation(otherUid,true)}
    }finally{recovering=false}
  }

  function scheduleRecovery(otherUid){
    clearTimeout(recoveryTimer);recoveryTimer=setTimeout(()=>recoverConversation(otherUid,false),3200);
  }

  function stopCurrent(){
    clearTimeout(markTimer);markTimer=null;clearTimeout(recoveryTimer);recoveryTimer=null;if(stopChat){try{stopChat()}catch(_){ }stopChat=null}
    activeOtherUid='';activeChatId='';ownSeenAt=0;otherSeenAt=0;chatReady=false;marking=false;recovering=false;recoveredKey='';renderReceipts();
  }

  function watchChat(otherUid){
    if(!me||!db||!fs||!otherUid||otherUid===me.uid)return;
    if(activeOtherUid===otherUid&&stopChat){scheduleRecovery(otherUid);return}
    stopCurrent();activeOtherUid=otherUid;activeChatId=[me.uid,otherUid].sort().join('_');
    stopChat=fs.onSnapshot(fs.doc(db,'chats',activeChatId),snap=>{
      chatReady=true;
      if(!snap.exists()){ownSeenAt=0;otherSeenAt=0;renderReceipts();scheduleRecovery(otherUid);return}
      const d=snap.data()||{},seen=d.lastSeenAt||{};
      ownSeenAt=millis(seen[me.uid]);otherSeenAt=millis(seen[otherUid]);renderReceipts();maybeMarkSeen();scheduleRecovery(otherUid);
    },e=>{chatReady=false;console.warn('Chama: confirmação de leitura não carregou',e);scheduleRecovery(otherUid)});
    setTimeout(maybeMarkSeen,500);scheduleRecovery(otherUid);
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];
      for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);authMod.onAuthStateChanged(auth,u=>{stopCurrent();me=u||null});
    }catch(e){console.warn('Chama: confirmação de leitura não iniciou',e)}
  }

  function start(){
    addStyle();initFirebase();
    document.addEventListener('chama-chat-opened',e=>{const uid=String(e?.detail?.uid||'');if(uid)setTimeout(()=>watchChat(uid),0)});
    const box=document.getElementById('messages');if(box)new MutationObserver(()=>{renderReceipts();maybeMarkSeen()}).observe(box,{childList:true,subtree:true});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(maybeMarkSeen,150)});
    window.addEventListener('focus',()=>setTimeout(maybeMarkSeen,150));
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();