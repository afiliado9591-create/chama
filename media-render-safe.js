(()=>{
  const PREFIX='__CHAMA_MEDIA__';
  const HIDDEN_KEY='chama_hidden_messages_v1';
  let hydratedChatId='';
  let hydratedEntries=[];

  function rawText(b){
    let out='';
    for(const n of b.childNodes){
      if(n.nodeType===Node.TEXT_NODE) out+=n.nodeValue||'';
      else if(n.nodeType===Node.ELEMENT_NODE && !n.classList.contains('time') && !n.classList.contains('chama-msg-menu-btn')) out+=n.textContent||'';
    }
    return out.trim();
  }

  function getStoredHidden(){
    try{
      const v=JSON.parse(localStorage.getItem(HIDDEN_KEY)||'[]');
      return Array.isArray(v)?v:[];
    }catch{return []}
  }
  function saveHidden(list){
    try{localStorage.setItem(HIDDEN_KEY,JSON.stringify(list.slice(-500)))}catch(_){ }
  }
  function chatScope(){
    return (document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase()||'chat';
  }
  function bubbleBaseSignature(b){
    const raw=b.dataset.chamaRaw||rawText(b);
    const time=(b.querySelector('.time')?.textContent||'').trim();
    const side=b.classList.contains('mine')?'mine':'theirs';
    return `${chatScope()}␟${side}␟${time}␟${raw}`;
  }
  function bubbleLocalKey(b){
    const base=bubbleBaseSignature(b);
    const bubbles=[...document.querySelectorAll('#messages .bubble')].filter(x=>bubbleBaseSignature(x)===base);
    const ordinal=Math.max(0,bubbles.indexOf(b));
    return `${base}␟${ordinal}`;
  }
  function hideStoredBubbles(){
    const hidden=new Set(getStoredHidden());
    for(const b of document.querySelectorAll('#messages .bubble')){
      if(!b.dataset.chamaRaw)b.dataset.chamaRaw=rawText(b);
      if(hidden.has(bubbleLocalKey(b)))b.remove();
    }
  }

  function addStyle(){
    if(document.getElementById('mediaSafeToggleStyle'))return;
    const s=document.createElement('style');
    s.id='mediaSafeToggleStyle';
    s.textContent=`
      .media-wrap{display:grid;gap:7px}
      .chat-media.image{display:block;width:min(270px,68vw);max-height:340px;object-fit:cover;border-radius:12px;background:#e8eeeb}
      .audio-placeholder{border:0;background:transparent;padding:2px 0;display:flex;align-items:center;gap:10px;min-width:220px;max-width:280px;cursor:pointer;text-align:left;color:#14221c}
      .audio-play{width:42px;height:42px;border-radius:50%;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:18px;flex:0 0 42px;box-shadow:0 1px 2px #0002}
      .audio-body{display:grid;gap:5px;flex:1;min-width:0}
      .audio-wave{height:25px;display:flex;align-items:center;gap:3px;overflow:hidden}
      .audio-wave i{display:block;width:3px;border-radius:999px;background:#7a9286;opacity:.9}
      .audio-wave i:nth-child(1){height:7px}.audio-wave i:nth-child(2){height:13px}.audio-wave i:nth-child(3){height:19px}.audio-wave i:nth-child(4){height:10px}.audio-wave i:nth-child(5){height:22px}.audio-wave i:nth-child(6){height:15px}.audio-wave i:nth-child(7){height:8px}.audio-wave i:nth-child(8){height:18px}.audio-wave i:nth-child(9){height:12px}.audio-wave i:nth-child(10){height:20px}.audio-wave i:nth-child(11){height:9px}.audio-wave i:nth-child(12){height:15px}.audio-wave i:nth-child(13){height:6px}.audio-wave i:nth-child(14){height:17px}.audio-wave i:nth-child(15){height:11px}.audio-wave i:nth-child(16){height:21px}.audio-wave i:nth-child(17){height:13px}.audio-wave i:nth-child(18){height:8px}
      .audio-label{font-size:12px;color:#607068}
      .chat-media.audio{width:min(285px,72vw);height:42px}
      .chat-media.video{display:block;width:min(300px,72vw);max-height:380px;border-radius:12px;background:#000}
      .media-placeholder{border:0;background:#eef4f1;color:#0b7a53;border-radius:12px;padding:12px 14px;font-weight:800;cursor:pointer}
      .media-close-btn{border:0;background:#eef4f1;color:#0b7a53;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer;justify-self:start}
      .media-error{font-size:13px;color:#b42318}
      .image-send-btn,.video-send-btn{border:0;background:#eef4f1;color:#0b7a53;width:42px;height:42px;border-radius:50%;font-size:20px;display:grid;place-items:center;cursor:pointer;flex:0 0 42px}
      .image-upload-toast{position:fixed;left:50%;bottom:82px;transform:translateX(-50%);background:#14221c;color:#fff;padding:10px 14px;border-radius:999px;z-index:120;font-size:14px;white-space:nowrap}
      .media-preview-backdrop{position:fixed;inset:0;background:#0008;z-index:950;display:grid;place-items:center;padding:18px}.media-preview-card{width:min(460px,100%);max-height:90dvh;overflow:auto;background:#fff;border-radius:20px;padding:16px;display:grid;gap:13px;box-shadow:0 20px 60px #0004}.media-preview-card strong{font-size:18px}.media-preview-file{display:block;width:100%;max-height:62dvh;object-fit:contain;border-radius:13px;background:#101613}.media-preview-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.media-preview-delete,.media-preview-send{border:0;border-radius:12px;padding:12px;font-weight:850;cursor:pointer}.media-preview-delete{background:#fff0f0;color:#b42318}.media-preview-send{background:#0b7a53;color:#fff}.media-preview-send:disabled{opacity:.65}
      .bubble.chama-actions-ready{position:relative;padding-right:34px}
      .chama-msg-menu-btn{position:absolute;top:4px;right:5px;width:25px;height:25px;border:0;border-radius:50%;background:transparent;color:#65736c;font-size:20px;line-height:20px;display:grid;place-items:center;cursor:pointer;padding:0}
      .chama-msg-menu-btn:active{background:#00000010}
      .chama-sheet-backdrop{position:fixed;inset:0;background:#0007;z-index:1000;display:grid;align-items:end}
      .chama-sheet{background:#fff;border-radius:22px 22px 0 0;padding:10px 14px max(18px,env(safe-area-inset-bottom));box-shadow:0 -10px 30px #0002}
      .chama-sheet-title{font-weight:800;padding:10px 8px 8px;color:#25332c}
      .chama-sheet button{width:100%;border:0;background:#fff;text-align:left;padding:15px 12px;border-radius:12px;font-size:16px;cursor:pointer}
      .chama-sheet button:active{background:#f0f4f2}
      .chama-sheet .danger{color:#b42318;font-weight:750}
      .chama-sheet .cancel{color:#5d6963;border-top:1px solid #edf0ee;margin-top:4px}
    `;
    document.head.appendChild(s);
  }

  function makePlaceholder(m){
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
    btn.textContent=m.kind==='image'?'📷 Ver imagem':'🎥 Reproduzir vídeo';
    btn.addEventListener('click',()=>openMedia(btn,m));
    return btn;
  }

  function openMedia(btn,m){
    if(m.kind==='image'){
      const wrap=document.createElement('div');
      wrap.className='media-wrap';
      const img=document.createElement('img');
      img.className='chat-media image';
      img.loading='lazy';
      img.decoding='async';
      img.alt='Imagem';
      img.src=m.url;
      const close=document.createElement('button');
      close.type='button';
      close.className='media-close-btn';
      close.textContent='✕ Fechar imagem';
      const collapse=()=>wrap.replaceWith(makePlaceholder(m));
      close.onclick=collapse;
      img.onclick=collapse;
      img.onerror=()=>{const d=document.createElement('div');d.className='media-error';d.textContent='Não foi possível carregar esta imagem.';wrap.replaceWith(d)};
      wrap.append(img,close);
      btn.replaceWith(wrap);
      return;
    }
    if(m.kind==='video'){
      const wrap=document.createElement('div');
      wrap.className='media-wrap';
      const video=document.createElement('video');
      video.className='chat-media video';
      video.controls=true;
      video.preload='metadata';
      video.playsInline=true;
      video.src=m.url;
      const close=document.createElement('button');
      close.type='button';
      close.className='media-close-btn';
      close.textContent='✕ Fechar vídeo';
      close.onclick=()=>{
        try{video.pause()}catch(_){ }
        wrap.replaceWith(makePlaceholder(m));
      };
      video.onerror=()=>{const d=document.createElement('div');d.className='media-error';d.textContent='Não foi possível carregar este vídeo.';wrap.replaceWith(d)};
      wrap.append(video,close);
      btn.replaceWith(wrap);
      return;
    }
    if(m.kind==='audio'){
      const el=document.createElement('audio');
      el.className='chat-media audio';
      el.controls=true;
      el.preload='none';
      const bubble=btn.closest('.bubble'),messageId=bubble?.dataset?.messageId||'';
      if(messageId){
        el.addEventListener('play',()=>{
          if(el.dataset.playReceiptSent==='1')return;
          el.dataset.playReceiptSent='1';
          document.dispatchEvent(new CustomEvent('chama-media-played',{detail:{messageId}}));
        },{once:true});
      }
      el.src=m.url;
      el.onerror=()=>{const d=document.createElement('div');d.className='media-error';d.textContent='Não foi possível carregar este áudio.';el.replaceWith(d)};
      btn.replaceWith(el);
    }
  }

  function render(b){
    if(!b||b.dataset.mediaSafe==='1')return;
    const raw=rawText(b);
    if(!b.dataset.chamaRaw)b.dataset.chamaRaw=raw;
    if(!raw.startsWith(PREFIX))return;
    let m;try{m=JSON.parse(raw.slice(PREFIX.length))}catch{return}
    b.dataset.mediaSafe='1'; b.dataset.mediaReady='1'; b.dataset.linksReady='1';
    const time=b.querySelector('.time')?.cloneNode(true);
    b.textContent='';
    b.appendChild(makePlaceholder(m));
    if(time)b.appendChild(time);
  }

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

  async function firebaseParts(){
    const [{getApps},{getAuth},{getFirestore,collection,addDoc,doc,setDoc,serverTimestamp,increment,getDocs,query,orderBy,limit,deleteDoc}]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
    ]);
    const app=getApps()[0];
    return {app,getAuth,getFirestore,collection,addDoc,doc,setDoc,serverTimestamp,increment,getDocs,query,orderBy,limit,deleteDoc};
  }

  function attachMessageIdToBubble(raw,id){
    const candidates=[...document.querySelectorAll('#messages .bubble.mine')].reverse();
    const b=candidates.find(x=>(x.dataset.chamaRaw||rawText(x))===raw && !x.dataset.messageId);
    if(b)b.dataset.messageId=id;
  }

  async function sendMedia(file,kind){
    const expected=kind==='image'?'image/':'video/';
    const max=kind==='image'?5*1024*1024:25*1024*1024;
    const label=kind==='image'?'imagem':'vídeo';
    if(!file?.type?.startsWith(expected)){alert(`Escolha um ${label}.`);return false}
    if(file.size>max){alert(`${kind==='image'?'Imagem':'Vídeo'} muito grande. Limite: ${kind==='image'?'5':'25'} MB.`);return false}
    const active=document.getElementById('activeChat');
    if(!active||active.classList.contains('hidden')){alert(`Abra uma conversa antes de enviar ${kind==='image'?'a imagem':'o vídeo'}.`);return false}
    const otherUid=currentReceiverUid();
    if(!otherUid){alert('Não consegui identificar o contato desta conversa.');return false}
    const hide=toast(`Enviando ${label}...`);
    try{
      const f=await firebaseParts();
      const auth=f.getAuth(f.app),me=auth.currentUser;
      if(!me)throw new Error('Faça login novamente.');
      const token=await me.getIdToken();
      const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name||label)},body:file});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||`Não foi possível enviar ${kind==='image'?'a imagem':'o vídeo'}.`);
      const db=f.getFirestore(f.app),ids=[me.uid,otherUid].sort(),chatId=ids.join('_');
      const text=PREFIX+JSON.stringify({kind,url:data.url,key:data.key});
      const messageData={text,senderId:me.uid,receiverId:otherUid,createdAt:f.serverTimestamp()};
      let msgRef;
      try{
        msgRef=await f.addDoc(f.collection(db,'chats',chatId,'messages'),messageData);
      }catch(sendErr){
        if(!String(sendErr?.code||'').includes('permission-denied'))throw sendErr;
        await f.setDoc(f.doc(db,'chats',chatId),{participants:ids,createdAt:f.serverTimestamp(),updatedAt:f.serverTimestamp()},{merge:true});
        msgRef=await f.addDoc(f.collection(db,'chats',chatId,'messages'),messageData);
      }
      attachMessageIdToBubble(text,msgRef.id);
      await f.setDoc(f.doc(db,'chats',chatId),{participants:ids,lastMessage:kind==='image'?'📷 Imagem':'🎥 Vídeo',lastSenderId:me.uid,updatedAt:f.serverTimestamp(),unreadCounts:{[otherUid]:f.increment(1),[me.uid]:0}},{merge:true});
      return true;
    }catch(e){alert(e?.message||`Não foi possível enviar ${kind==='image'?'a imagem':'o vídeo'}.`);return false}finally{hide()}
  }

  function previewMedia(file,kind){
    const expected=kind==='image'?'image/':'video/',label=kind==='image'?'imagem':'vídeo';
    if(!file?.type?.startsWith(expected))return alert(`Escolha um ${label}.`);
    document.querySelector('.media-preview-backdrop')?.remove();
    const url=URL.createObjectURL(file),backdrop=document.createElement('div');backdrop.className='media-preview-backdrop';
    backdrop.innerHTML=`<section class="media-preview-card"><strong>Confira ${kind==='image'?'a imagem':'o vídeo'} antes de enviar</strong><div class="media-preview-view"></div><div class="media-preview-actions"><button type="button" class="media-preview-delete">Excluir</button><button type="button" class="media-preview-send">Enviar ${label}</button></div></section>`;
    const media=document.createElement(kind==='image'?'img':'video');media.className='media-preview-file';media.src=url;if(kind==='image')media.alt='Prévia da imagem';else{media.controls=true;media.preload='metadata';media.playsInline=true}backdrop.querySelector('.media-preview-view').appendChild(media);
    const remove=()=>{if(kind==='video')media.pause();URL.revokeObjectURL(url);backdrop.remove()};backdrop.querySelector('.media-preview-delete').onclick=remove;backdrop.onclick=e=>{if(e.target===backdrop)remove()};
    backdrop.querySelector('.media-preview-send').onclick=async e=>{const btn=e.currentTarget;btn.disabled=true;btn.textContent='Enviando...';const sent=await sendMedia(file,kind);if(sent)remove();else if(btn.isConnected){btn.disabled=false;btn.textContent=`Enviar ${label}`}};
    document.body.appendChild(backdrop);
  }

  function parseMediaMeta(raw){
    if(!raw?.startsWith(PREFIX))return null;
    try{
      const m=JSON.parse(raw.slice(PREFIX.length));
      return m&&typeof m==='object'?m:null;
    }catch{return null}
  }

  function formatDocTime(m){
    return m?.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '';
  }

  function entrySignature(raw,time,mine){return `${mine?'1':'0'}␟${time}␟${raw}`}

  function applyHydratedIds(){
    if(!hydratedEntries.length)return;
    const entryGroups=new Map();
    for(const e of hydratedEntries){
      const k=entrySignature(e.raw,e.time,e.mine);
      if(!entryGroups.has(k))entryGroups.set(k,[]);
      entryGroups.get(k).push(e);
    }
    const domGroups=new Map();
    for(const b of document.querySelectorAll('#messages .bubble')){
      if(!b.dataset.chamaRaw)b.dataset.chamaRaw=rawText(b);
      const k=entrySignature(b.dataset.chamaRaw,(b.querySelector('.time')?.textContent||'').trim(),b.classList.contains('mine'));
      if(!domGroups.has(k))domGroups.set(k,[]);
      domGroups.get(k).push(b);
    }
    for(const [k,bubbles] of domGroups){
      const entries=entryGroups.get(k)||[];
      bubbles.forEach((b,i)=>{if(entries[i])b.dataset.messageId=entries[i].id});
    }
  }

  async function hydrateVisibleMessageIds(ctx){
    if(hydratedChatId===ctx.chatId && hydratedEntries.length){applyHydratedIds();return}
    const q=ctx.f.query(ctx.f.collection(ctx.db,'chats',ctx.chatId,'messages'),ctx.f.orderBy('createdAt','desc'),ctx.f.limit(20));
    const snap=await ctx.f.getDocs(q);
    const docs=[];snap.forEach(d=>docs.push(d));docs.reverse();
    hydratedChatId=ctx.chatId;
    hydratedEntries=docs.map(d=>{
      const m=d.data()||{};
      return {id:d.id,raw:m.text||'',time:formatDocTime(m),mine:m.senderId===ctx.me.uid};
    });
    applyHydratedIds();
  }

  async function resolveMessageTarget(b){
    const f=await firebaseParts();
    const auth=f.getAuth(f.app),me=auth.currentUser;
    if(!me)throw new Error('Faça login novamente.');
    const otherUid=currentReceiverUid();
    if(!otherUid)throw new Error('Não consegui identificar esta conversa.');
    const db=f.getFirestore(f.app),ids=[me.uid,otherUid].sort(),chatId=ids.join('_');
    const ctx={f,auth,me,db,chatId};
    if(!b.dataset.messageId)await hydrateVisibleMessageIds(ctx);
    const messageId=b.dataset.messageId||'';
    if(!messageId)throw new Error('Não consegui localizar esta mensagem com segurança. Tente novamente.');
    return {...ctx,messageId,raw:b.dataset.chamaRaw||rawText(b)};
  }

  function deleteForMe(b){
    const key=bubbleLocalKey(b);
    const list=getStoredHidden();
    if(!list.includes(key)){list.push(key);saveHidden(list)}
    b.remove();
  }

  async function deleteForEveryone(b){
    const hide=toast('Apagando para todos...');
    try{
      if(!b.classList.contains('mine'))throw new Error('Você só pode apagar para todos mensagens que você enviou.');
      const r=await resolveMessageTarget(b);
      await r.f.deleteDoc(r.f.doc(r.db,'chats',r.chatId,'messages',r.messageId));
      hydratedEntries=hydratedEntries.filter(e=>e.id!==r.messageId);
      const meta=parseMediaMeta(r.raw);
      if(meta?.key){
        try{
          const token=await r.me.getIdToken();
          await fetch('/api/media?key='+encodeURIComponent(meta.key),{method:'DELETE',headers:{Authorization:'Bearer '+token}});
        }catch(_){ }
      }
      b.remove();
      applyHydratedIds();
    }catch(e){alert(e?.message||'Não foi possível apagar para todos.')}finally{hide()}
  }

  function closeSheet(){document.getElementById('chamaMessageSheet')?.remove()}
  function openMessageMenu(b){
    closeSheet();
    const mine=b.classList.contains('mine');
    const backdrop=document.createElement('div');
    backdrop.id='chamaMessageSheet';
    backdrop.className='chama-sheet-backdrop';
    const sheet=document.createElement('div');
    sheet.className='chama-sheet';
    const title=document.createElement('div');
    title.className='chama-sheet-title';
    title.textContent='Apagar mensagem';
    const onlyMe=document.createElement('button');
    onlyMe.type='button';onlyMe.className='danger';onlyMe.textContent='🗑️ Apagar para mim';
    onlyMe.onclick=()=>{closeSheet();deleteForMe(b)};
    sheet.append(title,onlyMe);
    if(mine){
      const everyone=document.createElement('button');
      everyone.type='button';everyone.className='danger';everyone.textContent='🗑️ Apagar para todos';
      everyone.onclick=()=>{closeSheet();deleteForEveryone(b)};
      sheet.appendChild(everyone);
    }
    const cancel=document.createElement('button');
    cancel.type='button';cancel.className='cancel';cancel.textContent='Cancelar';cancel.onclick=closeSheet;
    sheet.appendChild(cancel);
    backdrop.appendChild(sheet);
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeSheet()});
    document.body.appendChild(backdrop);
  }

  function installMessageAction(b){
    if(!b||b.dataset.chamaActions==='1')return;
    if(!b.dataset.chamaRaw)b.dataset.chamaRaw=rawText(b);
    b.dataset.chamaActions='1';
    b.classList.add('chama-actions-ready');
    const btn=document.createElement('button');
    btn.type='button';btn.className='chama-msg-menu-btn';btn.setAttribute('aria-label','Opções da mensagem');btn.textContent='⋮';
    btn.onclick=e=>{e.stopPropagation();openMessageMenu(b)};
    b.appendChild(btn);
  }

  function processBubble(b){
    if(!b)return;
    if(!b.dataset.chamaRaw)b.dataset.chamaRaw=rawText(b);
    render(b);
    installMessageAction(b);
  }

  function scan(root=document){
    root.querySelectorAll?.('#messages .bubble').forEach(processBubble);
    applyHydratedIds();
    hideStoredBubbles();
  }

  function installMediaButtons(){
    const form=document.getElementById('composer'),input=document.getElementById('messageInput');
    if(!form||!input)return;
    if(!document.getElementById('imageBtn')){
      const btn=document.createElement('button');
      btn.id='imageBtn';btn.type='button';btn.className='image-send-btn';btn.title='Enviar imagem';btn.textContent='📷';
      btn.onclick=()=>{
        const pick=document.createElement('input');
        pick.type='file';pick.accept='image/*';pick.hidden=true;document.body.appendChild(pick);
        pick.onchange=()=>{const f=pick.files?.[0];pick.remove();if(f)previewMedia(f,'image')};
        pick.click();
      };
      form.insertBefore(btn,input);
    }
    if(!document.getElementById('videoBtn')){
      const btn=document.createElement('button');
      btn.id='videoBtn';btn.type='button';btn.className='video-send-btn';btn.title='Enviar vídeo';btn.textContent='🎥';
      btn.onclick=()=>{
        const pick=document.createElement('input');
        pick.type='file';pick.accept='video/*';pick.hidden=true;document.body.appendChild(pick);
        pick.onchange=()=>{const f=pick.files?.[0];pick.remove();if(f)previewMedia(f,'video')};
        pick.click();
      };
      form.insertBefore(btn,input);
    }
  }

  function start(){
    addStyle();installMediaButtons();scan();
    const messages=document.getElementById('messages');
    if(!messages)return;
    new MutationObserver(ms=>{
      for(const m of ms) for(const n of m.addedNodes){
        if(n.nodeType!==1)continue;
        if(n.matches?.('.bubble')) processBubble(n);
        else n.querySelectorAll?.('.bubble').forEach(processBubble);
      }
      applyHydratedIds();
      hideStoredBubbles();
    }).observe(messages,{childList:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
