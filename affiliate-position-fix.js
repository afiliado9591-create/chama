(()=>{
  const STYLE_ID='chamaAffiliatePositionFixV2';
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
    const innerH=window.innerHeight||0;
    const visualH=vv?.height||innerH;
    const keyboardGap=Math.max(0,innerH-visualH);
    let bottom=18;

    // When the keyboard is open, keep the bag clearly above the composer.
    // visualViewport height can differ from the layout viewport on Android,
    // so use the keyboard gap rather than only the composer's coordinates.
    if(keyboardGap>120){
      bottom=Math.max(150,keyboardGap+130);
    }else if(composer){
      const r=composer.getBoundingClientRect();
      if(r.height>0 && r.top<innerH && r.bottom>r.top){
        bottom=Math.max(18,Math.ceil(innerH-r.top+14));
      }
    }

    fab.style.bottom=bottom+'px';
    fab.style.right='14px';
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
    setTimeout(update,1000);
    setTimeout(update,1800);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
