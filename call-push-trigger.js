import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,collection,query,where,getDocs}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  async function trigger(){
    const me=auth.currentUser;if(!me)return;
    await new Promise(r=>setTimeout(r,1100));
    try{
      const s=await getDocs(query(collection(db,'calls'),where('callerId','==',me.uid)));
      let best=null;
      s.forEach(d=>{const x=d.data();if(x.status!=='ringing')return;const ms=x.createdAt?.toMillis?.()||0;if(!best||ms>best.ms)best={id:d.id,data:x,ms}});
      if(!best)return;
      const age=best.ms?Date.now()-best.ms:0;if(best.ms&&age>30000)return;
      await window.ChamaCallPush?.notify(best.data.calleeId,best.id,best.data.callerName||'Alguém');
    }catch(e){console.warn('Chama push chamada:',e)}
  }
  document.addEventListener('click',e=>{if(e.target?.closest?.('#voiceCallBtn'))trigger()},true);
}
