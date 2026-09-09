(()=>{
  if(window.__chamaMediaStabilityV3)return;
  window.__chamaMediaStabilityV3=1;
  const PREFIX='__CHAMA_MEDIA__';
  const kept=new Map();
  let scope='';
  const getScope=()=>((document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase());
  function rawOf(b){
    const stored=b?.dataset?.chamaRaw||'';
    if(stored.startsWith(PREFIX))return stored;
    let text='';
    for(const n of b?.childNodes||[]){
      if(n.nodeType===Node.TEXT_NODE)text+=n.nodeValue||'';
      else if(n.nodeType===Node.ELEMENT_NODE&&!n.classList.contains('time')&&!n.classList.contains('chama-msg-menu-btn'))text+=n.textContent||'';
    }
    return text.trim();
  }
  function remember(node){
    if(!(node instanceof HTMLElement)||!node.classList.contains('bubble'))return;
    const raw=rawOf(node);
    if(!raw.startsWith(PREFIX))return;
    kept.set(raw,{node:node.cloneNode(true),scope:getScope()});
    while(kept.size>100)kept.delete(kept.keys().next().value);
  }
  function rememberAll(box){
    if(!box)return;
    box.querySelectorAll('.bubble').forEach(remember);
  }
  function currentRaw(box){
    return new Set([...box.querySelectorAll('.bubble')].map(rawOf).filter(x=>x.startsWith(PREFIX)));
  }
  function restore(box){
    if(!box||scope!==getScope())return;
    const current=currentRaw(box);
    for(const [raw,item] of kept){
      if(item.scope!==scope||current.has(raw))continue;
      const node=item.node.cloneNode(true);
      node.dataset.chamaStabilityRestored='1';
      box.appendChild(node);
    }
  }
  function installInnerHTMLGuard(){
    const proto=Element.prototype;
    const desc=Object.getOwnPropertyDescriptor(proto,'innerHTML');
    if(!desc?.set||window.__chamaMediaInnerHTMLGuard)return;
    window.__chamaMediaInnerHTMLGuard=1;
    Object.defineProperty(proto,'innerHTML',{
      configurable:desc.configurable,
      enumerable:desc.enumerable,
      get:desc.get,
      set(value){
        if(this?.id==='messages'&&value===''){
          const box=this;
          rememberAll(box);
          scope=getScope();
          desc.set.call(this,value);
          setTimeout(()=>restore(box),0);
          return;
        }
        return desc.set.call(this,value);
      }
    });
  }
  function observe(){
    const box=document.getElementById('messages');
    if(!box)return;
    if(box.dataset.chamaStabilityV3==='1')return;
    box.dataset.chamaStabilityV3='1';
    scope=getScope();
    new MutationObserver(records=>{
      let removedMedia=false;
      records.forEach(r=>{
        if(r.type!=='childList')return;
        r.removedNodes.forEach(n=>{
          if(n instanceof HTMLElement){
            if(n.classList.contains('bubble')){const raw=rawOf(n);if(raw.startsWith(PREFIX)){remember(n);removedMedia=true}}
            else n.querySelectorAll?.('.bubble').forEach(b=>{const raw=rawOf(b);if(raw.startsWith(PREFIX)){remember(b);removedMedia=true}});
          }
        });
      });
      const nextScope=getScope();
      if(nextScope!==scope){scope=nextScope;kept.clear();return;}
      if(removedMedia)setTimeout(()=>restore(box),30);
    }).observe(box,{childList:true,subtree:true});
  }
  function boot(){
    installInnerHTMLGuard();
    observe();
    new MutationObserver(()=>observe()).observe(document.body,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
