(()=>{
'use strict';
const PREFIX='__CHAMA_MEDIA__';
let fs=null,authMod=null,db=null,auth=null,ready=false,recording=false,recorder=null,chunks=[],stream=null;
const $=id=>document.getElementById(id);
function toast(msg){let n=$('chamaSendToast');if(!n){n=document.createElement('div');n.id='chamaSendToast';n.style='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#14221c;color:#fff;padding:10px 15px;border-radius:999px;z-index:20000;font-size:14px;max-width:90vw;text-align:center';document.body.appendChild(n)}n.textContent=msg;n.hidden=false;clearTimeout(n._t);n._t=setTimeout(()=>n.hidden=true,3500)}
function currentReceiverUid(){
  const direct=String(window.__chamaActiveUid||$('activeChat')?.dataset?.uid||'').trim();
  if(direct)return direct;
  const email=($('chatEmail')?.textContent||'').trim().toLowerCase();
  if(!email)return '';
  for(const r of document.querySelectorAll('#usersList .user')){
    const re=(r.querySelector('.user-email')?.textContent||'').trim().toLowerCase();
    const uid=String(r.dataset.uid||'').trim();
    if(uid&&re===email){window.__chamaActiveUid=uid;$('activeChat')?.setAttribute('data-uid',uid);return uid}
  }
  return '';
}
function chatId(a,b){return[a,b].sort().join('_')}
function keepLatestMessageVisible(){
  const box=$('messages'),composer=$('composer');
  if(!box)return;
  const extra=Math.max(24,(composer?.getBoundingClientRect?.().height||0)+18);
  box.style.paddingBottom=extra+'px';
  const run=()=>{box.scrollTop=box.scrollHeight;box.lastElementChild?.scrollIntoView?.({block:'end',behavior:'auto'})};
  requestAnimationFrame(()=>{run();setTimeout(run,80);setTimeout(run,220)});
}
async function init(){try{const app=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');const apps=app.getApps();if(!apps.length)return;const a=apps[0];auth=authMod.getAuth(a);db=fs.getFirestore(a);ready=true}catch(e){console.error('Chama envio init',e)}}
async function ensureChat(me,other){const id=chatId(me.uid,other);await fs.setDoc(fs.doc(db,'chats',id),{participants:[me.uid,other],updatedAt:fs.serverTimestamp()},{merge:true});return id}
function removeLegacyMediaButtons(){const selectors=['#imageBtn','#videoBtn','.image-send-btn','.video-send-btn','.chama-media-pick'];document.querySelectorAll(selectors.join(',')).forEach(el=>{if(!el.id?.startsWith('chamaMediaBtn_'))el.remove()});document.querySelectorAll('button[title="Enviar imagem"],button[title="Enviar vídeo"],button[aria-label="Enviar imagem"],button[aria-label="Enviar vídeo"]').forEach(el=>{if(el.id!=='chamaMediaBtn_image'&&el.id!=='chamaMediaBtn_video')el.remove()});document.querySelectorAll('button[title="Gravar áudio"],button[aria-label="Gravar áudio"]').forEach(el=>{if(el.id!=='audioBtn')el.remove()})}
async function sendText(e){
  e.preventDefault();
  e.stopImmediatePropagation();
  if(!ready)await init();
  const me=auth?.currentUser,other=currentReceiverUid(),input=$('messageInput'),text=(input?.value||'').trim();
  if(!me){toast('Sua sessão expirou. Entre novamente no Chama.');return false}
  if(!other){toast('Não consegui identificar o contato. Feche e abra o contato novamente.');return false}
  if(!text)return false;
  const button=$('composer')?.querySelector('.send');if(button)button.disabled=true;
  try{
    const id=await ensureChat(me,other);
    await fs.addDoc(fs.collection(db,'chats',id,'messages'),{senderId:me.uid,receiverId:other,from:me.uid,to:other,text,createdAt:fs.serverTimestamp()});
    await fs.setDoc(fs.doc(db,'chats',id),{participants:[me.uid,other],lastMessage:text,lastSenderId:me.uid,updatedAt:fs.serverTimestamp(),['unread_'+other]:fs.increment(1)},{merge:true});
    input.value='';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    keepLatestMessageVisible();
    requestAnimationFrame(()=>input.focus({preventScroll:true}));
    return true;
  }catch(err){
    console.error('Chama enviar texto',err);
    const code=String(err?.code||'');
    if(code==='permission-denied')toast('O Firebase está bloqueando o envio. As regras do Firestore precisam ser publicadas.');
    else toast(err?.message||'Não foi possível enviar a mensagem.');
    requestAnimationFrame(()=>input?.focus({preventScroll:true}));
    return false;
  }finally{if(button)button.disabled=false}
}
async function upload(file,kind){if(!ready)await init();const me=auth?.currentUser,other=currentReceiverUid();if(!me||!other){toast('Não consegui identificar o contato desta conversa.');return false}const limits={image:5*1024*1024,video:25*1024*1024,audio:10*1024*1024};if(!file||!file.type?.startsWith(kind+'/')){toast('Arquivo inválido.');return false}if(file.size>limits[kind]){toast('Arquivo muito grande.');return false}const label=kind==='image'?'imagem':kind==='video'?'vídeo':'áudio';toast('Enviando '+label+'...');try{const token=await me.getIdToken();const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name||('chama-'+kind))},body:file});const data=await r.json().catch(()=>({}));if(!r.ok||!data.url)throw new Error(data.error||('Falha no envio da '+label+'.'));const id=await ensureChat(me,other),text=PREFIX+JSON.stringify({kind,url:data.url,key:data.key||''});await fs.addDoc(fs.collection(db,'chats',id,'messages'),{from:me.uid,to:other,senderId:me.uid,receiverId:other,text,createdAt:fs.serverTimestamp()});await fs.setDoc(fs.doc(db,'chats',id),{participants:[me.uid,other],lastMessage:kind==='image'?'📷 Imagem':kind==='video'?'🎥 Vídeo':'🎤 Áudio',lastSenderId:me.uid,updatedAt:fs.serverTimestamp(),['unread_'+other]:fs.increment(1)},{merge:true});keepLatestMessageVisible();toast('Enviado.');return true}catch(err){console.error('Chama mídia',err);toast(err.message||('Não foi possível enviar a '+label+'.'));return false}}
function addPicker(kind,icon){const form=$('composer');if(!form||document.getElementById('chamaMediaBtn_'+kind))return;const b=document.createElement('button');b.type='button';b.id='chamaMediaBtn_'+kind;b.className='audio-record';b.title=kind==='image'?'Enviar imagem':'Enviar vídeo';b.textContent=icon;const input=document.createElement('input');input.type='file';input.accept=kind+'/*';input.hidden=true;input.addEventListener('change',async()=>{const f=input.files?.[0];input.value='';if(f)await upload(f,kind)});b.onclick=()=>input.click();form.insertBefore(b,$('messageInput'));form.appendChild(input)}
async function toggleAudio(){if(!ready)await init();if(recording&&recorder){recorder.stop();return}try{stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recording=true;$('audioBtn').classList.add('recording');toast('Gravando áudio. Toque no 🎤 para enviar.');recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=async()=>{recording=false;$('audioBtn').classList.remove('recording');stream?.getTracks().forEach(t=>t.stop());const type=recorder.mimeType||'audio/webm';const blob=new Blob(chunks,{type});await upload(new File([blob],'audio.webm',{type}),'audio')};recorder.start()}catch(e){console.error(e);toast(e.message||'Não foi possível acessar o microfone.')}}
function bind(){removeLegacyMediaButtons();keepLatestMessageVisible();const form=$('composer');if(form&&!form.dataset.chamaSendV4){form.dataset.chamaSendV4='1';form.addEventListener('submit',sendText,true)}const audio=$('audioBtn');if(audio&&!audio.dataset.chamaAudioV4){audio.dataset.chamaAudioV4='1';audio.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();toggleAudio()}}addPicker('image','📷');addPicker('video','🎥')}
async function start(){await init();bind();setInterval(bind,1200)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();