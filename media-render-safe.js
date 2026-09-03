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
      .media-close-btn{border:0;background:#eef4f1;color:#0b7a53;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer}
      .chat-media.image{cursor:pointer;max-width:100%;border-radius:12px}
      .audio-placeholder{border:0;background:transparent;padding:2px 0;display:flex;align-items:center;gap:10px;min-width:220px;max-width:280px;cursor:pointer;text-align:left;color:#14221c}
      .audio-play{width:42px;height:42px;border-radius:50%;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:18px;flex:0 0 42px;box-shadow:0 1px 2px #0002}
      .audio-body{display:grid;gap:5px;flex:1;min-width:0}
      .audio-wave{height:25px;display:flex;align-items:center;gap:3px;overflow:hidden}
      .audio-wave i{display:block;width:3px;border-radius:999px;background:#7a9286;opacity:.9}
      .audio-wave i:nth-child(1){height:7px}.audio-wave i:nth-child(2){height:13px}.audio-wave i:nth-child(3){height:19px}.audio-wave i:nth-child(4){height:10px}.audio-wave i:nth-child(5){height:22px}.audio-wave i:nth-child(6){height:15px}.audio-wave i:nth-child(7){height:8px}.audio-wave i:nth-child(8){height:18px}.audio-wave i:nth-child(9){height:12px}.audio-wave i:nth-child(10){height:20px}.audio-wave i:nth-child(11){height:9px}.audio-wave i:nth-child(12){height:15px}.audio-wave i:nth-child(13){height:6px}.audio-wave i:nth-child(14){height:17px}.audio-wave i:nth-child(15){height:11px}.audio-wave i:nth-child(16){height:21px}.audio-wave i:nth-child(17){height:13px}.audio-wave i:nth-child(18){height:8px}
      .audio-label{font-size:12px;color:#607068}
      .chat-media.audio{width:min(285px,72vw);height:42px}
      .media-placeholder{border:0;background:#eef4f1;color:#0b7a53;border-radius:12px;padding:12px 14px;font-weight:800;cursor:pointer}
      .media-name{font-size:12px;color:#55615b;margin:4px 0}
      .media-error{font-size:13px;color:#b42318}
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
    btn.textContent=m.kind==='image'?'📷 Ver imagem':'▶️ Reproduzir vídeo';
    btn.addEventListener('click',()=>openMedia(btn,m));
    return btn;
  }
  function openMedia(btn,m){
    if(m.kind==='image'){
      const wrap=document.createElement('div');wrap.className='media-image-wrap';
      const img=document.createElement('img');img.className='chat-media image';img.loading='lazy';img.decoding='async';img.alt=m.name||'Imagem';img.src=m.url;
      const close=document.createElement('button');close.type='button';close.className='media-close-btn';close.textContent='✕ Fechar imagem';
      const closeImage=()=>wrap.replaceWith(makePlaceholder(m));
      close.onclick=closeImage;
      img.onclick=closeImage;
      img.onerror=()=>{const d=document.createElement('div');d.className='media-error';d.textContent='Não foi possível carregar esta mídia.';wrap.replaceWith(d)};
      wrap.append(img,close);btn.replaceWith(wrap);return;
    }
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
    // Para áudio, não mostra o nome técnico do arquivo (.webm). Fica como mensagem de voz.
    if(m.name && m.kind!=='audio'){
      const n=document.createElement('div');n.className='media-name';n.textContent=m.name;b.appendChild(n)
    }
    if(time)b.appendChild(time);
  }
  function scan(root=document){root.querySelectorAll?.('#messages .bubble').forEach(render)}
  function start(){
    addStyle();scan();
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