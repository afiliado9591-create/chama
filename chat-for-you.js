(()=>{
  const STYLE_ID='chamaChatForYouStyleV1';let db=null,fs=null,activeUid='';const cache=new Map();
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
    .chama-chat-for-you{margin-left:auto;flex:0 0 auto;border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(135deg,#ff4f81,#d92d6d);color:#fff;text-decoration:none;font-size:13px;font-weight:900;white-space:nowrap;box-shadow:0 3px 10px #d92d6d35}
    .chat-head>div:has(#chatName){flex:1;min-width:0}.chat-head #chatName{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .chama-chat-for-you:active{transform:scale(.97)}
    @media(max-width:380px){.chama-chat-for-you{font-size:12px;padding:8px 9px}}
  `;document.head.appendChild(s)}
  function safeUrl(v){try{const u=new URL(String(v||'').trim());return u.protocol==='https:'?u.href:''}catch{return ''}}
  async function config(uid){if(cache.has(uid))return cache.get(uid);try{const s=await fs.getDoc(fs.doc(db,'appConfig',`forYou_${uid}`)),d=s.data()||{},value={enabled:d.enabled===true,url:safeUrl(d.url),label:String(d.label||'Pra você').trim().slice(0,24)||'Pra você'};cache.set(uid,value);return value}catch{return {enabled:false,url:'',label:'Pra você'}}}
  async function show(uid){activeUid=String(uid||'');document.getElementById('chamaChatForYou')?.remove();if(!activeUid||!db||!fs)return;const d=await config(activeUid);if(activeUid!==uid||!d.enabled||!d.url)return;const head=document.querySelector('#activeChat .chat-head')||document.querySelector('.chat-head');if(!head)return;const a=document.createElement('a');a.id='chamaChatForYou';a.className='chama-chat-for-you';a.href=d.url;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent=d.label;a.title=`Abrir link de ${d.label}`;head.appendChild(a)}
  async function start(attempt=0){style();try{const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),app=appMod.getApps()[0];if(!app){if(attempt<30)setTimeout(()=>start(attempt+1),120);return}fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');db=fs.getFirestore(app);document.addEventListener('chama-chat-opened',e=>show(String(e.detail?.uid||'')));document.addEventListener('chama-for-you-updated',e=>{const uid=String(e.detail?.uid||'');cache.delete(uid);if(uid===activeUid)show(uid)})}catch(e){console.warn('Chama: botão Pra você não iniciou',e)}}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>start(),{once:true}):start();
})();
