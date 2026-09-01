(()=>{
 const OPTIONS=['Mercado Livre','Shopee','Dridalia Modas','Shein','Temu','Magalu','Seus produtos'];
 function upgradeSelect(sel){
  if(!sel||sel.dataset.platformsExpanded==='1')return;
  const current=sel.value;
  const existing=new Set([...sel.options].map(o=>o.value||o.textContent));
  for(const name of OPTIONS){if(!existing.has(name)){const o=document.createElement('option');o.value=name;o.textContent=name;sel.appendChild(o)}}
  if(OPTIONS.includes(current))sel.value=current;
  sel.dataset.platformsExpanded='1';
 }
 function scan(root=document){root.querySelectorAll?.('select.p-platform').forEach(upgradeSelect);document.querySelectorAll('.catalog-note').forEach(n=>{if((n.textContent||'').includes('somando Mercado Livre e Shopee'))n.textContent='Cadastre até 30 produtos. Escolha a plataforma ou use “Seus produtos” para produtos próprios.'})}
 function start(){scan();new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1){if(n.matches?.('select.p-platform'))upgradeSelect(n);scan(n)}}}).observe(document.body,{childList:true,subtree:true})}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
