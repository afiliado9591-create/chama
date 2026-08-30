import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc,collection,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let me=null,friendIds=new Set(),usersByEmail=new Map(),stopUsers=null,stopMe=null;

  function normalizeEmail(v=""){return String(v).trim().toLowerCase()}

  function markFriendRows(){
    document.querySelectorAll("#usersList .user").forEach(row=>{
      const email=normalizeEmail(row.querySelector(".user-email")?.textContent||"");
      const u=usersByEmail.get(email);
      const name=row.querySelector(".user-name");
      if(!u||!name)return;
      let star=name.querySelector(".friend-star");
      if(friendIds.has(u.uid)){
        if(!star){star=document.createElement("span");star.className="friend-star";star.textContent=" ⭐";star.title="Amigo";name.appendChild(star)}
      }else if(star)star.remove();
    });
  }

  function watchData(user){
    if(stopUsers)stopUsers();if(stopMe)stopMe();
    stopUsers=onSnapshot(collection(db,"users"),snap=>{
      usersByEmail=new Map();snap.forEach(d=>{const u=d.data();if(u?.email)usersByEmail.set(normalizeEmail(u.email),{...u,uid:u.uid||d.id})});
      markFriendRows();refreshFriendButton();
    });
    stopMe=onSnapshot(doc(db,"users",user.uid),s=>{
      const data=s.exists()?s.data():{};friendIds=new Set(Array.isArray(data.amigos)?data.amigos:[]);
      markFriendRows();refreshFriendButton();
    });
  }

  async function toggleFriend(uid,btn){
    if(!me||!uid)return;
    const next=new Set(friendIds);
    const saving=!next.has(uid);
    saving?next.add(uid):next.delete(uid);
    btn.disabled=true;btn.textContent=saving?"Salvando...":"Removendo...";
    try{
      await setDoc(doc(db,"users",me.uid),{amigos:[...next],updatedAt:serverTimestamp()},{merge:true});
    }catch(e){
      alert("Não foi possível atualizar seus amigos.");
    }finally{btn.disabled=false}
  }

  function refreshFriendButton(){
    const modal=document.getElementById("profileModal");
    const actions=document.getElementById("profileActions");
    const emailEl=document.getElementById("profileEmail");
    if(!me||!modal||modal.classList.contains("hidden")||!actions||!emailEl)return;
    const email=normalizeEmail(emailEl.textContent||"");
    if(!email||email===normalizeEmail(me.email||"")){
      actions.querySelector("#friendBtn")?.remove();return;
    }
    const target=usersByEmail.get(email);
    if(!target?.uid)return;
    let btn=actions.querySelector("#friendBtn");
    if(!btn){
      btn=document.createElement("button");btn.id="friendBtn";btn.className="secondary";actions.appendChild(btn);
    }
    const saved=friendIds.has(target.uid);
    btn.textContent=saved?"✓ Amigo — remover":"⭐ Salvar como amigo";
    btn.onclick=()=>toggleFriend(target.uid,btn);
  }

  const obs=new MutationObserver(()=>{markFriendRows();refreshFriendButton()});
  function start(){
    const root=document.body;obs.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]});
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();

  onAuthStateChanged(auth,user=>{
    me=user||null;friendIds=new Set();
    if(user)watchData(user);else{if(stopUsers)stopUsers();if(stopMe)stopMe()}
  });
}
