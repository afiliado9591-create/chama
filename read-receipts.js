import{getApps,initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,collection,query,where,getDocs,orderBy,limit,onSnapshot,doc,updateDoc,serverTimestamp,writeBatch}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyCcAVkmLUKPcEMZ5erDswbOQ8eO493pl2I",authDomain:"chama-cfc28.firebaseapp.com",projectId:"chama-cfc28",storageBucket:"chama-cfc28.firebasestorage.app",messagingSenderId:"680045231088",appId:"1:680045231088:web:8db35684e4b56a320ebb35"};
const app=getApps()[0]||initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const PREFIX="__CHAMA_MEDIA__";
let me=null,activeChatId="",activeOtherUid="",stopReceipts=null,startTimer=null,lastEmail="";
const messageCache=new Map();

function addStyle(){
  if(document.getElementById("chamaReceiptStyle"))return;
  const s=document.createElement("style");
  s.id="chamaReceiptStyle";
  s.textContent=`.chama-receipt{display:inline-block;margin-left:4px;font-size:10px;font-weight:900;letter-spacing:-1px;color:#0b7a53;vertical-align:baseline}.chama-receipt.seen{color:#1685e6;letter-spacing:-2px}`;
  document.head.appendChild(s);
}
function isAudio(text=""){
  if(!String(text).startsWith(PREFIX))return false;
  try{return JSON.parse(String(text).slice(PREFIX.length))?.kind==="audio"}catch{return false}
}
function tsValue(v){return v?.toMillis?.()||0}
function visibleChatEmail(){
  const active=document.getElementById("activeChat");
  if(!active||active.classList.contains("hidden"))return"";
  return(document.getElementById("chatEmail")?.textContent||"").trim();
}
async function resolveUid(email){
  const s=await getDocs(query(collection(db,"users"),where("email","==",email),limit(1)));
  let uid="";s.forEach(d=>uid=d.id);return uid;
}
function clearReceiptListener(){
  if(stopReceipts){stopReceipts();stopReceipts=null}
  activeChatId="";activeOtherUid="";messageCache.clear();
}
function receiptFor(m){return isAudio(m.text)?m.playedAt:m.seenAt}
function renderReceipts(docs){
  const bubbles=[...document.querySelectorAll("#messages .bubble")];
  if(!bubbles.length)return;
  const ordered=[...docs].sort((a,b)=>tsValue(a.data().createdAt)-tsValue(b.data().createdAt));
  const slice=bubbles.slice(-ordered.length);
  ordered.forEach((snap,i)=>{
    const b=slice[i];if(!b)return;
    const m=snap.data();
    b.dataset.messageId=snap.id;
    messageCache.set(snap.id,m);
    let r=b.querySelector(".chama-receipt");
    if(m.senderId!==me?.uid){if(r)r.remove();return}
    if(!r){r=document.createElement("span");r.className="chama-receipt";const t=b.querySelector(".time");(t||b).appendChild(r)}
    const seen=!!receiptFor(m);
    r.textContent=seen?"●●":"●";
    r.classList.toggle("seen",seen);
    r.title=seen?(isAudio(m.text)?"Áudio aberto":"Mensagem vista"):"Mensagem entregue";
  });
}
async function markVisibleSeen(docs){
  if(!activeChatId||!me)return;
  const pending=docs.filter(s=>{const m=s.data();return m.receiverId===me.uid&&!m.seenAt&&!isAudio(m.text)});
  if(!pending.length)return;
  const batch=writeBatch(db);
  pending.forEach(s=>batch.update(doc(db,"chats",activeChatId,"messages",s.id),{seenAt:serverTimestamp()}));
  try{await batch.commit()}catch(e){console.warn("Chama: não foi possível marcar mensagens como vistas.",e)}
}
async function startForCurrentChat(){
  if(!me)return;
  const email=visibleChatEmail();
  if(!email){clearReceiptListener();lastEmail="";return}
  if(email===lastEmail&&stopReceipts)return;
  lastEmail=email;clearReceiptListener();
  try{
    const otherUid=await resolveUid(email);if(!otherUid||!me)return;
    activeOtherUid=otherUid;activeChatId=[me.uid,otherUid].sort().join("_");
    const q=query(collection(db,"chats",activeChatId,"messages"),orderBy("createdAt","desc"),limit(50));
    stopReceipts=onSnapshot(q,s=>{
      const docs=s.docs;
      renderReceipts(docs);
      markVisibleSeen(docs);
      requestAnimationFrame(()=>renderReceipts(docs));
    },e=>console.warn("Chama: recibos de leitura indisponíveis.",e));
  }catch(e){console.warn("Chama: não foi possível iniciar recibos.",e)}
}
function scheduleStart(){clearTimeout(startTimer);startTimer=setTimeout(startForCurrentChat,120)}
function observeChat(){
  addStyle();
  const email=document.getElementById("chatEmail"),messages=document.getElementById("messages"),active=document.getElementById("activeChat");
  if(email)new MutationObserver(scheduleStart).observe(email,{childList:true,characterData:true,subtree:true});
  if(active)new MutationObserver(scheduleStart).observe(active,{attributes:true,attributeFilter:["class"]});
  if(messages)new MutationObserver(()=>{if(stopReceipts)scheduleStart()}).observe(messages,{childList:true});
  document.addEventListener("chama-media-played",async e=>{
    const id=e.detail?.messageId,m=messageCache.get(id);
    if(!id||!m||!me||m.receiverId!==me.uid||!isAudio(m.text)||m.playedAt)return;
    try{await updateDoc(doc(db,"chats",activeChatId,"messages",id),{playedAt:serverTimestamp()})}catch(err){console.warn("Chama: não foi possível marcar áudio como aberto.",err)}
  });
  scheduleStart();
}
onAuthStateChanged(auth,u=>{me=u||null;if(!me){clearReceiptListener();lastEmail=""}else scheduleStart()});
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",observeChat,{once:true}):observeChat();