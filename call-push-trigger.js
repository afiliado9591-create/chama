import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,collection,query,where,onSnapshot}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let stop=null;
  const sent=new Set();

  async function sendCall(id,data){
    if(!id||!data||sent.has(id)||data.status!=="ringing")return;
    const ms=data.createdAt?.toMillis?.()||0;
    if(ms&&Date.now()-ms>45000)return;
    sent.add(id);
    try{
      const ok=await window.ChamaCallPush?.notify(data.calleeId,id,data.callerName||"Alguém");
      if(!ok){
        sent.delete(id);
        console.warn("Chama push chamada: envio não confirmado");
      }
    }catch(e){
      sent.delete(id);
      console.warn("Chama push chamada:",e);
    }
  }

  onAuthStateChanged(auth,u=>{
    stop?.();stop=null;sent.clear();
    if(!u)return;
    const q=query(collection(db,"calls"),where("callerId","==",u.uid));
    stop=onSnapshot(q,s=>{
      for(const ch of s.docChanges()){
        if(ch.type==="removed")continue;
        const d=ch.doc.data();
        if(d.status==="ringing")sendCall(ch.doc.id,d);
      }
    },e=>console.warn("Chama push listener:",e));
  });
}
