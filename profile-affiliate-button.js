(()=>{
  const BUTTON_ID='chamaForYouButton';
  let fs=null,db=null,currentUid='',requestToken=0;

  function safeUrl(value){
    try{const u=new URL(String(value||'').trim());return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}
  }

  function addStyle(){
    if(document.getElementById('chamaForYouStyle'))return;
    const s=document.createElement('style');s.id='chamaForYouStyle';
    s.textContent=`
      #chatName{max-width:min(42vw,310px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .chat-head>div:has(#chatName){min-width:0;flex:1}
      #${BUTTON_ID}{margin-left:auto;flex:0 0 auto;border:0;border-radius:999px;padding:10px 14px;background:linear-gradient(135deg,#ff8a00,#ff3d71);color:#fff;font-weight:950;font-size:14px;box-shadow:0 5px 15px #ff4e5060;cursor:pointer;white-space:nowrap;text-decoration:none;align-items:center;gap:5px}
      #${BUTTON_ID}:active{transform:scale(.97)}
      @media(max-width:370px){#${BUTTON_ID}{padding:9px 10px;font-size:12px}#chatEmail{display:none}}
    `;document.head.appendChild(s);
  }

  function ensureButton(){
    let b=document.getElementById(BUTTON_ID);if(b)return b;
    const head=document.querySelector('.chat-head');if(!head)return null;
    b=document.createElement('a');b.id=BUTTON_ID;b.target='_blank';b.rel='noopener sponsored';b.textContent='🎁 Pra você';b.style.display='none';
    head.appendChild(b);return b;
  }

  async function loadLink(uid){
    const token=++requestToken,current=String(uid||'');currentUid=current;
    const b=ensureButton();if(!b)return;
    b.removeAttribute('href');b.style.display='none';
    b.setAttribute('aria-disabled','true');b.title='';
    if(!current||!db||!fs)return;
    try{
      const [own,base]=await Promise.all([
        fs.getDoc(fs.doc(db,'appConfig','affiliateLink_'+current)),
        fs.getDoc(fs.doc(db,'appConfig','affiliateLink_default'))
      ]);
      if(token!==requestToken||currentUid!==current)return;
      const url=safeUrl(own.exists()?own.data()?.url:'')||safeUrl(base.exists()?base.data()?.url:'');
      if(url){b.href=url;b.style.display='inline-flex';b.removeAttribute('aria-disabled');b.title='Abrir oferta escolhida para você'}
      else{b.style.display='none';b.title=''}
    }catch(e){console.warn('Chama: link Pra você indisponível',e);if(token===requestToken)b.style.display='none'}
  }

  async function init(){
    addStyle();ensureButton();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];
      for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');db=fs.getFirestore(app);
    }catch(e){console.warn('Chama: botão Pra você não iniciou',e)}
  }

  document.addEventListener('chama-chat-opened',e=>loadLink(e?.detail?.uid||''));
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();