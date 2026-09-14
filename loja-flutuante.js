(()=>{
  'use strict';
  function init(){
    if(document.getElementById('chamaFloatingStore')) return;
    if(!document.getElementById('appView')) return;

    const style=document.createElement('style');
    style.id='chamaFloatingStoreStyle';
    style.textContent=`
      #chamaFloatingStore{
        position:fixed;right:10px;bottom:calc(18px + env(safe-area-inset-bottom));
        z-index:9998;display:none;align-items:center;justify-content:center;
        width:52px;height:52px;border:0;border-radius:50%;
        background:#0b7a53;color:#fff;text-decoration:none;
        box-shadow:0 5px 18px #0003;font-size:24px;cursor:pointer;
        -webkit-tap-highlight-color:transparent;
      }
      #chamaFloatingStore span{display:block;font-size:11px;font-weight:800;line-height:1;margin-top:2px}
      #chamaFloatingStore .storeIcon{display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
      #chamaFloatingStore:active{transform:scale(.94)}
      @media(max-width:700px){#chamaFloatingStore{right:8px;width:48px;height:48px;font-size:21px}}
    `;
    document.head.appendChild(style);

    const a=document.createElement('button');
    a.id='chamaFloatingStore';
    a.type='button';
    a.title='Loja';
    a.setAttribute('aria-label','Abrir Loja');
    a.innerHTML='<div class="storeIcon">🛍️<span>Loja</span></div>';
    a.addEventListener('click',()=>{
      const statusEntry=document.getElementById('chamaStatusEntry');
      if(statusEntry){statusEntry.click();return;}
      document.dispatchEvent(new CustomEvent('chama-open-loja'));
    });
    document.body.appendChild(a);

    function sync(){
      const app=document.getElementById('appView');
      const visible=app && !app.classList.contains('hidden');
      a.style.display=visible?'flex':'none';
      position();
    }

    function position(){
      if(a.style.display==='none') return;
      const composer=document.getElementById('composer');
      const active=document.getElementById('activeChat');
      const isChatOpen=active && !active.classList.contains('hidden');
      if(isChatOpen && composer){
        const r=composer.getBoundingClientRect();
        const h=window.innerHeight||document.documentElement.clientHeight||0;
        if(r.height>0 && r.top<h && r.bottom>r.top){
          // Mantém a Loja acima do campo de mensagem, sem cobrir o botão Enviar.
          a.style.bottom=Math.max(12,Math.ceil(h-r.top+10))+'px';
          a.style.right='10px';
          return;
        }
      }
      a.style.bottom='calc(14px + env(safe-area-inset-bottom))';
      a.style.right='8px';
    }

    sync();
    const obs=new MutationObserver(()=>{sync()});
    const app=document.getElementById('appView');
    if(app) obs.observe(app,{attributes:true,attributeFilter:['class']});
    const bodyObs=new MutationObserver(()=>position());
    bodyObs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    window.addEventListener('resize',position,{passive:true});
    window.visualViewport?.addEventListener('resize',position,{passive:true});
    window.visualViewport?.addEventListener('scroll',position,{passive:true});
    setTimeout(sync,200);
    setTimeout(sync,700);
    setTimeout(sync,1500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
