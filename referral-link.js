(()=>{
  const STYLE_ID='chamaReferralLinkStyleV2';
  const PENDING_KEY='chama_pending_referrer_v1';
  const APPLIED_PREFIX='chama_referral_applied_v1_';
  let me=null,db=null,fs=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-referral-backdrop{position:fixed;inset:0;background:#0008;z-index:3600;display:grid;place-items:center;padding:16px}
      .chama-referral-card{width:min(420px,100%);background:#fff;border-radius:22px;box-shadow:0 24px 70px #0005;overflow:hidden}
      .chama-referral-top{display:flex;align-items:center;gap:11px;padding:17px 18px;border-bottom:1px solid #ece8dd;background:linear-gradient(135deg,#fffdf6,#fff7df)}
      .chama-referral-icon{width:44px;height:44px;border-radius:14px;background:#8c5b00;color:#fff;display:grid;place-items:center;font-size:22px;flex:0 0 44px}
      .chama-referral-title{flex:1;min-width:0}.chama-referral-title strong{display:block;color:#3d3320;font-size:17px}.chama-referral-title small{display:block;color:#7a6c4f;font-size:12px;margin-top:2px}
      .chama-referral-close{border:0;background:#fff;color:#8c5b00;width:38px;height:38px;border-radius:11px;font-size:19px;cursor:pointer}
      .chama-referral-body{padding:17px 18px}.chama-referral-body p{margin:0 0 12px;color:#58665f;font-size:13px;line-height:1.45}
      .chama-referral-url input{width:100%;border:1px solid #ddcfaa;background:#fffdf8;border-radius:12px;padding:11px 12px;font-size:12px;color:#5f5540;outline:none}
      .chama-referral-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.chama-referral-actions button{border:0;border-radius:11px;padding:11px 9px;font-weight:900;cursor:pointer}
      .chama-referral-copy-btn{background:#fff0c9;color:#805100}.chama-referral-share-btn{background:#17372b;color:#fff}
      .chama-referral-note{font-size:10px;color:#8b7d62;margin-top:9px;line-height:1.4}
      .chama-referral-mine{margin-top:14px;border-top:1px solid #eee6d1;padding-top:13px}.chama-referral-mine-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:900;color:#3d3320}.chama-referral-count{background:#fff0c9;color:#805100;border-radius:999px;padding:5px 9px;font-size:12px}.chama-referral-list{display:grid;gap:7px;margin-top:9px}.chama-referral-person{display:flex;align-items:center;gap:9px;background:#f7f9f8;border-radius:11px;padding:9px 10px}.chama-referral-avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#dff4ea;color:#0b7a53;font-weight:900;flex:0 0 34px}.chama-referral-person-main{min-width:0;flex:1}.chama-referral-person-name{font-size:13px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chama-referral-person-date{font-size:10px;color:#7b8781;margin-top:2px}.chama-referral-empty{font-size:12px;color:#78837e;background:#f7f9f8;border-radius:11px;padding:11px;margin-top:9px;text-align:center}
      @media(max-width:380px){.chama-referral-actions{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function encodeUid(uid){
    try{return btoa(String(uid||'')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch{return ''}
  }
  function decodeUid(code){
    try{let x=String(code||'').trim().replace(/-/g,'+').replace(/_/g,'/');while(x.length%4)x+='=';const uid=atob(x);return uid&&uid.length<=128&&/^[A-Za-z0-9_-]+$/.test(uid)?uid:''}catch{return ''}
  }

  function captureReferral(){
    try{
      const url=new URL(location.href),code=url.searchParams.get('ref'),uid=decodeUid(code);
      if(uid)localStorage.setItem(PENDING_KEY,uid);
      if(code){url.searchParams.delete('ref');history.replaceState(null,'',url.pathname+(url.search?url.search:'')+(url.hash||''))}
    }catch(_){ }
  }

  function referralUrl(uid){const code=encodeUid(uid);return code?`${location.origin}/?ref=${encodeURIComponent(code)}`:''}

  function closeReferral(){document.getElementById('chamaReferralModal')?.remove()}

  function esc(v){return String(v||'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
  function referralDate(v){const d=v?.toDate?.();return d?`Entrou em ${d.toLocaleDateString('pt-BR')}`:'Entrou pelo seu convite'}

  async function loadMyReferrals(){
    const list=document.getElementById('chamaReferralList'),count=document.getElementById('chamaReferralCount');if(!list||!count||!me||!db||!fs)return;
    try{
      const users=fs.collection(db,'users');
      const [current,legacy]=await Promise.all([fs.getDocs(fs.query(users,fs.where('referredByUid','==',me.uid),fs.limit(50))),fs.getDocs(fs.query(users,fs.where('indicadoPor','==',me.uid),fs.limit(50)))]),found=new Map();
      const add=s=>s.forEach(d=>{const x=d.data()||{};found.set(d.id,{uid:d.id,nome:String(x.nome||x.name||x.email?.split('@')?.[0]||'Usuário'),date:x.referredAt||x.indicadoEm||null})});add(current);add(legacy);
      const items=[...found.values()].sort((a,b)=>Number(b.date?.seconds||0)-Number(a.date?.seconds||0));count.textContent=String(items.length);list.innerHTML='';
      if(!items.length){list.innerHTML='<div class="chama-referral-empty">Você ainda não possui indicações.</div>';return}
      for(const u of items){const row=document.createElement('div');row.className='chama-referral-person';const initial=(u.nome.trim().charAt(0)||'U').toUpperCase();row.innerHTML=`<div class="chama-referral-avatar">${esc(initial)}</div><div class="chama-referral-person-main"><div class="chama-referral-person-name">${esc(u.nome)}</div><div class="chama-referral-person-date">${esc(referralDate(u.date))}</div></div>`;list.appendChild(row)}
    }catch(e){console.warn('Chama: indicações não carregaram',e);list.innerHTML='<div class="chama-referral-empty">Não foi possível carregar suas indicações agora.</div>'}
  }

  function openReferral(){
    closeReferral();
    if(!me)return alert('Entre na sua conta para gerar seu link de indicação.');
    const link=referralUrl(me.uid);if(!link)return;
    const back=document.createElement('div');back.id='chamaReferralModal';back.className='chama-referral-backdrop';
    back.innerHTML=`<section class="chama-referral-card"><div class="chama-referral-top"><div class="chama-referral-icon">🎁</div><div class="chama-referral-title"><strong>Indique o Chama</strong><small>Convide outros afiliados para a comunidade</small></div><button class="chama-referral-close" type="button" aria-label="Fechar">✕</button></div><div class="chama-referral-body"><p>Compartilhe seu link pessoal. Quando uma nova pessoa criar a conta por ele, a indicação fica vinculada a você.</p><div class="chama-referral-url"><input class="chama-referral-input" readonly></div><div class="chama-referral-actions"><button class="chama-referral-copy-btn" type="button">📋 Copiar link</button><button class="chama-referral-share-btn" type="button">📤 Compartilhar</button></div><div class="chama-referral-note">Gerar, copiar e compartilhar não usa Firestore. Só o novo cadastro indicado gera uma gravação adicional.</div><div class="chama-referral-mine"><div class="chama-referral-mine-head"><span>Minhas indicações</span><span id="chamaReferralCount" class="chama-referral-count">...</span></div><div id="chamaReferralList" class="chama-referral-list"><div class="chama-referral-empty">Carregando indicações...</div></div></div></div></section>`;
    document.body.appendChild(back);back.querySelector('.chama-referral-input').value=link;
    back.querySelector('.chama-referral-close').onclick=closeReferral;back.addEventListener('click',e=>{if(e.target===back)closeReferral()});
    back.querySelector('.chama-referral-copy-btn').onclick=async()=>{try{await navigator.clipboard.writeText(link);alert('Link de indicação copiado ✓')}catch{const i=back.querySelector('input');i.select();document.execCommand('copy');alert('Link de indicação copiado ✓')}};
    back.querySelector('.chama-referral-share-btn').onclick=async()=>{
      const text='Você é afiliado Shopee, Mercado Livre ou Shein? Entre no Chama, uma comunidade com ferramentas para afiliados.';
      if(navigator.share){try{await navigator.share({title:'Chama',text,url:link});return}catch(e){if(e?.name==='AbortError')return}}
      try{await navigator.clipboard.writeText(text+'\n'+link);alert('Convite copiado. Agora é só compartilhar ✓')}catch{alert(link)}
    };
    loadMyReferrals();
  }

  function freshAccount(user){
    try{const created=new Date(user?.metadata?.creationTime||0).getTime(),signed=new Date(user?.metadata?.lastSignInTime||0).getTime();return created>0&&signed>0&&Math.abs(created-signed)<=15000}catch{return false}
  }

  async function applyPendingReferral(user){
    if(!user||!db||!fs||!freshAccount(user))return;
    const referrer=localStorage.getItem(PENDING_KEY)||'';
    if(!referrer||referrer===user.uid||localStorage.getItem(APPLIED_PREFIX+user.uid)==='1')return;
    await new Promise(r=>setTimeout(r,1400));
    try{
      await fs.setDoc(fs.doc(db,'users',user.uid),{referredByUid:referrer,referralSource:'chama-link',referredAt:fs.serverTimestamp()},{merge:true});
      localStorage.setItem(APPLIED_PREFIX+user.uid,'1');localStorage.removeItem(PENDING_KEY);
    }catch(e){console.warn('Chama: não foi possível registrar a indicação',e)}
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,user=>{me=user||null;if(user)applyPendingReferral(user)});
    }catch(e){console.warn('Chama: indicação não iniciou',e)}
  }

  function start(){captureReferral();addStyle();initFirebase();document.addEventListener('chama-open-referral',openReferral)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
