(()=>{
  const STYLE_ID='chamaReadReceiptsStyleV1';
  let fs=null,db=null,me=null,activeOtherUid='',activeChatId='',stopChat=null;
  let ownSeenAt=0,otherSeenAt=0,chatReady=false,markTimer=null,marking=false;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`#messages .time .chama-seen-check{display:inline-block;margin-left:4px;color:#1685e6;font-size:11px;font-weight:950;line-height:1;vertical-align:baseline}`;
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

  function stopCurrent(){
    clearTimeout(markTimer);markTimer=null;if(stopChat){try{stopChat()}catch(_){ }stopChat=null}
    activeOtherUid='';activeChatId='';ownSeenAt=0;otherSeenAt=0;chatReady=false;marking=false;renderReceipts();
  }

  function watchChat(otherUid){
    if(!me||!db||!fs||!otherUid||otherUid===me.uid)return;
    if(activeOtherUid===otherUid&&stopChat)return;
    stopCurrent();activeOtherUid=otherUid;activeChatId=[me.uid,otherUid].sort().join('_');
    stopChat=fs.onSnapshot(fs.doc(db,'chats',activeChatId),snap=>{
      chatReady=true;
      if(!snap.exists()){ownSeenAt=0;otherSeenAt=0;renderReceipts();return}
      const d=snap.data()||{},seen=d.lastSeenAt||{};
      ownSeenAt=millis(seen[me.uid]);otherSeenAt=millis(seen[otherUid]);renderReceipts();maybeMarkSeen();
    },e=>{chatReady=false;console.warn('Chama: confirmação de leitura não carregou',e)});
    setTimeout(maybeMarkSeen,500);
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