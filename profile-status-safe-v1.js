(()=>{
  'use strict';
  const STYLE_ID='chamaProfileStatusSafeV1';
  let started=false;
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
    .chama-safe-profile-btn{display:inline-flex;align-items:center;gap:6px;margin-left:8px;border:0;border-radius:10px;padding:7px 10px;background:#eef8f3;color:#0b7a53;font-weight:800;cursor:pointer}
    .chama-safe-status{margin:0 16px 12px;padding:12px;border:1px solid #e2e8e4;border-radius:14px;background:#fff}
    .chama-safe-status-title{font-size:12px;font-weight:800;color:#66736d;margin-bottom:7px}.chama-safe-status-row{display:flex;gap:7px}.chama-safe-status-row input{flex:1;min-width:0;border:1px solid #ccd6d1;border-radius:10px;padding:9px 11px}.chama-safe-status-row button{border:0;border-radius:10px;background:#0b7a53;color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}
  `;document.head.appendChild(s)}
  function openProfile(){document.dispatchEvent(new CustomEvent('chama-open-my-profile'));if(typeof window.chamaOpenMyProfile==='function')window.chamaOpenMyProfile()}
  function mount(){if(started)return;started=true;style();const me=document.querySelector('.me');if(me&&!document.getElementById('chamaSafeProfileBtn')){const b=document.createElement('button');b.id='chamaSafeProfileBtn';b.className='chama-safe-profile-btn';b.type='button';b.textContent='👤 Perfil';b.onclick=openProfile;me.appendChild(b)} }
  function boot(){mount();setTimeout(mount,800);setTimeout(mount,1800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
