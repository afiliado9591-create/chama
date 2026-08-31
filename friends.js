import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,setDoc,collection,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let me=null,friendIds=new Set(),blockedIds=new Set(),usersByEmail=new Map(),stopUsers=null,stopMe=null;

  function normalizeEmail(v=""){return String(v).trim().toLowerCase()}
  function currentTarget(){
    const email=normalizeEmail(document.getElementById("profileEmail")?.textContent||"");
    if(!email||email===normalizeEmail(me?.email||""))return null;
    return usersByEmail.get(email)||null;
  }

  function markRows(){
    document.querySelectorAll("#usersList .user").forEach(row=>{
      const email=normalizeEmail(row.querySelector(".user-email")?.textContent||"");
      const u=usersByEmail.get(email),name=row.querySelector(".user-name");
      if(!u||!name)return;
      name.querySelector(".friend-star")?.remove();
      name.querySelector(".blocked-mark")?.remove();
      if(blockedIds.has(u.uid)){
        const x=document.createElement("span");x.className="blocked-mark";x.textContent=" 🚫";x.title="Usuário bloqueado";name.appendChild(x);row.dataset.blocked="1";
      }else{
        row.dataset.blocked="0";
        if(friendIds.has(u.uid)){const s=document.createElement("span");s.className="friend-star";s.textContent=" ⭐";s.title="Amigo";name.appendChild(s)}
      }
    });
    syncComposerBlock();
  }

  function syncComposerBlock(){
    const email=normalizeEmail(document.getElementById("chatEmail")?.textContent||"");
    const u=usersByEmail.get(email),input=document.getElementById("messageInput"),send=document.querySelector("#composer .send"),form=document.getElementById("composer");
    if(!input||!send||!form)return;
    const blocked=!!(u?.uid&&blockedIds.has(u.uid));
    input.disabled=blocked;send.disabled=blocked;
    input.placeholder=blocked?"Usuário bloqueado":"Digite uma mensagem...";
    form.dataset.blocked=blocked?"1":"0";
  }

  function watchData(user){
    if(stopUsers)stopUsers();if(stopMe)stopMe();
    stopUsers=onSnapshot(collection(db,"users"),snap=>{
      usersByEmail=new Map();snap.forEach(d=>{const u=d.data();if(u?.email)usersByEmail.set(normalizeEmail(u.email),{...u,uid:u.uid||d.id})});
      markRows();refreshActions();
    });
    stopMe=onSnapshot(doc(db,"users",user.uid),s=>{
      const data=s.exists()?s.data():{};
      friendIds=new Set(Array.isArray(data.amigos)?data.amigos:[]);
      blockedIds=new Set(Array.isArray(data.bloqueados)?data.bloqueados:[]);
      markRows();refreshActions();
    });
  }

  async function saveLists(nextFriends,nextBlocked){
    await setDoc(doc(db,"users",me.uid),{amigos:[...nextFriends],bloqueados:[...nextBlocked],updatedAt:serverTimestamp()},{merge:true});
  }

  async function toggleFriend(uid,btn){
    if(!me||!uid||blockedIds.has(uid))return;
    const nextFriends=new Set(friendIds),nextBlocked=new Set(blockedIds),adding=!nextFriends.has(uid);
    adding?nextFriends.add(uid):nextFriends.delete(uid);
    btn.disabled=true;btn.textContent=adding?"Salvando...":"Removendo...";
    try{await saveLists(nextFriends,nextBlocked)}catch{alert("Não foi possível atualizar seus amigos.")}finally{btn.disabled=false}
  }

  async function toggleBlock(uid,btn){
    if(!me||!uid)return;
    const nextFriends=new Set(friendIds),nextBlocked=new Set(blockedIds),blocking=!nextBlocked.has(uid);
    if(blocking){nextBlocked.add(uid);nextFriends.delete(uid)}else nextBlocked.delete(uid);
    btn.disabled=true;btn.textContent=blocking?"Bloqueando...":"Desbloqueando...";
    try{await saveLists(nextFriends,nextBlocked)}catch{alert("Não foi possível atualizar o bloqueio.")}finally{btn.disabled=false}
  }

  function refreshActions(){
    const modal=document.getElementById("profileModal"),actions=document.getElementById("profileActions");
    if(!me||!modal||modal.classList.contains("hidden")||!actions)return;
    const target=currentTarget();
    if(!target?.uid){actions.querySelector("#friendBtn")?.remove();actions.querySelector("#blockBtn")?.remove();return}
    const blocked=blockedIds.has(target.uid);
    let friendBtn=actions.querySelector("#friendBtn");
    if(blocked){friendBtn?.remove()}else{
      if(!friendBtn){friendBtn=document.createElement("button");friendBtn.id="friendBtn";friendBtn.className="secondary";actions.appendChild(friendBtn)}
      const saved=friendIds.has(target.uid);friendBtn.textContent=saved?"✓ Amigo — remover":"⭐ Adicionar aos amigos";friendBtn.onclick=()=>toggleFriend(target.uid,friendBtn);
    }
    let blockBtn=actions.querySelector("#blockBtn");
    if(!blockBtn){blockBtn=document.createElement("button");blockBtn.id="blockBtn";blockBtn.className="secondary";blockBtn.style.color="#b42318";blockBtn.style.borderColor="#f0c5c5";actions.appendChild(blockBtn)}
    blockBtn.textContent=blocked?"Desbloquear usuário":"🚫 Bloquear usuário";blockBtn.onclick=()=>toggleBlock(target.uid,blockBtn);
  }

  document.addEventListener("click",e=>{
    const row=e.target.closest?.("#usersList .user");
    if(row?.dataset.blocked==="1"){
      const email=normalizeEmail(row.querySelector(".user-email")?.textContent||"");const u=usersByEmail.get(email);
      if(u?.uid&&blockedIds.has(u.uid)){e.preventDefault();e.stopImmediatePropagation();alert("Você bloqueou este usuário. Desbloqueie pelo perfil para conversar.")}
    }
  },true);

  const obs=new MutationObserver(()=>{markRows();refreshActions()});
  function start(){obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]});markRows();refreshActions()}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();

  onAuthStateChanged(auth,user=>{
    me=user||null;friendIds=new Set();blockedIds=new Set();
    if(user)watchData(user);else{if(stopUsers)stopUsers();if(stopMe)stopMe()}
  });
}
