(()=>{
  const STYLE_ID='chamaHomeSelfProfileClickStyleV7';
  function hideSuggestions(){document.querySelectorAll('#chamaSuggestions,.chama-suggestions').forEach(el=>{el.style.setProperty('display','none','important')})}
  function loadForceGroups(){
    const old=document.querySelector('script[data-chama-groups-force]');
    if(old)return;
    const s=document.createElement('script');
    s.src='./groups-force-ui.js?v=4';
    s.async=true;
    s.dataset.chamaGroupsForce='4';
    document.head.appendChild(s);
  }
  function start(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='.chama-self-row{cursor:pointer!important}.chama-self-row:active{background:#eef7f2!important}#chamaSuggestions,.chama-suggestions{display:none!important}#chamaGroupsForceBox,#chamaGroupsForceBox *{pointer-events:auto!important}#chamaGroupsForceBox .gf-row,#chamaGroupsForceBox .gf-enter,#chamaGroupsForceBox .gf-back{pointer-events:auto!important;touch-action:manipulation!important}';
    document.head.appendChild(s);
    hideSuggestions();
    loadForceGroups();
    const observer=new MutationObserver(()=>{
      hideSuggestions();
      if(!document.getElementById('chamaGroupsForceBox'))loadForceGroups();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',e=>{
      const row=e.target?.closest?.('#chamaSelfRow');
      if(!row)return;
      e.preventDefault();
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent('chama-open-my-profile'));
    },true);
    const clean=()=>{document.querySelectorAll('[data-chama-chat-loading-v119]').forEach(el=>el.remove())};
    clean();
    const messages=document.getElementById('messages');
    if(messages)new MutationObserver(clean).observe(messages,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
