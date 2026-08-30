(()=>{
  const BASE=location.origin+location.pathname;
  const enc=v=>encodeURIComponent(String(v||''));
  async function share(title,text,url){
    try{
      if(navigator.share){await navigator.share({title,text,url});return;}
      await navigator.clipboard.writeText(url);alert('Link copiado!');
    }catch(e){if(e?.name!=='AbortError')prompt('Copie este link:',url)}
  }
  function button(label,fn){const b=document.createElement('button');b.className='secondary share-btn';b.type='button';b.textContent=label;b.onclick=fn;return b}
  function profileData(){return window.currentProfile||window.myProfile||null}
  function addProfileShare(){
    const actions=document.getElementById('profileActions');if(!actions||actions.querySelector('[data-share-profile]'))return;
    const p=profileData();if(!p)return;
    const uid=p.uid||p.id;if(!uid)return;
    const b=button('🔗 Compartilhar perfil',()=>share('Perfil no Chama',`Veja o perfil de ${p.nome||p.name||'usuário'} no Chama`,`${BASE}?perfil=${enc(uid)}`));b.dataset.shareProfile='1';actions.prepend(b)
  }
  function addCatalogShare(){
    const actions=document.getElementById('catalogOwnerActions');const title=document.getElementById('catalogTitle');if(!actions||actions.querySelector('[data-share-catalog]'))return;
    const p=window.currentCatalogUser||profileData();if(!p)return;const uid=p.uid||p.id;if(!uid)return;
    const b=button('🔗 Compartilhar catálogo',()=>share('Catálogo no Chama',`Veja o catálogo de ${p.nome||p.name||'usuário'} no Chama`,`${BASE}?catalogo=${enc(uid)}`));b.dataset.shareCatalog='1';actions.prepend(b)
  }
  function addProductShares(){
    document.querySelectorAll('#catalogGrid .product').forEach((card,i)=>{if(card.querySelector('[data-share-product]'))return;const p=window.currentCatalogUser||profileData();const uid=p?.uid||p?.id;if(!uid)return;const title=card.querySelector('.product-title')?.textContent?.trim()||'Produto';const b=button('↗ Compartilhar produto',()=>share(title,`Veja este produto no Chama: ${title}`,`${BASE}?produto=${enc(uid)}-${i}`));b.dataset.shareProduct='1';b.style.marginTop='8px';const body=card.querySelector('.product-body')||card;body.appendChild(b)})
  }
  const obs=new MutationObserver(()=>{addProfileShare();addCatalogShare();addProductShares()});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(()=>{addProfileShare();addCatalogShare();addProductShares()},30),true);
  const style=document.createElement('style');style.textContent='.share-btn{font-size:13px}.product .share-btn{padding:9px 8px;margin-top:8px}';document.head.appendChild(style);
})();