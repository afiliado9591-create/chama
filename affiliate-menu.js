(()=>{
  const STYLE_ID='chamaAffiliateMenuStyleV2';
  let db=null,fs=null,loaded=false;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .chama-affiliate-menu{display:flex;gap:8px;padding:10px 12px;background:#fff;border-bottom:1px solid #edf0ee}
      .chama-affiliate-btn{flex:1;min-width:0;min-height:48px;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;background:#fff;color:#0b7a53;border:1px solid #d8e7df;border-radius:14px;padding:10px 8px;font-size:13px;font-weight:850;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 7px #14221c0a;position:relative}
      .chama-affiliate-btn:active{transform:scale(.98);background:#eef7f2}
      .chama-affiliate-btn.featured{background:linear-gradient(135deg,#fff7e6 0%,#ffedc2 100%)!important;color:#8b4b00!important;border:1px solid #f4b94f!important;box-shadow:0 4px 12px #d88a001c!important;padding-top:22px!important}
      .chama-affiliate-btn.featured::before{content:'🔥 DESTAQUE';position:absolute;top:5px;left:7px;font-size:9px;font-weight:950;letter-spacing:.04em;color:#a55a00}
      @media(max-width:380px){.chama-affiliate-menu{gap:6px;padding:9px 8px}.chama-affiliate-btn{font-size:12px;padding:9px 5px}.chama-affiliate-btn.featured{padding-top:21px!important}}
    `;
    document.head.appendChild(s);
  }

  function safeUrl(value){
    let v=String(value||'').trim();
    if(!v)return '';
    if(!/^https?:\/\//i.test(v))v='https://'+v;
    try{
      const u=new URL(v);
      return u.protocol==='https:'?u.href:'';
    }catch{return ''}
  }

  function render(buttons=[]){
    document.getElementById('chamaAffiliateMenu')?.remove();
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return;
    const valid=(Array.isArray(buttons)?buttons:[]).slice(0,3).map(x=>({
      label:String(x?.label||'').trim().slice(0,24),
      url:safeUrl(x?.url||''),
      enabled:x?.enabled!==false,
      featured:x?.featured===true
    })).filter(x=>x.enabled&&x.label&&x.url);
    if(!valid.length)return;

    let featuredUsed=false;
    const box=document.createElement('nav');
    box.id='chamaAffiliateMenu';
    box.className='chama-affiliate-menu';
    box.setAttribute('aria-label','Ofertas e links recomendados');
    for(const item of valid){
      const a=document.createElement('a');
      a.className='chama-affiliate-btn';
      if(item.featured&&!featuredUsed){a.classList.add('featured');featuredUsed=true}
      a.href=item.url;
      a.target='_blank';
      a.rel='noopener noreferrer sponsored';
      a.textContent=item.label;
      a.title=item.featured?`Destaque: ${item.label}`:item.label;
      box.appendChild(a);
    }
    sidebar.insertBefore(box,sidebar.firstChild);
  }

  async function init(){
    if(loaded)return;loaded=true;addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];
      for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{
        document.getElementById('chamaAffiliateMenu')?.remove();
        if(!user)return;
        try{
          const snap=await fs.getDoc(fs.doc(db,'appConfig','affiliateMenu'));
          render(snap.exists()?snap.data()?.buttons||[]:[]);
        }catch(e){console.warn('Chama: não foi possível carregar o menu de afiliados',e)}
      });
    }catch(e){console.warn('Chama: menu de afiliados não iniciou',e)}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();