import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,collection,query,where,onSnapshot,orderBy,limit,getDoc,doc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let me=null,stopChats=null,chatStops=new Map(),seenFirst=new Set();

  function stopAll(){
    if(stopChats){stopChats();stopChats=null}
    chatStops.forEach(fn=>{try{fn()}catch{}});chatStops.clear();seenFirst.clear();
  }

  function ensureButton(){
    if(document.getElementById('notifyBtn'))return;
    const logout=document.getElementById('logoutBtn');
    if(!logout)return;
    const b=document.createElement('button');
    b.id='notifyBtn';b.className='iconbtn';b.type='button';
    const refresh=()=>{b.textContent=Notification.permission==='granted'?'🔔':'🔕';b.title=Notification.permission==='granted'?'Notificações ativadas':'Ativar notificações'};
    b.onclick=async()=>{
      if(!('Notification'in window))return alert('Seu navegador não oferece notificações.');
      try{const p=await Notification.requestPermission();refresh();if(p==='granted')new Notification('Chama',{body:'Notificações ativadas.',icon:'./icon.svg'})}catch{}
    };
    refresh();logout.parentNode.insertBefore(b,logout);
  }

  async function senderName(chatData,msg){
    const ids=Array.isArray(chatData?.participants)?chatData.participants:[];
    const other=ids.find(id=>id!==me?.uid);
    if(!other)return 'Nova mensagem';
    try{const s=await getDoc(doc(db,'users',other));return s.exists()?(s.data().nome||'Nova mensagem'):'Nova mensagem'}catch{return 'Nova mensagem'}
  }

  async function notify(chatId,chatData,msg){
    if(!me||msg.senderId===me.uid||Notification.permission!=='granted')return;
    let body=String(msg.text||'Nova mensagem').trim();
    if(body.startsWith('__CHAMA_MEDIA__')){
      try{const m=JSON.parse(body.slice('__CHAMA_MEDIA__'.length));body=m.kind==='image'?'📷 Imagem':m.kind==='audio'?'🎤 Áudio':m.kind==='video'?'🎥 Vídeo':'Nova mídia'}catch{body='Nova mídia'}
    }
    if(body.length>120)body=body.slice(0,117)+'...';
    const name=await senderName(chatData,msg);
    const reg=await navigator.serviceWorker?.ready.catch(()=>null);
    const options={body,icon:'./icon.svg',badge:'./icon.svg',tag:'chama-'+chatId,renotify:true,data:{url:'./'}};
    if(reg?.showNotification)await reg.showNotification(name,options);else new Notification(name,options);
  }

  function watchChat(chatId,chatData){
    if(chatStops.has(chatId))return;
    const q=query(collection(db,'chats',chatId,'messages'),orderBy('createdAt','desc'),limit(1));
    const stop=onSnapshot(q,s=>{
      if(s.empty)return;
      const d=s.docs[0],msg=d.data();
      if(!seenFirst.has(chatId)){seenFirst.add(chatId);return}
      notify(chatId,chatData,msg);
    },()=>{});
    chatStops.set(chatId,stop);
  }

  function start(user){
    me=user;ensureButton();stopAll();
    const q=query(collection(db,'chats'),where('participants','array-contains',user.uid));
    stopChats=onSnapshot(q,s=>{
      const alive=new Set();
      s.forEach(d=>{alive.add(d.id);watchChat(d.id,d.data())});
      for(const [id,stop] of chatStops){if(!alive.has(id)){try{stop()}catch{}chatStops.delete(id);seenFirst.delete(id)}}
    },()=>{});
  }

  onAuthStateChanged(auth,user=>{stopAll();me=user||null;if(user)start(user)});
}
