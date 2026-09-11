(()=>{
  const STYLE_ID='chamaHomeSelfProfileClickStyleV2';
  function hideSuggestions(){document.querySelectorAll('#chamaSuggestions,.chama-suggestions').forEach(el=>{el.style.setProperty('display','none','important')})}
  function loadSegments(){
    if(document.querySelector('script[data-chama-segment-groups="1"]'))return;
    const s=document.createElement('script');
    s.src='./segment-groups-ui.js?v=2';
    s.async=true;
    s.dataset.chamaSegmentGroups='1';
    document.head.appendChild(s);
  }
  function start(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='.chama-self-row{cursor:pointer!important}.chama-self-row:active{background:#eef7f2!important}#chamaSuggestions,.chama-suggestions{display:none!important}';
    document.head.appendChild(s);
    hideSuggestions();
    loadSegments();
    const observer=new MutationObserver(()=>{hideSuggestions();loadSegments()});
    observer.observe(document.body,{childList:true,subtree:true});
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
