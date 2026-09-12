(()=>{
  if(window.__chamaOfferDayPositionLoaded)return;
  window.__chamaOfferDayPositionLoaded=true;
  const place=()=>{
    const b=document.getElementById('chamaOfferDayBanner');
    if(!b)return;
    const top=document.querySelector('.topbar,header');
    if(top&&top.parentElement){
      if(b.previousElementSibling!==top) top.insertAdjacentElement('afterend',b);
    }else{
      const main=document.querySelector('main,#app,#root,.app');
      if(main&&main.parentElement&&b.parentElement!==main) main.insertAdjacentElement('afterbegin',b);
    }
  };
  const style=document.createElement('style');
  style.textContent='#chamaOfferDayBanner{z-index:20!important}';
  document.head.appendChild(style);
  new MutationObserver(place).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',place);
  setTimeout(place,300);setTimeout(place,1000);setTimeout(place,2500);
})();
