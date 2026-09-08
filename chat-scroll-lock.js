(()=>{
  const STYLE_ID='chamaPermanentChatLockV1';
  let savedY=0,startY=0,locked=false;

  function mobile(){return matchMedia('(max-width:700px)').matches}
  function panel(){return document.getElementById('chatPanel')}
  function messages(){return document.getElementById('messages')}
  function isOpen(){const p=panel();return !!p&&mobile()&&!p.classList.contains('hidden-mobile')}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      @media(max-width:700px){
        html.chama-chat-locked,body.chama-chat-locked{overflow:hidden!important;overscroll-behavior:none!important;height:100%!important;max-height:100%!important}
        body.chama-chat-locked{position:fixed!important;left:0!important;right:0!important;width:100%!important}
        body.chama-chat-locked #chatPanel{display:flex!important;position:fixed!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100vw!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;margin:0!important;transform:none!important;z-index:2147483000!important;overflow:hidden!important;overscroll-behavior:none!important;background:#eef2ef!important}
        body.chama-chat-locked #activeChat{display:flex!important;flex-direction:column!important;width:100%!important;height:100dvh!important;min-height:0!important;max-height:100dvh!important;overflow:hidden!important}
        body.chama-chat-locked #messages{flex:1 1 auto!important;min-height:0!important;height:auto!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:none!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important}
        body.chama-chat-locked .chat-head,body.chama-chat-locked .composer{flex:0 0 auto!important;position:relative!important;z-index:2!important}
      }
    `;document.head.appendChild(s);
  }

  function lock(){
    if(locked||!isOpen())return;
    locked=true;savedY=scrollY||document.documentElement.scrollTop||0;
    document.documentElement.classList.add('chama-chat-locked');
    document.body.classList.add('chama-chat-locked');
    document.body.style.top='-'+savedY+'px';
  }
  function unlock(){
    if(!locked)return;
    locked=false;document.documentElement.classList.remove('chama-chat-locked');
    document.body.classList.remove('chama-chat-locked');document.body.style.top='';
    scrollTo(0,savedY);
  }
  function sync(){isOpen()?lock():unlock()}

  function onTouchStart(e){
    if(!locked)return;const box=messages();if(!box||!box.contains(e.target))return;
    startY=e.touches?.[0]?.clientY||0;
  }
  function onTouchMove(e){
    if(!locked)return;
    const box=messages();
    if(!box||!box.contains(e.target)){e.preventDefault();return}
    const y=e.touches?.[0]?.clientY||0,delta=y-startY;
    const atTop=box.scrollTop<=0;
    const atBottom=Math.ceil(box.scrollTop+box.clientHeight)>=box.scrollHeight;
    if((atTop&&delta>0)||(atBottom&&delta<0))e.preventDefault();
    e.stopPropagation();
  }
  function onWheel(e){
    if(!locked)return;const box=messages();
    if(!box||!box.contains(e.target)){e.preventDefault();return}
    const atTop=box.scrollTop<=0,atBottom=Math.ceil(box.scrollTop+box.clientHeight)>=box.scrollHeight;
    if((atTop&&e.deltaY<0)||(atBottom&&e.deltaY>0))e.preventDefault();
    e.stopPropagation();
  }

  function start(){
    addStyle();
    document.addEventListener('chama-chat-opened',()=>setTimeout(()=>{locked=false;sync()},0));
    document.addEventListener('touchstart',onTouchStart,{passive:true,capture:true});
    document.addEventListener('touchmove',onTouchMove,{passive:false,capture:true});
    document.addEventListener('wheel',onWheel,{passive:false,capture:true});
    const p=panel();if(p)new MutationObserver(sync).observe(p,{attributes:true,attributeFilter:['class']});
    addEventListener('resize',sync);addEventListener('orientationchange',()=>setTimeout(sync,150));
    setInterval(sync,500);
    sync();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();