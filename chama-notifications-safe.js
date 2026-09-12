(()=>{
  if(window.__chamaNotificationsSafeLoaded)return;
  window.__chamaNotificationsSafeLoaded=true;
  let fs=null,db=null,me=null,stopChats=null;
  const unreadByUid=new Map();
  let firstSnapshot=true,lastTotal=0;
  const STYLE_ID='chamaNotificationsSafeStyleV1';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      .chama-notify-btn{position:relative;border:0;background:#ffffff18;color:#fff;border-radius:12px;padding:10px 12px;cursor:pointer;font-size:18px;line-height:1}
      .chama-notify-badge{position:absolute;top:3px;right:3px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#d92d20;color:#fff;font-size:10px;font-weight:900;display:grid;place-items:center;border:2px solid #0b7a53}
      .chama-row-unread{margin-left:auto;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#0b7a53;color:#fff;font-size:11px;font-weight:900;display:grid;place-items:center}
      .chama-notify-enabled{box-shadow:0 0 0 2px #ffffff55 inset}
    `;
    document.head.appendChild(s);
  }

  function totalUnread(){let n=0;for(const v of unreadByUid.values())n+=Number(v||0);return n}
  function formatCount(n){return n>99?'99+':String(n)}

  function ensureButton(){
    const top=document.querySelector('.topbar');if(!top)return null;
    let b=document.getElementById('chamaNotifyButton');
    if(b)return b;
    b=document.createElement('button');b.id='chamaNotifyButton';b.className='chama-notify-btn';b.type='button';b.title='Notificações';b.setAttribute('aria-label','Notificações');
    b.innerHTML='🔔<span id="chamaNotifyBadge" class="chama-notify-badge hidden"></span>';
    b.addEventListener('click',async()=>{
      try{
        if(!('Notification' in window)){alert('Este navegador não oferece notificações.');return;}
        if(Notification.permission==='default')await Notification.requestPermission();
        if(Notification.permission==='granted'){
          b.classList.add('chama-notify-enabled');
          const n=totalUnread();alert(n?`Você tem ${n} mensagem(ns) não lida(s).`:'Não há mensagens não lidas.');
        }else alert('As notificações estão bloqueadas no navegador.');
      }catch(_){alert('Não foi possível ativar as notificações agora.');}
    });
    top.appendChild(b);return b;
  }

  function updateGlobal(){
    const b=ensureButton(),badge=document.getElementById('chamaNotifyBadge');if(!b||!badge)return;
    const n=totalUnread();badge.textContent=formatCount(n);badge.classList.toggle('hidden',n<=0);
    if('Notification' in window&&Notification.permission==='granted')b.classList.add('chama-notify-enabled');
  }

  function otherUidFromChat(data){
    const p=Array.isArray(data?.participants)?data.participants:[];return p.find(x=>x!==me?.uid)||'';
  }

  function syncRows(){
    for(const row of document.querySelectorAll('.user[data-uid]')){
      const uid=row.dataset.uid||'';
      const n=Number(unreadByUid.get(uid)||0);
      let badge=row.querySelector('.chama-row-unread');
      if(n>0){
        if(!badge){badge=document.createElement('span');badge.className='chama-row-unread';row.appendChild(badge)}
        badge.textContent=formatCount(n);badge.title=`${n} mensagem(ns) não lida(s)`;
      }else if(badge)badge.remove();
    }
    updateGlobal();
  }

  function showBrowserNotification(otherUid,count){
    if(document.visibilityState==='visible'||!('Notification' in window)||Notification.permission!=='granted')return;
    let name='Nova mensagem';
    const row=document.querySelector(`.user[data-uid="${CSS.escape(otherUid)}"]`);
    const nameEl=row?.querySelector('.user-name');if(nameEl&&nameEl.textContent.trim())name=nameEl.textContent.trim();
    try{new Notification(name,{body:count>1?`Você tem ${count} mensagens não lidas.`:'Você recebeu uma nova mensagem.',icon:'/icon-192.png',tag:`chama-${otherUid}`});}catch(_){ }
  }

  function watchChats(){
    if(stopChats){try{stopChats()}catch(_){}stopChats=null}
    unreadByUid.clear();firstSnapshot=true;lastTotal=0;syncRows();
    if(!me||!db||!fs)return;
    try{
      const q=fs.query(fs.collection(db,'chats'),fs.where('participants','array-contains',me.uid));
      stopChats=fs.onSnapshot(q,snap=>{
        const before=new Map(unreadByUid);
        unreadByUid.clear();
        snap.forEach(d=>{
          const data=d.data()||{},other=otherUidFromChat(data),count=Number(data?.unreadCounts?.[me.uid]||0);
          if(other&&count>0)unreadByUid.set(other,count);
        });
        const total=totalUnread();
        if(!firstSnapshot){
          for(const [uid,count] of unreadByUid){if(count>Number(before.get(uid)||0))showBrowserNotification(uid,count)}
        }
        firstSnapshot=false;lastTotal=total;syncRows();
      },e=>console.warn('Chama: notificações não carregaram',e));
    }catch(e){console.warn('Chama: notificações não iniciaram',e)}
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];
      for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,u=>{me=u||null;watchChats();syncRows()});
    }catch(e){console.warn('Chama: notificações não iniciaram',e)}
  }

  function start(){
    addStyle();ensureButton();initFirebase();
    setInterval(()=>{ensureButton();syncRows()},1500);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
