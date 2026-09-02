/* Chama -> ShopAds: acesso isolado à central de divulgadores. */
(function(){
'use strict';
const DEST='https://alibr.com.br/shopads-divulgar.html?source=chama';
function install(){
  const top=document.querySelector('.topbar');
  if(!top||document.getElementById('chamaEarnBtn'))return;
  const ads=document.getElementById('chamaAdsBtn'),boost=document.getElementById('chamaShopAdsBtn'),logout=document.getElementById('logoutBtn');
  const b=document.createElement('button');
  b.id='chamaEarnBtn';b.type='button';b.className='iconbtn';b.textContent='💰 Ganhar';b.title='Ganhar divulgando campanhas do Shop Ads';
  b.onclick=()=>window.open(DEST,'_blank','noopener');
  if(ads)top.insertBefore(b,ads);else if(boost)top.insertBefore(b,boost);else if(logout)top.insertBefore(b,logout);else top.appendChild(b);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
window.ChamaShopAdsEarn={open:()=>window.open(DEST,'_blank','noopener')};
})();