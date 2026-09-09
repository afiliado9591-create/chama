(()=>{
  const STYLE_ID='chamaHomeSelfProfileClickStyleV1';
  function start(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='.chama-self-row{cursor:pointer!important}.chama-self-row:active{background:#eef7f2!important}';
    document.head.appendChild(s);
    document.addEventListener('click',e=>{
      const row=e.target?.closest?.('#chamaSelfRow');
      if(!row)return;
      e.preventDefault();e.stopPropagation();
      document.dispatchEvent(new CustomEvent('chama-open-my-profile'));
    },true);
    const clean=()=>{
      document.querySelectorAll('[data-chama-chat-loading-v119]').forEach(el=>el.remove());
    };
    clean();
    const messages=document.getElementById('messages');
    if(messages)new MutationObserver(clean).observe(messages,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
