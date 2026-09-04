(()=>{
  const STYLE_ID='chamaCommunityCountStyleV1';
  let currentUid='';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .chama-community-count{margin-top:10px;display:inline-flex;align-items:center;gap:7px;background:#eef8f3;border:1px solid #d8ebe1;color:#0b7a53;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:850}
      .chama-community-count-dot{width:8px;height:8px;border-radius:50%;background:#16a36a;box-shadow:0 0 0 3px #16a36a1f}
    `;
    document.head.appendChild(s);
  }

  function render(count,enabled){
    const meBox=document.querySelector('.me');
    if(!meBox)return;
    let el=document.getElementById('chamaCommunityCount');
    if(!enabled||!Number.isFinite(count)||count<=0){el?.remove();return}
    if(!el){
      el=document.createElement('div');
      el.id='chamaCommunityCount';
      el.className='chama-community-count';
      meBox.appendChild(el);
    }
    el.innerHTML='<span class="chama-community-count-dot"></span><span></span>';
    el.querySelector('span:last-child').textContent=`${count.toLocaleString('pt-BR')} pessoas no Chama`;
  }

  async function init(){
    addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];
      for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,fs]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      const auth=authMod.getAuth(app),db=fs.getFirestore(app);
      authMod.onAuthStateChanged(auth,async user=>{
        currentUid=user?.uid||'';
        if(!user){render(0,false);return}
        const uid=user.uid;
        try{
          const snap=await fs.getDoc(fs.doc(db,'appConfig','communityCount'));
          if(currentUid!==uid)return;
          const d=snap.exists()?snap.data()||{}:{};
          const n=Math.max(0,Math.floor(Number(d.count||0)));
          render(n,d.enabled===true);
        }catch(e){console.warn('Chama: contador da comunidade não carregou',e);render(0,false)}
      });
    }catch(e){console.warn('Chama: contador da comunidade não iniciou',e)}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();