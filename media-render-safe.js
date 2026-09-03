(()=>{
  const PREFIX='__CHAMA_MEDIA__';
  function rawText(b){
    let out='';
    for(const n of b.childNodes){
      if(n.nodeType===Node.TEXT_NODE) out+=n.nodeValue||'';
      else if(n.nodeType===Node.ELEMENT_NODE && !n.classList.contains('time')) out+=n.textContent||'';
    }
    return out.trim();
  }
  function addStyle(){
    if(document.getElementById('mediaSafeToggleStyle'))return;
    const s=document.createElement('style');
    s.id='mediaSafeToggleStyle';
    s.textContent=`
      .media-image-wrap{display:grid;gap:7px}
      .chat-media.image{display:block;width:min(270px,68vw);max-height:340px;object-fit:cover;border-radius:12px;background:#e8eeeb}
      .audio-placeholder{border:0;background:transparent;padding:2px 0;display:flex;align-items:center;gap:10px;min-width:220px;max-width:280px;cursor:pointer;text-align:left;color:#14221c}
      .audio-play{width:42px;height:42px;border-radius:50%;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:18px;flex:0 0 42px;box-shadow:0 1px 2px #0002}
      .audio-body{display:grid;gap:5px;flex:1;min-width:0}
      .audio-wave{height:25px;display:flex;align-items:center;gap:3px;overflow:hidden}
      .audio-wave i{display:block;width:3px;border-radius:999px;background:#7a9286;opacity:.9}
      .audio-wave i:nth-child(1){height:7px}.audio-wave i:nth-child(2){height:13px}.audio-wave i:nth-child(3){height:19px}.audio-wave i:nth-child(4){height:10px}.audio-wave i:nth-child(5){height:22px}.audio-wave i:nth-child(6){height:15px}.audio-wave i:nth-child(7){height:8px}.audio-wave i:nth-child(8){height:18px}.audio-wave i:nth-child(9){height:12px}.audio-wave i:nth-child(10){height:20px}.audio-wave i:nth-child(11){height:9px}.audio-wave i:nth-child(12){height:15px}.audio-wave i:nth-child(13){height:6px}.audio-wave i:nth-child(14){height:17px}.audio-wave i:nth-child(15){height:11px}.audio-wave i:nth-child(16){height:21px}.audio-wave i:nth-child(17){height:13px}.audio-wave i:nth-child(18){height:8px}
      .audio-label{font-size:12px;color:#607068}
      .chat-media.audio{width:min(285px,72vw);height:42px}
      .media-placeholder{border:0;background:#eef4f1;color:#0b7a53;border-radius:12px;padding:12px 14px;font-weight:800;cursor:pointer}
      .media-error{font-size:13px;color:#b42318}
      .image-send-btn{border:0;background:#eef4f1;color:#0b7a53;width:42px;height:42px;border-radius:50%;font-size:20px;display:grid;place-items:center;cursor:pointer;flex:0 0 42px}
      .image-upload-toast{position:fixed;left:50%;bottom:82px;transform:translateX(-50%);background:#14221c;color:#fff;padding:10px 14px;border-radius:999px;z-index:120;font-size:14px;white-space:nowrap}
    `;
    document.head.appendChild(s);
  }
  function imageElement(m){
    const img=document.createElement('img');
    img.className='chat-media image';
    img.loading='lazy';
    img.decoding='async';
    img.alt='Imagem';
    img.src=m.url;
    img.onerror=()=>{const d=document.createElement('div');d.className='media-error';d.textContent='Não foi possível carregar esta imagem.';img.replaceWith(d)};
    return img;
  }
  function makePlaceholder(m){
    if(m.kind==='image') return imageElement(m);
    if(m.kind==='audio'){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='audio-placeholder';
      const wave='<i></i>'.repeat(18);
      btn.innerHTML=`<span class="audio-play">▶</span><span class="audio-body"><span class="audio-wave">${wave}</span><span class="audio-label">Toque para ouvir</span></span>`;
      btn.addEventListener('click',()=>openMedia(btn,m));
      return btn;
    }
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='media-placeholder';
    btn.textContent='▶️ Reproduzir vídeo';
    btn.addEventListener('click',()=>openMedia(btn,m));
    return btn;
  }
  function openMedia(btn,m){
    let el;
    if(m.kind==='audio'){
      el=document.createElement('audio'); el.className='chat-media audio'; el.controls=true; el.preload='none';
    }else if(m.kind==='video'){
      el=document.createElement('video'); el.className='chat-media video'; el.controls=true; el.preload='none'; el.playsInline=true;
    }
    if(!el)return;
    const bubble=btn.closest('.bubble'),messageId=bubble?.dataset?.messageId||'';
    if(m.kind==='audio'&&messageId){
      el.addEventListener('play',()=>{
        if(el.dataset.playReceiptSent==='1')return;
        el.dataset.playReceiptSent='1';
        document.dispatchEvent(new CustomEvent('chama-media-played',{detail:{messageId}}));
      },{once:true});
    }
    el.src=m.url;
    el.onerror=()=>{const d=document.createElement('div');d.className='media-error';d.textContent='Não foi possível carregar esta mídia.';el.replaceWith(d)};
    btn.replaceWith(el);
  }
  function render(b){
    if(!b||b.dataset.mediaSafe==='1')return;
    const raw=rawText(b);
    if(!raw.startsWith(PREFIX))return;
    let m;try{m=JSON.parse(raw.slice(PREFIX.length))}catch{return}
    b.dataset.mediaSafe='1'; b.dataset.mediaReady='1'; b.dataset.linksReady='1';
    const time=b.querySelector('.time')?.cloneNode(true);
    b.textContent='';
    b.appendChild(makePlaceholder(m));
    if(time)b.appendChild(time);
  }
  function scan(root=document){root.querySelectorAll?.('#messages .bubble').forEach(render)}
  function toast(text){
    let n=document.getElementById('imageUploadToast');
    if(!n){n=document.createElement('div');n.id='imageUploadToast';n.className='image-upload-toast';document.body.appendChild(n)}
    n.textContent=text;n.hidden=false;return()=>{n.hidden=true};
  }
  function currentReceiverUid(){
    const email=(document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase();
    if(!email)return '';
    for(const row of document.querySelectorAll('#usersList .user')){
      const rowEmail=(row.querySelector('.user-email')?.textContent||'').trim().toLowerCase();
      if(rowEmail===email && row.dataset.uid)return row.dataset.uid;
    }
    return '';
  }
  async function sendImage(file){
    if(!file?.type?.startsWith('image/'))return alert('Escolha uma imagem.');
    if(file.size>5*1024*1024)return alert('Imagem muito grande. Limite: 5 MB.');
    const active=document.getElementById('activeChat');
    if(!active||active.classList.contains('hidden'))return alert('Abra uma conversa antes de enviar a imagem.');
    const otherUid=currentReceiverUid();
    if(!otherUid)return alert('Não consegui identificar o contato desta conversa.');
    const hide=toast('Enviando imagem...');
    try{
      const [{getApps},{getAuth},{getFirestore,collection,addDoc,doc,setDoc,serverTimestamp,increment}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      const app=getApps()[0];
      const auth=getAuth(app),me=auth.currentUser;
      if(!me)throw new Error('Faça login novamente.');
      const token=await me.getIdToken();
      const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name||'imagem')},body:file});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||'Não foi possível enviar a imagem.');
      const db=getFirestore(app),ids=[me.uid,otherUid].sort(),chatId=ids.join('_');
      const text=PREFIX+JSON.stringify({kind:'image',url:data.url,key:data.key});
      await addDoc(collection(db,'chats',chatId,'messages'),{text,senderId:me.uid,receiverId:otherUid,createdAt:serverTimestamp()});
      await setDoc(doc(db,'chats',chatId),{participants:ids,lastMessage:'📷 Imagem',lastSenderId:me.uid,updatedAt:serverTimestamp(),unreadCounts:{[otherUid]:increment(1),[me.uid]:0}},{merge:true});
    }catch(e){alert(e?.message||'Não foi possível enviar a imagem.')}finally{hide()}
  }
  function installImageButton(){
    if(document.getElementById('imageBtn'))return;
    const form=document.getElementById('composer'),input=document.getElementById('messageInput');
    if(!form||!input)return;
    const btn=document.createElement('button');
    btn.id='imageBtn';btn.type='button';btn.className='image-send-btn';btn.title='Enviar imagem';btn.textContent='📷';
    btn.onclick=()=>{
      const pick=document.createElement('input');
      pick.type='file';pick.accept='image/*';pick.hidden=true;document.body.appendChild(pick);
      pick.onchange=async()=>{const f=pick.files?.[0];pick.remove();if(f)await sendImage(f)};
      pick.click();
    };
    form.insertBefore(btn,input);
  }
  function start(){
    addStyle();installImageButton();scan();
    const messages=document.getElementById('messages');
    if(!messages)return;
    new MutationObserver(ms=>{
      for(const m of ms) for(const n of m.addedNodes){
        if(n.nodeType!==1)continue;
        if(n.matches?.('.bubble')) render(n);
        else n.querySelectorAll?.('.bubble').forEach(render);
      }
    }).observe(messages,{childList:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();