/* Integração Chama -> ShopAds desativada temporariamente para diagnóstico de consumo do Firestore. */
(function(){
  'use strict';
  document.getElementById('chamaEarnBtn')?.remove();
  document.getElementById('chamaAdsBtn')?.remove();
  document.getElementById('chamaShopAdsBtn')?.remove();
  delete window.ChamaShopAdsEarn;
})();
