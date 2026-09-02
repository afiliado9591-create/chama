import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,updateDoc,arrayUnion,serverTimestamp,collection,query,where,onSnapshot,orderBy,limit,getDocs}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import{getMessaging,getToken,isSupported}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging.js";

const app=getApps().length?getApp():null;
if(app){
 const auth=getAuth(app),db=getFirestore(app);let me=null,registered=false,registering=null,stopChats=null,initialReady=false,sentPush=new Set(),lastUpdated=new Map();
 async function getConfig(){const r=await fetch('/api/push-config',{cache:'no-store'});if(!r.ok)throw new Error('push-config');return r.json()}
 async function registerPush(force=false){
  if(!me)return false;if(registered&&!force)return true;if(registering)return registering;
  registering=(async()=>{if(!('Notification'in window)||!('serviceWorker'in navigator)||!(await isSupported()))return false;let p=Notification.permission;if(p!=='granted')p=await Notification.requestPermission();if(p!=='granted')return false;const cfg=await getConfig();if(!cfg?.vapidKey)throw new Error('VAPID não configurado');let reg=await navigator.serviceWorker.getRegistration('/');if(!reg)reg=await navigator.serviceWorker.ready;try{await reg.update()}catch{}const token=await getToken(getMessaging(app),{vapidKey:cfg.vapidKey,serviceWorkerRegistration:reg});if(!token)throw new Error('Token não gerado');await updateDoc(doc(db,'users',me.uid),{pushToken:token,pushTokens:arrayUnion(token),pushEnabled:true,pushOrigin:location.origin,pushUpdatedAt:serverTimestamp()});registered=true;localStorage.setItem('chama_push_ok','1');document.getElementById('pushMessageBanner')?.remove();return true})();
  try{return await registering}finally{registering=null}
 }
 function banner(){if(document.getElementById('pushMessageBanner')||Notification.permission==='denied')return;const d=document.createElement('div');d.id='pushMessageBanner';d.style.cssText='position:fixed;left:12px;right:12px;bottom:14px;z-index:480;background:#fff;border:1px solid #dce8e2;border-radius:14px;padding:12px;box-shadow:0 6px 24px #0002;display:flex;gap:10px;align-items:center;font-family:Arial,sans-serif';d.innerHTML='<div style="flex:1;font-size:13px;color:#25352e"><b>🔔 Receber mensagens com som</b><br><span style="color:#66756e">Ative as notificações deste aparelho.</span></div><button id="pushMessageEnable" style="border:0;border-radius:10px;background:#0b7a53;color:white;font-weight:800;padding:10px 12px">Ativar</button>';document.body.appendChild(d);d.querySelector('#pushMessageEnable').onclick=async()=>{const b=d.querySelector('#pushMessageEnable');b.disabled=true;b.textContent='Ativando...';try{const ok=await registerPush(true);if(!ok){b.textContent='Não ativado';setTimeout(()=>{b.disabled=false;b.textContent='Ativar'},1500)}}catch(e){console.warn('Chama push:',e);b.textContent='Tentar novamente';setTimeout(()=>{b.disabled=false;b.textContent='Ativar'},1800)}}}
 async function sendPush(chatId,messageId){if(!auth.currentUser)return;const key=chatId+':'+messageId;if(sentPush.has(key))return;sentPush.add(key);try{const idToken=await auth.currentUser.getIdToken();await fetch('/api/message-push',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+idToken},body:JSON.stringify({chatId,messageId}),cache:'no-store'})}catch(e){console.warn('Chama mensagem push:',e)}setTimeout(()=>sentPush.delete(key),300000)}
 function stamp(v){const d=v?.toDate?.();return d?d.getTime():0}
 async function sendLatest(chatId){try{const q=query(collection(db,'chats',chatId,'messages'),orderBy('createdAt','desc'),limit(1)),s=await getDocs(q);if(s.empty)return;const d=s.docs[0],m=d.data()||{};if(me&&m.senderId===me.uid)sendPush(chatId,d.id)}catch(e){console.warn('Chama push leitura pontual:',e)}}
 function stopAll(){if(stopChats){stopChats();stopChats=null}initialReady=false;lastUpdated.clear()}
 function start(u){stopAll();const q=query(collection(db,'chats'),where('participants','array-contains',u.uid));stopChats=onSnapshot(q,s=>{
   if(!initialReady){s.forEach(d=>lastUpdated.set(d.id,stamp(d.data()?.updatedAt)));initialReady=true;return}
   for(const ch of s.docChanges()){
     if(ch.type==='removed'){lastUpdated.delete(ch.doc.id);continue}
     const data=ch.doc.data()||{},now=stamp(data.updatedAt),prev=lastUpdated.get(ch.doc.id)||0;lastUpdated.set(ch.doc.id,now);
     if(now&&now!==prev&&data.lastSenderId===u.uid)sendLatest(ch.doc.id)
   }
 },()=>{})}
 onAuthStateChanged(auth,u=>{stopAll();me=u||null;registered=false;document.getElementById('pushMessageBanner')?.remove();if(!u)return;start(u);if(Notification.permission==='granted')registerPush(true).catch(()=>{});else setTimeout(banner,1200)});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&me&&Notification.permission==='granted')registerPush(true).catch(()=>{})});
 window.ChamaMessagePush={register:registerPush};
}
