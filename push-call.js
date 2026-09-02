import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,updateDoc,arrayUnion,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import{getMessaging,getToken,isSupported}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let me=null,registered=false,registering=null;
  const PUSH_REFRESH_MS=7*24*60*60*1000;

  async function getConfig(){
    const r=await fetch('/api/push-config',{cache:'no-store'});
    if(!r.ok)throw new Error('push-config');
    return r.json();
  }

  async function registerPush(force=false){
    if(!me)return false;
    if(registered&&!force)return true;
    if(registering)return registering;
    registering=(async()=>{
      if(!('Notification'in window)||!('serviceWorker'in navigator))return false;
      if(!(await isSupported()))return false;
      let permission=Notification.permission;
      if(permission!=='granted')permission=await Notification.requestPermission();
      if(permission!=='granted')return false;
      const cfg=await getConfig();
      if(!cfg?.vapidKey)throw new Error('VAPID não configurado');
      let reg=await navigator.serviceWorker.getRegistration('/');
      if(!reg)reg=await navigator.serviceWorker.ready;
      try{await reg.update()}catch{}
      const messaging=getMessaging(app);
      const token=await getToken(messaging,{vapidKey:cfg.vapidKey,serviceWorkerRegistration:reg});
      if(!token)throw new Error('Token não gerado');

      const savedToken=localStorage.getItem('chama_push_token_full')||'';
      const savedAt=Number(localStorage.getItem('chama_push_updated_at')||0);
      const fresh=savedToken===token&&savedAt>0&&(Date.now()-savedAt)<PUSH_REFRESH_MS;

      if(!fresh||force){
        await updateDoc(doc(db,'users',me.uid),{
          pushToken:token,
          pushTokens:arrayUnion(token),
          pushEnabled:true,
          pushOrigin:location.origin,
          pushUpdatedAt:serverTimestamp()
        });
        localStorage.setItem('chama_push_token_full',token);
        localStorage.setItem('chama_push_updated_at',String(Date.now()));
      }

      registered=true;
      localStorage.setItem('chama_push_ok','1');
      localStorage.setItem('chama_push_token',token.slice(-18));
      document.getElementById('pushCallBanner')?.remove();
      return true;
    })();
    try{return await registering}finally{registering=null}
  }

  function banner(){
    if(document.getElementById('pushCallBanner')||Notification.permission==='denied')return;
    const d=document.createElement('div');
    d.id='pushCallBanner';
    d.style.cssText='position:fixed;left:12px;right:12px;bottom:14px;z-index:480;background:#fff;border:1px solid #dce8e2;border-radius:14px;padding:12px;box-shadow:0 6px 24px #0002;display:flex;gap:10px;align-items:center;font-family:Arial,sans-serif';
    d.innerHTML='<div style="flex:1;font-size:13px;color:#25352e"><b>📞 Receber chamadas com o Chama fechado</b><br><span style="color:#66756e">Ative as notificações deste aparelho.</span></div><button id="pushCallEnable" style="border:0;border-radius:10px;background:#0b7a53;color:white;font-weight:800;padding:10px 12px">Ativar</button>';
    document.body.appendChild(d);
    d.querySelector('#pushCallEnable').onclick=async()=>{const b=d.querySelector('#pushCallEnable');b.disabled=true;b.textContent='Ativando...';try{const ok=await registerPush(true);if(!ok){b.textContent='Não ativado';setTimeout(()=>{b.disabled=false;b.textContent='Ativar'},1500)}}catch(e){console.warn('Chama push:',e);b.textContent='Configuração pendente';setTimeout(()=>{b.disabled=false;b.textContent='Ativar'},1800)}};
  }

  async function notify(calleeId,callId,callerName){
    if(!auth.currentUser)return{ok:false,reason:'sem_login'};
    try{
      const idToken=await auth.currentUser.getIdToken(true);
      const r=await fetch('/api/call-push',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+idToken},body:JSON.stringify({calleeId,callId,callerName}),cache:'no-store'});
      let data={};try{data=await r.json()}catch{}
      return{ok:r.ok&&Number(data.sent||0)>0,status:r.status,...data};
    }catch(e){console.warn('Chama push envio:',e);return{ok:false,reason:e?.message||'erro'}}
  }

  window.ChamaCallPush={notify,register:registerPush};

  onAuthStateChanged(auth,u=>{
    me=u||null;registered=false;
    document.getElementById('pushCallBanner')?.remove();
    if(!u)return;
    if(Notification.permission==='granted')registerPush(false).catch(()=>{});
    else setTimeout(banner,1200);
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&me&&Notification.permission==='granted')registerPush(false).catch(()=>{})});
}
