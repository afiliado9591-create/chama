(()=>{
  if(window.__chamaMediaStabilityV1)return;
  window.__chamaMediaStabilityV1=1;
  const PREFIX='__CHAMA_MEDIA__';
  let lastChat='';
  const kept=new Map();
  const rawOf=b=>b?.dataset?.chamaRaw||'';
  function remember(nodes){
    nodes.forEach(n=>{
      if(!(n instanceof HTMLElement)||!n.classList.contains('bubble'))return;
      const raw=rawOf(n);
      if(raw.startsWith(PREFIX)) kept.set(raw,n);
    });
    while(kept.size>100){const k=kept.keys().next().value;kept.delete(k)}
  }
  function restore(box){
    if(!box)return;
    const current=new Set([...box.querySelectorAll('.bubble')].map(rawOf));
    for(const [raw,node] of kept){
      if(!raw||current.has(raw)||!node)return;
      const active=document.getElementById('activeChat');
      if(!active||active.classList.contains('hidden'))continue;
      box.appendChild(node);
    }
  }
  function observe(){
    const box=document.getElementById('messages');
    if(!box||box.dataset.chamaStability==='1')return;
    box.dataset.chamaStability='1';
    const chatScope=()=>((document.getElementById('chatEmail')?.textContent||'').trim().toLowerCase());
    lastChat=chatScope();
    new MutationObserver(records=>{
      const removed=[];let broad=false;
      records.forEach(r=>{
        if(r.type!=='childList')return;
        r.removedNodes.forEach(n=>removed.push(n));
        if(r.removedNodes.length>2) broad=true;
      });
      if(removed.length)remember(removed);
      const scope=chatScope();
      if(scope!==lastChat){lastChat=scope;kept.clear();return}
      if(broad){
        requestAnimationFrame(()=>setTimeout(()=>restore(box),0));
      }
    }).observe(box,{childList:true});
  }
  function boot(){observe();new MutationObserver(observe).observe(document.body,{childList:true,subtree:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
