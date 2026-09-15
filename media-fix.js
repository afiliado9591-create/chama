(()=>{
  const PREFIX='__CHAMA_MEDIA__';
  let ready=false,recording=null,chunks=[],stream=null;
  const $=id=>document.getElementById(id);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function firebase(){
    for(let i=0;i<50;i++){
      try{
        const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
        const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');
        const fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
        const app=appMod.getApps()[0];
        const auth=authMod.getAuth(app), me=auth.currentUser;
        if(me)return {me,db:fs.getFirestore(app),fs};
      }catch(e){}
      await sleep(200);
    }
    throw new Error('Sessão não pronta. Tente novamente.');
  }
  async function receiverUid(ctx){
    const email=($('chatEmail')?.textContent||'').trim().toLowerCase();
    if(!email)throw new Error('Abra uma conversa antes de enviar.');
    const rows=[...document.querySelectorAll('#usersList .user')];
    const row=rows.find(r=>(r.querySelector('.user-email')?.textContent||'').trim().toLowerCase()===email);
    if(row?.dataset?.uid)return row.dataset.uid;
    const {fs}=ctx;
    const q=fs.query(fs.collection(ctx.db,'users'),fs.where('email','==',email),fs.limit(1));
    const snap=await fs.getDocs(q);
    if(snap.empty)throw new Error('Não consegui identificar o contato.');
    return snap.docs[0].id;
  }
  function chatId(a,b){return[a,b].sort().join('_')}
  function toast(text){
    let n=$('chamaMediaToast');
    if(!n){n=document.createElement('div');n.id='chamaMediaToast';n.style.cssText='position:fixed;left:50%;bottom:82px;transform:translateX(-50%);z-index:2000;background:#14221c;color:#fff;padding:10px 15px;border-radius:999px;font:600 14px system-ui;box-shadow:0 5px 25px #0003';document.body.appendChild(n)}
    n.textContent=text;n.hidden=false;return()=>n.hidden=true;
  }
  async function sendFile(file,kind){
    const limits={image:5*1024*1024,video:25*1024*1024,audio:10*1024*1024};
    const prefixes={image:'image/',video:'video/',audio:'audio/'};
    if(!file||!file.type?.startsWith(prefixes[kind]))throw new Error(`Arquivo de ${kind} inválido.`);
    if(file.size>limits[kind])throw new Error(`${kind==='image'?'Imagem':kind==='video'?'Vídeo':'Áudio'} muito grande. Limite: ${limits[kind]/1024/1024} MB.`);
    const ctx=await firebase();
    const other=await receiverUid(ctx), ids=[ctx.me.uid,other].sort(), cid=chatId(ctx.me.uid,other);
    const hide=toast(`Enviando ${kind==='image'?'imagem':kind==='video'?'vídeo':'áudio'}...`);
    try{
      const token=await ctx.me.getIdToken();
      const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name||`audio.${file.type.split('/')[1]||'webm'}`)},body:file});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||'Falha ao enviar a mídia.');
      const text=PREFIX+JSON.stringify({kind,url:data.url,key:data.key||''});
      const msg={from:ctx.me.uid,to:other,senderId:ctx.me.uid,receiverId:other,text,createdAt:ctx.fs.serverTimestamp()};
      await ctx.fs.setDoc(ctx.fs.doc(ctx.db,'chats',cid),{participants:ids,updatedAt:ctx.fs.serverTimestamp(),lastMessage:kind==='image'?'📷 Imagem':kind==='video'?'🎥 Vídeo':'🎤 Áudio',lastSenderId:ctx.me.uid},{merge:true});
      await ctx.fs.addDoc(ctx.fs.collection(ctx.db,'chats',cid,'messages'),msg);
      return true;
    }finally{hide()}
  }
  function pick(kind){
    const input=document.createElement('input');input.type='file';input.accept=kind==='image'?'image/*':kind==='video'?'video/*':'audio/*';input.hidden=true;
    document.body.appendChild(input);input.onchange=async()=>{const f=input.files?.[0];input.remove();if(!f)return;try{await sendFile(f,kind)}catch(e){alert(e.message||'Não foi possível enviar a mídia.')}};input.click();
  }
  async function startAudio(){
    if(recording?.state==='recording'){recording.stop();return}
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Seu navegador não permite gravação de áudio.');
      stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];
      const preferred=['audio/webm;codecs=opus','audio/webm','audio/mp4'];
      const mime=preferred.find(x=>window.MediaRecorder?.isTypeSupported?.(x));
      recording=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
      recording.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      recording.onstop=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;const blob=new Blob(chunks,{type:recording.mimeType||'audio/webm'});const file=new File([blob],`audio-${Date.now()}.webm`,{type:blob.type});recording=null;chunks=[];showAudioPreview(file)};
      recording.start(250);$('audioBtn')?.classList.add('recording');
      if($('audioBtn'))$('audioBtn').textContent='⏹️';
    }catch(e){stream?.getTracks().forEach(t=>t.stop());stream=null;recording=null;alert(e.message||'Não foi possível gravar áudio.')}
  }
  function showAudioPreview(file){
    document.querySelector('.chama-audio-preview')?.remove();
    const url=URL.createObjectURL(file),back=document.createElement('div');back.className='chama-audio-preview';back.style.cssText='position:fixed;inset:0;background:#0008;z-index:1900;display:grid;place-items:center;padding:18px';
    back.innerHTML='<section style="width:min(430px,100%);background:#fff;border-radius:20px;padding:18px;display:grid;gap:14px;font-family:system-ui"><strong>Confira o áudio antes de enviar</strong><audio controls style="width:100%"></audio><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button type="button" class="aud-del">Excluir</button><button type="button" class="aud-send">Enviar áudio</button></div></section>';
    back.querySelector('audio').src=url;
    const close=()=>{URL.revokeObjectURL(url);back.remove();resetMic()};
    back.querySelector('.aud-del').onclick=close;back.onclick=e=>{if(e.target===back)close()};
    back.querySelector('.aud-send').onclick=async e=>{const b=e.currentTarget;b.disabled=true;b.textContent='Enviando...';try{await sendFile(file,'audio');close()}catch(err){b.disabled=false;b.textContent='Enviar áudio';alert(err.message||'Não foi possível enviar o áudio.')}};
    document.body.appendChild(back);
  }
  function resetMic(){if($('audioBtn')){$('audioBtn').classList.remove('recording');$('audioBtn').textContent='🎤'}}
  function addButtons(){
    const form=$('composer'),input=$('messageInput');if(!form||!input)return false;
    if(!$('imageBtn')){const b=document.createElement('button');b.id='imageBtn';b.type='button';b.className='image-send-btn';b.title='Enviar imagem';b.textContent='📷';b.onclick=()=>pick('image');form.insertBefore(b,input)}
    if(!$('videoBtn')){const b=document.createElement('button');b.id='videoBtn';b.type='button';b.className='video-send-btn';b.title='Enviar vídeo';b.textContent='🎥';b.onclick=()=>pick('video');form.insertBefore(b,input)}
    const audio=$('audioBtn');if(audio&&!audio.dataset.mediaFix){audio.dataset.mediaFix='1';audio.onclick=startAudio}
    return true;
  }
  function fastText(){
    const form=$('composer');if(!form||form.dataset.mediaFixText)return;
    form.dataset.mediaFixText='1';
    form.onsubmit=async e=>{e.preventDefault();const input=$('messageInput');const text=input?.value.trim();if(!text)return;const ctx=await firebase().catch(err=>{alert(err.message);return null});if(!ctx)return;const other=await receiverUid(ctx).catch(err=>{alert(err.message);return null});if(!other)return;const ids=[ctx.me.uid,other].sort(),cid=chatId(ctx.me.uid,other);input.value='';const msg={from:ctx.me.uid,to:other,senderId:ctx.me.uid,receiverId:other,text,createdAt:ctx.fs.serverTimestamp()};try{await ctx.fs.setDoc(ctx.fs.doc(ctx.db,'chats',cid),{participants:ids,lastMessage:text,lastSenderId:ctx.me.uid,updatedAt:ctx.fs.serverTimestamp()},{merge:true});await ctx.fs.addDoc(ctx.fs.collection(ctx.db,'chats',cid,'messages'),msg)}catch(err){console.error(err);input.value=text;alert('Não foi possível enviar a mensagem. Tente novamente.')}};
  }
  function style(){if($('chamaMediaFixStyle'))return;const s=document.createElement('style');s.id='chamaMediaFixStyle';s.textContent='.image-send-btn,.video-send-btn{border:0;background:#eef4f1;color:#0b7a53;width:42px;height:42px;border-radius:50%;font-size:20px;display:grid;place-items:center;cursor:pointer;flex:0 0 42px}.audio-record.recording{background:#ffe5e5!important;color:#b42318!important}.chama-audio-preview button{border:0;border-radius:12px;padding:12px;font-weight:800;cursor:pointer}.chama-audio-preview .aud-del{background:#fff0f0;color:#b42318}.chama-audio-preview .aud-send{background:#0b7a53;color:#fff}';document.head.appendChild(s)}
  function boot(){if(ready)return;ready=addButtons();fastText();style();if(!ready)setTimeout(boot,300)}
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});boot();
})();
