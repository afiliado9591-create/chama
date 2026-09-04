(()=>{
  if(!/\/admin\.html$/i.test(location.pathname))return;

  function ensureNativeEditorNotice(){
    if(document.getElementById('chamaAffiliateDayAdminCard'))return;
    const panel=document.getElementById('panel');if(!panel)return;
    const card=document.createElement('section');card.id='chamaAffiliateDayAdminCard';card.className='card';
    card.innerHTML='<h2>⭐ Dia do Afiliado — catálogo</h2><p class="muted">O editor do catálogo faz parte do Painel do Admin atual. Toque em Atualizar para carregar a versão mais recente.</p><button type="button" style="width:100%;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:11px 14px;font-weight:850">Atualizar painel</button>';
    card.querySelector('button').onclick=()=>location.reload();
    const affiliate=document.querySelector('#affiliateGrid')?.closest('.card');
    if(affiliate)affiliate.insertAdjacentElement('afterend',card);else panel.prepend(card);
  }

  function start(){
    if(document.getElementById('chamaAffiliateDayAdminCard'))return;
    setTimeout(ensureNativeEditorNotice,300);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();