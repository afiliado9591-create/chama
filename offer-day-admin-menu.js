(()=>{
  function install(){
    const head=document.querySelector('#adminModal .admin-head');
    if(!head||document.getElementById('offerDayAdminLink'))return;
    const a=document.createElement('a');
    a.id='offerDayAdminLink';
    a.href='./admin.html#chamaAffiliateDayAdminCard';
    a.textContent='⭐ Oferta do Dia';
    a.title='Liberar o usuário que poderá escolher a Oferta do Dia';
    a.style.cssText='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;background:#fff6df;color:#855000;border:1px solid #f0d28b;border-radius:10px;padding:9px 10px;font-size:12px;font-weight:850;white-space:nowrap';
    const close=head.querySelector('.admin-close');
    head.insertBefore(a,close||null);
  }
  const mo=new MutationObserver(install);
  mo.observe(document.documentElement,{childList:true,subtree:true});
  install();
})();
