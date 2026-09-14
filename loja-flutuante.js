(function(){
  'use strict';
  function init(){
    if(document.getElementById('chamaFloatingStore')) return;
    if(!document.getElementById('appView')) return;

    const style=document.createElement('style');
    style.id='chamaFloatingStoreStyle';
    style.textContent=`
      #chamaFloatingStore{
        position:fixed;right:10px;top:50%;transform:translateY(-50%);
        z-index:9998;display:none;align-items:center;justify-content:center;
        width:52px;height:52px;border:0;border-radius:50%;
        background:#0b7a53;color:#fff;text-decoration:none;
        box-shadow:0 5px 18px #0003;font-size:24px;cursor:pointer;
        -webkit-tap-highlight-color:transparent;
      }
      #chamaFloatingStore span{display:block;font-size:11px;font-weight:800;line-height:1;margin-top:2px}
      #chamaFloatingStore .storeIcon{display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
      #chamaFloatingStore:active{transform:translateY(-50%) scale(.94)}
      @media(max-width:700px){#chamaFloatingStore{right:8px;width:48px;height:48px;font-size:21px}}
    `;
    document.head.appendChild(style);

    const a=document.createElement('a');
    a.id='chamaFloatingStore';
    a.href=window.CHAMA_STORE_URL||'https://alibr.com.br';
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.title='Loja';
    a.setAttribute('aria-label','Abrir Loja');
    a.innerHTML='<div class="storeIcon">🛍️<span>Loja</span></div>';
    document.body.appendChild(a);

    function sync(){
      const app=document.getElementById('appView');
      const visible=app && !app.classList.contains('hidden');
      a.style.display=visible?'flex':'none';
    }
    sync();
    const obs=new MutationObserver(sync);
    const app=document.getElementById('appView');
    if(app) obs.observe(app,{attributes:true,attributeFilter:['class']});
    setTimeout(sync,500);
    setTimeout(sync,1500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
