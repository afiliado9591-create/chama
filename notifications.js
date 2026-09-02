import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app);
  let me=null;

  function notificationsAllowed(){
    return typeof Notification!=='undefined'&&Notification.permission==='granted';
  }

  function ensureButton(){
    if(document.getElementById('notifyBtn'))return;
    const logout=document.getElementById('logoutBtn');
    if(!logout)return;
    const b=document.createElement('button');
    b.id='notifyBtn';b.className='iconbtn';b.type='button';
    const refresh=()=>{b.textContent=notificationsAllowed()?'🔔':'🔕';b.title=notificationsAllowed()?'Notificações ativadas':'Ativar notificações'};
    b.onclick=async()=>{
      if(!('Notification'in window))return alert('Seu navegador não oferece notificações.');
      try{
        const p=await Notification.requestPermission();
        refresh();
        if(p==='granted'){
          try{await window.ChamaMessagePush?.register?.(true)}catch{}
          const reg=await navigator.serviceWorker?.ready.catch(()=>null);
          const options={body:'Notificações ativadas.',icon:'./icon.svg',badge:'./icon.svg',tag:'chama-notify-test'};
          if(reg?.showNotification)await reg.showNotification('Chama',options);else new Notification('Chama',options);
        }
      }catch{}
    };
    refresh();logout.parentNode.insertBefore(b,logout);
  }

  onAuthStateChanged(auth,user=>{me=user||null;if(user)ensureButton()});
}
