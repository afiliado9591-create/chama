(()=>{
  const STYLE_ID='chamaHomeProfileMessageStyleV1';
  let me=null,db=null,fs=null,lastSignature='';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #usersList .user-main{min-width:0;flex:1}
      .chama-profile-home-message{margin-top:3px;font-size:12px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px}
      .chama-profile-home-message.social{color:#66736d}
      .chama-profile-home-message.commercial{color:#9a5b00;font-weight:750}
      .chama-profile-home-message .kind{font-size:10px;font-weight:900;margin-right:4px;opacity:.9}
      @media(max-width:380px){.chama-profile-home-message{max-width:185px;font-size:11px}}
    `;document.head.appendChild(s);
  }

  function cleanText(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,70)}
  function cleanType(v){return v==='commercial'?'commercial':'social'}

  function renderRow(row,data={}){
    const main=row.querySelector('.user-main');if(!main)return;
    main.querySelector('.chama-profile-home-message')?.remove();
    const text=cleanText(data.homeMessage);if(!text)return;
    const type=cleanType(data.homeMessageType),el=document.createElement('div');
    el.className='chama-profile-home-message '+type;el.title=text;
    const kind=document.createElement('span');kind.className='kind';kind.textContent=type==='commercial'?'🛍️':'💬';
    const value=document.createElement('span');value.textContent=text;el.append(kind,value);
    const email=main.querySelector('.user-email');if(email)main.insertBefore(el,email);else main.appendChild(el);
  }

  async function load(){
    if(!me||!db||!fs)return;
    const rows=[...document.querySelectorAll('#usersList .user:not(.chama-search-bridge)')].filter(r=>r.dataset.uid&&r.dataset.uid!==me.uid).slice(0,20);
    const ids=[...new Set(rows.map(r=>r.dataset.uid))];if(!ids.length)return;
    const signature=ids.slice().sort().join('|');if(signature===lastSignature)return;lastSignature=signature;
    try{
      const snap=await fs.getDocs(fs.query(fs.collection(db,'publicProfiles'),fs.where(fs.documentId(),'in',ids)));
      const profiles=new Map();snap.forEach(d=>profiles.set(d.id,d.data()||{}));
      rows.forEach(row=>renderRow(row,profiles.get(row.dataset.uid)||{}));
    }catch(e){console.warn('Chama: não foi possível carregar mensagens da home',e)}
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,u=>{me=u||null;lastSignature='';if(u){setTimeout(load,700);setTimeout(load,1800)}});
    }catch(e){console.warn('Chama: mensagens da home não iniciaram',e)}
  }

  function start(){addStyle();initFirebase()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();