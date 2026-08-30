(()=>{
  function apply(){
    document.querySelectorAll('.topbar h2').forEach(h=>{
      if(h.querySelector('.br-brand'))return;
      const s=document.createElement('span');
      s.className='br-brand';
      s.textContent='100% brasileiro 🇧🇷';
      h.appendChild(s);
    });
    document.querySelectorAll('.brand h1').forEach(h=>{
      if(h.querySelector('.br-brand'))return;
      const s=document.createElement('span');
      s.className='br-brand br-brand-login';
      s.textContent='100% brasileiro 🇧🇷';
      h.appendChild(s);
    });
  }
  const style=document.createElement('style');
  style.textContent='.br-brand{font-size:10px;font-weight:600;opacity:.88;margin-left:7px;white-space:nowrap;vertical-align:middle}.br-brand-login{color:#0b7a53;opacity:.8}@media(max-width:380px){.br-brand{font-size:9px;margin-left:5px}}';
  document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();