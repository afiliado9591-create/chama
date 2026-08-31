import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,updateDoc,arrayUnion}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import{getMessaging,getToken,isSupported}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let me=null,registered=false;

  async function getConfig(){
    const r=await fetch('/api/push-config',{cache:'no-store'});
    if(!r.ok)throw new Error('push-config');
    return r.json();
  }

  async function registerPush(){
    if(registered||!me)return false;
    if(!('Notification'in window)||!('serviceWorker'in navigator))return false;
    if(!(await isSupported()))return false;
    let permission=Notification.permission;
    if(permission!=='granted')permission=await Notification.requestPermission();
    if(permission!=='granted')return false;
    const cfg=await getConfig();
    if(!cfg?.vapidKey)throw new Error('VAPID não configurado');
    const reg=await navigator.serviceWorker.ready;
    const messaging=getMessaging(app);
    const token=await getToken(messaging,{vapidKey:cfg.vapidKey,serviceWorkerRegistration:reg});
    if(!token)throw new Error('Token não gerado');
    await updateDoc(doc(db,'users',me.uid),{pushTokens:arrayUnion(token),pushEnabled:true});
    registered=true;
    localStorage.setItem('chama_push_ok','1');
    document.getElementById('pushCallBanner')?.remove();
    return true;
  }

  function banner(){
    if(document.getElementById('pushCallBanner')||Notification.permission==='denied')return;
    const d=document.createElement('div');
    d.id='pushCallBanner';
    d.style.cssText='position:fixed;left:12px;right:12px;bottom:14px;z-index:480;background:#fff;border:1px solid #dce8e2;border-radius:14px;padding:12px;box-shadow:0 6px 24px #0002;display:flex;gap:10px;align-items:center;font-family:Arial,sans-serif';
    d.innerHTML='<div style="flex:1;font-size:13px;color:#25352e"><b>📞 Receber chamadas com o Chama fechado</b><br><span style="color:#66756e">Ative as notificações deste aparelho.</span></div><button id="pushCallEnable" style="border:0;border-radius:10px;background:#0b7a53;color:white;font-weight:800;padding:10px 12px">Ativar</button>';
    document.body.appendChild(d);
    d.querySelector('#pushCallEnable').onclick=async()=>{const b=d.querySelector('#pushCallEnable');b.disabled=true;b.textContent='Ativando...';try{const ok=await registerPush();if(!ok){b.textContent='Não ativado';setTimeout(()=>{b.disabled=false;b.textContent='Ativar'},1500)}}catch(e){console.warn('Chama push:',e);b.textContent='Configuração pendente';setTimeout(()=>{b.disabled=false;b.textContent='Ativar'},1800)}};
  }

  async function notify(calleeId,callId,callerName){
    if(!auth.currentUser)return false;
    try{
      const idToken=await auth.currentUser.getIdToken();
      const r=await fetch('/api/call-push',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+idToken},body:JSON.stringify({calleeId,callId,callerName})});
      return r.ok;
    }catch(e){console.warn('Chama push envio:',e);return false}
  }

  window.ChamaCallPush={notify,register:registerPush};

  onAuthStateChanged(auth,u=>{
    me=u||null;registered=false;
    document.getElementById('pushCallBanner')?.remove();
    if(!u)return;
    if(Notification.permission==='granted')registerPush().catch(()=>{});
    else setTimeout(banner,1200);
  });
}
