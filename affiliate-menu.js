(()=>{
  const STYLE_ID='chamaAffiliateMenuStyleV3';
  let db=null,fs=null,loaded=false;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-affiliate-fab{position:fixed;right:16px;bottom:18px;width:58px;height:58px;border-radius:50%;border:0;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:30px;line-height:1;cursor:pointer;z-index:1800;box-shadow:0 7px 20px #0003;animation:chamaBagPulse 2.2s infinite}
      .chama-affiliate-fab:active{transform:scale(.94)}
      @keyframes chamaBagPulse{0%,100%{box-shadow:0 7px 20px #0003}50%{box-shadow:0 7px 25px #0b7a5366}}
      .chama-affiliate-panel{position:fixed;right:14px;bottom:86px;width:min(300px,calc(100vw - 28px));background:#fff;border-radius:20px;padding:12px;z-index:1801;box-shadow:0 14px 40px #0003;border:1px solid #e5ece8}
      .chama-affiliate-title{font-weight:900;font-size:15px;color:#18352a;margin:2px 4px 10px}
      .chama-affiliate-btn{display:flex;align-items:center;justify-content:center;min-height:48px;margin:7px 0;text-decoration:none;background:#f4f8f6;color:#0b7a53;border:1px solid #d8e7df;border-radius:13px;padding:10px;font-size:14px;font-weight:850;text-align:center}
      .chama-affiliate-btn.featured{background:linear-gradient(135deg,#fff7e6,#ffedc2);color:#8b4b00;border-color:#f4b94f}
      .chama-affiliate-edit{display:none}
      .chama-admin .chama-affiliate-edit{display:block}
      .chama-affiliate-edit button{width:100%;border:1px solid #d8e7df;border-radius:11px;background:#fff;padding:8px;font-weight:850;color:#0b7a53;cursor:pointer}
      .chama-affiliate-close{float:right;border:0;background:transparent;font-size:20px;cursor:pointer;color:#667}
    `;document.head.appendChild(s);
  }
  function safeUrl(value){let v=String(value||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function render(buttons=[]){
    document.getElementById('chamaAffiliateWrap')?.remove();
    const valid=(Array.isArray(buttons)?buttons:[]).slice(0,3).map(x=>({label:String(x?.label||'').trim().slice(0,24),url:safeUrl(x?.url||''),enabled:x?.enabled!==false,featured:x?.featured===true})).filter(x=>x.enabled&&x.label&&x.url);
    if(!valid.length)return;
    const wrap=document.createElement('div');wrap.id='chamaAffiliateWrap';
    const fab=document.createElement('button');fab.className='chama-affiliate-fab';fab.type='button';fab.textContent='🛍️';fab.title='Ofertas';fab.setAttribute('aria-label','Abrir ofertas');
    const panel=document.createElement('div');panel.className='chama-affiliate-panel';panel.hidden=true;
    const close=document.createElement('button');close.className='chama-affiliate-close';close.type='button';close.textContent='×';close.title='Fechar';
    const title=document.createElement('div');title.className='chama-affiliate-title';title.textContent='🛍️ Ofertas e links';panel.append(close,title);
    let featuredUsed=false;
    valid.forEach(item=>{const row=document.createElement('div');const a=document.createElement('a');a.className='chama-affiliate-btn';if(item.featured&&!featuredUsed){a.classList.add('featured');featuredUsed=true}a.href=item.url;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent=item.label;row.appendChild(a);panel.appendChild(row)});
    fab.onclick=()=>{panel.hidden=!panel.hidden};close.onclick=()=>{panel.hidden=true};
    wrap.append(fab,panel);document.body.appendChild(wrap);
  }
  async function init(){
    if(loaded)return;loaded=true;addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{document.getElementById('chamaAffiliateWrap')?.remove();if(!user)return;try{const snap=await fs.getDoc(fs.doc(db,'appConfig','affiliateMenu'));render(snap.exists()?snap.data()?.buttons||[]:[])}catch(e){console.warn('Chama: menu afiliados',e)}});
    }catch(e){console.warn('Chama: menu afiliados não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();