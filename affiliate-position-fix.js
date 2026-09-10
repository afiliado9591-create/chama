(()=>{
  const STYLE_ID='chamaAffiliatePositionFixV1';
  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='.chama-affiliate-fab{transition:none!important}';
    document.head.appendChild(s);
  }
  function update(){
    const fab=document.querySelector('.chama-affiliate-fab');
    if(!fab)return;
    const composer=document.querySelector('.composer');
    const vv=window.visualViewport;
    const viewportHeight=vv?.height||window.innerHeight||0;
    let bottom=18;
    if(composer){
      const r=composer.getBoundingClientRect();
      if(r.height>0 && r.top<viewportHeight && r.bottom>r.top){
        bottom=Math.max(18,Math.ceil(viewportHeight-r.top+14));
      }
    }
    fab.style.bottom=bottom+'px';
  }
  function start(){
    addStyle();
    update();
    window.addEventListener('resize',update,{passive:true});
    window.visualViewport?.addEventListener('resize',update,{passive:true});
    window.visualViewport?.addEventListener('scroll',update,{passive:true});
    const obs=new MutationObserver(()=>update());
    obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    setTimeout(update,120);
    setTimeout(update,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
