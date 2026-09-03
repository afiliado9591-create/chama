(()=>{
  const STYLE_ID='chamaSocialVideoLinksStyleV1';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .chama-social-video-card{margin-top:8px;border:1px solid #dfe7e3;border-radius:14px;background:#fff;overflow:hidden;max-width:min(310px,72vw)}
      .mine .chama-social-video-card{background:#f7fffb}
      .chama-social-video-head{display:flex;align-items:center;gap:8px;padding:10px 11px 7px;font-size:12px;font-weight:900;color:#405048}
      .chama-social-video-play{width:100%;border:0;border-top:1px solid #edf1ef;background:#0b7a53;color:#fff;padding:11px 12px;font-weight:900;cursor:pointer;text-align:center}
      .chama-social-video-play:active{background:#096745}
      .chama-social-video-modal{position:fixed;inset:0;background:#000c;z-index:4200;display:flex;flex-direction:column}
      .chama-social-video-top{display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 12px 10px;background:#111;color:#fff}
      .chama-social-video-title{flex:1;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .chama-social-video-close{border:0;background:#ffffff20;color:#fff;width:42px;height:42px;border-radius:12px;font-size:22px;cursor:pointer}
      .chama-social-video-body{flex:1;display:grid;place-items:center;padding:10px;min-height:0}
      .chama-social-video-frame{width:min(900px,100%);height:min(72vh,620px);border:0;border-radius:14px;background:#000;box-shadow:0 14px 45px #0008}
      .chama-social-video-frame.tiktok{width:min(430px,100%);height:min(78vh,720px)}
      .chama-social-video-fallback{width:min(460px,100%);background:#fff;border-radius:18px;padding:20px;text-align:center;color:#14221c}
      .chama-social-video-fallback a{display:inline-flex;margin-top:12px;background:#0b7a53;color:#fff;text-decoration:none;border-radius:12px;padding:11px 14px;font-weight:900}
      @media(max-width:700px){.chama-social-video-body{padding:0}.chama-social-video-frame{width:100%;height:calc(100dvh - 72px);border-radius:0}.chama-social-video-frame.tiktok{width:100%;height:calc(100dvh - 72px)}}
    `;
    document.head.appendChild(s);
  }

  function bubbleText(b){
    if(b.dataset.chamaRaw)return b.dataset.chamaRaw;
    let out='';
    for(const n of b.childNodes){
      if(n.nodeType===Node.TEXT_NODE)out+=n.nodeValue||'';
      else if(n.nodeType===Node.ELEMENT_NODE&&!n.classList.contains('time')&&!n.classList.contains('chama-msg-menu-btn')&&!n.classList.contains('chama-social-video-card'))out+=n.textContent||'';
    }
    return out.trim();
  }

  function firstUrl(text=''){
    const m=String(text).match(/https?:\/\/[^\s<>"']+/i);
    if(!m)return '';
    return m[0].replace(/[),.;!?]+$/,'');
  }

  function youtubeId(u){
    try{
      const h=u.hostname.toLowerCase().replace(/^www\./,'');
      if(h==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||'';
      if(h==='youtube.com'||h==='m.youtube.com'||h==='music.youtube.com'){
        if(u.pathname==='/watch')return u.searchParams.get('v')||'';
        const p=u.pathname.split('/').filter(Boolean);
        if(['shorts','embed','live'].includes(p[0]))return p[1]||'';
      }
    }catch(_){ }
    return '';
  }

  function tiktokId(u){
    try{
      const h=u.hostname.toLowerCase();
      if(!h.endsWith('tiktok.com'))return '';
      const m=u.pathname.match(/\/video\/(\d{8,})/);
      return m?.[1]||'';
    }catch(_){return ''}
  }

  function classify(raw){
    let u;try{u=new URL(raw)}catch{return null}
    if(u.protocol!=='https:'&&u.protocol!=='http:')return null;
    const host=u.hostname.toLowerCase().replace(/^www\./,'');

    const yid=youtubeId(u);
    if(yid&&/^[A-Za-z0-9_-]{6,20}$/.test(yid))return {type:'youtube',label:'YouTube',icon:'▶️',original:u.href,embed:`https://www.youtube-nocookie.com/embed/${encodeURIComponent(yid)}?playsinline=1&rel=0`};

    if(host==='tiktok.com'||host.endsWith('.tiktok.com')){
      const id=tiktokId(u);
      if(id)return {type:'tiktok',label:'TikTok',icon:'🎵',original:u.href,embed:`https://www.tiktok.com/player/v1/${encodeURIComponent(id)}?autoplay=0`};
      return {type:'tiktok',label:'TikTok',icon:'🎵',original:u.href,embed:''};
    }

    if(host==='facebook.com'||host.endsWith('.facebook.com')||host==='fb.watch'){
      return {type:'facebook',label:'Facebook',icon:'📘',original:u.href,embed:`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.href)}&show_text=false&width=560`};
    }
    return null;
  }

  function closeModal(){
    const modal=document.getElementById('chamaSocialVideoModal');
    if(modal)modal.remove();
  }

  function openPlayer(info){
    closeModal();
    const modal=document.createElement('section');modal.id='chamaSocialVideoModal';modal.className='chama-social-video-modal';
    const top=document.createElement('div');top.className='chama-social-video-top';
    const title=document.createElement('div');title.className='chama-social-video-title';title.textContent=`${info.icon} ${info.label}`;
    const close=document.createElement('button');close.type='button';close.className='chama-social-video-close';close.setAttribute('aria-label','Fechar vídeo');close.textContent='✕';close.onclick=closeModal;
    top.append(title,close);
    const body=document.createElement('div');body.className='chama-social-video-body';

    if(info.embed){
      const frame=document.createElement('iframe');frame.className='chama-social-video-frame'+(info.type==='tiktok'?' tiktok':'');frame.src=info.embed;frame.title=`Vídeo do ${info.label}`;frame.loading='eager';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';body.appendChild(frame);
    }else{
      const fallback=document.createElement('div');fallback.className='chama-social-video-fallback';fallback.innerHTML=`<strong>Este link curto do ${info.label} precisa ser aberto no próprio site.</strong><br><a href="${info.original}" target="_blank" rel="noopener noreferrer">Abrir vídeo no ${info.label}</a>`;body.appendChild(fallback);
    }
    modal.append(top,body);document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal||e.target===body)closeModal()});
  }

  function enhanceBubble(b){
    if(!b||b.dataset.socialVideoReady==='1'||b.dataset.mediaSafe==='1')return;
    const raw=bubbleText(b);const url=firstUrl(raw);if(!url)return;
    const info=classify(url);if(!info)return;
    b.dataset.socialVideoReady='1';
    const card=document.createElement('div');card.className='chama-social-video-card';
    const head=document.createElement('div');head.className='chama-social-video-head';head.textContent=`${info.icon} Vídeo do ${info.label}`;
    const play=document.createElement('button');play.type='button';play.className='chama-social-video-play';play.textContent='▶ Assistir aqui';play.onclick=e=>{e.preventDefault();e.stopPropagation();openPlayer(info)};
    card.append(head,play);
    const time=b.querySelector('.time');if(time)b.insertBefore(card,time);else b.appendChild(card);
  }

  function scan(root=document){
    if(root.matches?.('#messages .bubble'))enhanceBubble(root);
    root.querySelectorAll?.('#messages .bubble').forEach(enhanceBubble);
  }

  function start(){
    addStyle();scan();
    const box=document.getElementById('messages');
    if(box)new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes){if(n.nodeType===1)scan(n)}}}).observe(box,{childList:true,subtree:true});
    else new MutationObserver(()=>{const m=document.getElementById('messages');if(m){scan(m)}}).observe(document.documentElement,{childList:true,subtree:true});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
