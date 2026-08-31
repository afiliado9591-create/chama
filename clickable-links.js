(()=>{
  const URL_RE=/(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
  const MEDIA_PREFIX="__CHAMA_MEDIA__";
  const trimEnd=url=>{let end="";while(/[.,!?;:)]$/.test(url)){end=url.slice(-1)+end;url=url.slice(0,-1)}return [url,end]};
  function linkifyBubble(bubble){
    if(!bubble||bubble.dataset.linksReady==="1")return;
    const raw=(bubble.textContent||"").trimStart();
    if(raw.startsWith(MEDIA_PREFIX))return;
    const walker=document.createTreeWalker(bubble,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(node.parentElement?.closest("a,.time"))return;
      const text=node.nodeValue||"";if(!URL_RE.test(text)){URL_RE.lastIndex=0;return}URL_RE.lastIndex=0;
      const frag=document.createDocumentFragment();let last=0;
      text.replace(URL_RE,(raw,_,offset)=>{frag.append(document.createTextNode(text.slice(last,offset)));const [url,end]=trimEnd(raw);const a=document.createElement("a");a.href=/^www\./i.test(url)?"https://"+url:url;a.textContent=url;a.target="_blank";a.rel="noopener noreferrer";a.style.color="inherit";a.style.textDecoration="underline";a.style.fontWeight="700";frag.append(a);if(end)frag.append(document.createTextNode(end));last=offset+raw.length;return raw});
      frag.append(document.createTextNode(text.slice(last)));node.replaceWith(frag);
    });
    bubble.dataset.linksReady="1";
  }
  let scheduled=false;
  function scan(){scheduled=false;document.querySelectorAll("#messages .bubble").forEach(linkifyBubble)}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(scan)}
  function start(){scan();const messages=document.getElementById("messages");if(messages)new MutationObserver(schedule).observe(messages,{childList:true})}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();
