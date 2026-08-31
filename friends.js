import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,setDoc,collection,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const app=getApps().length?getApp():null;
if(app){
  const auth=getAuth(app),db=getFirestore(app);
  let me=null,friendIds=new Set(),blockedIds=new Set(),usersByEmail=new Map(),stopUsers=null,stopMe=null,scheduled=false;
  const norm=v=>String(v||"").trim().toLowerCase();

  function currentTarget(){const email=norm(document.getElementById("profileEmail")?.textContent);if(!email||email===norm(me?.email))return null;return usersByEmail.get(email)||null}

  function updateRows(){
    document.querySelectorAll("#usersList .user").forEach(row=>{
      const u=usersByEmail.get(norm(row.querySelector(".user-email")?.textContent)),name=row.querySelector(".user-name");if(!u||!name)return;
      const blocked=blockedIds.has(u.uid),friend=!blocked&&friendIds.has(u.uid);
      let mark=name.querySelector(".friend-state");
      const wanted=blocked?"🚫":friend?"⭐":"";
      if(wanted){if(!mark){mark=document.createElement("span");mark.className="friend-state";name.appendChild(mark)}if(mark.textContent!==" "+wanted)mark.textContent=" "+wanted;mark.title=blocked?"Usuário bloqueado":"Amigo"}
      else mark?.remove();
    });
    syncComposer();
  }

  function syncComposer(){const u=usersByEmail.get(norm(document.getElementById("chatEmail")?.textContent)),input=document.getElementById("messageInput"),send=document.querySelector("#composer .send");if(!input||!send)return;const blocked=!!(u?.uid&&blockedIds.has(u.uid));input.disabled=blocked;send.disabled=blocked;input.placeholder=blocked?"Usuário bloqueado":"Digite uma mensagem..."}

  async function save(nextFriends,nextBlocked){await setDoc(doc(db,"users",me.uid),{amigos:[...nextFriends],bloqueados:[...nextBlocked],updatedAt:serverTimestamp()},{merge:true})}
  async function toggleFriend(uid,btn){if(!me||!uid||blockedIds.has(uid))return;const f=new Set(friendIds),b=new Set(blockedIds),adding=!f.has(uid);adding?f.add(uid):f.delete(uid);btn.disabled=true;btn.textContent=adding?"Salvando...":"Removendo...";try{await save(f,b)}catch{alert("Não foi possível atualizar seus amigos.")}finally{btn.disabled=false}}
  async function toggleBlock(uid,btn){if(!me||!uid)return;const f=new Set(friendIds),b=new Set(blockedIds),blocking=!b.has(uid);if(blocking){b.add(uid);f.delete(uid)}else b.delete(uid);btn.disabled=true;btn.textContent=blocking?"Bloqueando...":"Desbloqueando...";try{await save(f,b)}catch{alert("Não foi possível atualizar o bloqueio.")}finally{btn.disabled=false}}

  function refreshActions(){
    const modal=document.getElementById("profileModal"),actions=document.getElementById("profileActions");if(!me||!modal||modal.classList.contains("hidden")||!actions)return;
    const target=currentTarget();if(!target?.uid){actions.querySelector("#friendBtn")?.remove();actions.querySelector("#blockBtn")?.remove();return}
    const blocked=blockedIds.has(target.uid);let friendBtn=actions.querySelector("#friendBtn");
    if(blocked)friendBtn?.remove();else{if(!friendBtn){friendBtn=document.createElement("button");friendBtn.id="friendBtn";friendBtn.className="secondary";actions.appendChild(friendBtn)}const saved=friendIds.has(target.uid),text=saved?"✓ Amigo — remover":"⭐ Adicionar aos amigos";if(friendBtn.textContent!==text)friendBtn.textContent=text;friendBtn.onclick=()=>toggleFriend(target.uid,friendBtn)}
    let blockBtn=actions.querySelector("#blockBtn");if(!blockBtn){blockBtn=document.createElement("button");blockBtn.id="blockBtn";blockBtn.className="secondary";blockBtn.style.color="#b42318";blockBtn.style.borderColor="#f0c5c5";actions.appendChild(blockBtn)}const text=blocked?"Desbloquear usuário":"🚫 Bloquear usuário";if(blockBtn.textContent!==text)blockBtn.textContent=text;blockBtn.onclick=()=>toggleBlock(target.uid,blockBtn);
  }

  function refresh(){scheduled=false;updateRows();refreshActions()}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(refresh)}
  function watch(user){if(stopUsers)stopUsers();if(stopMe)stopMe();stopUsers=onSnapshot(collection(db,"users"),snap=>{usersByEmail=new Map();snap.forEach(d=>{const u=d.data();if(u?.email)usersByEmail.set(norm(u.email),{...u,uid:u.uid||d.id})});schedule()});stopMe=onSnapshot(doc(db,"users",user.uid),s=>{const d=s.exists()?s.data():{};friendIds=new Set(Array.isArray(d.amigos)?d.amigos:[]);blockedIds=new Set(Array.isArray(d.bloqueados)?d.bloqueados:[]);schedule()})}
  function start(){new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});schedule()}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
  onAuthStateChanged(auth,user=>{me=user||null;friendIds=new Set();blockedIds=new Set();if(user)watch(user);else{stopUsers?.();stopMe?.()}});
}
