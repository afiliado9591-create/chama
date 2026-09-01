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
    s.textContent=`.media-image-wrap{display:grid;gap:7px}.media-close-btn{border:0;background:#eef4f1;color:#0b7a53;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer}.chat-media.image{cursor:pointer;max-width:100%;border-radius:12px}`;
    document.head.appendChild(s);
  }
  function makePlaceholder(m){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='media-placeholder';
    btn.textContent=m.kind==='image'?'📷 Ver imagem':m.kind==='audio'?'🎤 Ouvir áudio':'▶️ Reproduzir vídeo';
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
    if(m.name){const n=document.createElement('div');n.className='media-name';n.textContent=m.name;b.appendChild(n)}
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