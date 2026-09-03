(()=>{
  const STYLE_ID='chamaReferralLinkStyleV1';
  const PENDING_KEY='chama_pending_referrer_v1';
  const APPLIED_PREFIX='chama_referral_applied_v1_';
  let me=null,db=null,fs=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-referral-entry{margin:8px 12px 10px;border:1px solid #eadfbf;border-radius:18px;background:linear-gradient(135deg,#fffdf6,#fff7df);padding:13px;box-shadow:0 4px 14px #5b3a000a}
      .chama-referral-head{display:flex;align-items:center;gap:10px}.chama-referral-icon{width:42px;height:42px;border-radius:14px;background:#8c5b00;color:#fff;display:grid;place-items:center;font-size:21px;flex:0 0 42px}.chama-referral-copy{flex:1;min-width:0}.chama-referral-copy strong{display:block;font-size:14px;color:#3d3320}.chama-referral-copy small{display:block;color:#7a6c4f;font-size:11px;margin-top:2px;line-height:1.35}
      .chama-referral-url{margin-top:10px;display:flex;gap:7px}.chama-referral-url input{flex:1;min-width:0;border:1px solid #ddcfaa;background:#fff;border-radius:11px;padding:9px 10px;font-size:11px;color:#5f5540;outline:none}.chama-referral-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.chama-referral-actions button{border:0;border-radius:10px;padding:9px 8px;font-weight:900;cursor:pointer}.chama-referral-copy-btn{background:#fff0c9;color:#805100}.chama-referral-share-btn{background:#17372b;color:#fff}.chama-referral-note{font-size:10px;color:#8b7d62;margin-top:7px;line-height:1.35}
      @media(max-width:380px){.chama-referral-entry{margin-left:9px;margin-right:9px}.chama-referral-actions{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function encodeUid(uid){
    try{return btoa(String(uid||'')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch{return ''}
  }
  function decodeUid(code){
    try{
      let x=String(code||'').trim().replace(/-/g,'+').replace(/_/g,'/');
      while(x.length%4)x+='=';
      const uid=atob(x);
      return uid&&uid.length<=128&&/^[A-Za-z0-9_-]+$/.test(uid)?uid:'';
    }catch{return ''}
  }

  function captureReferral(){
    try{
      const url=new URL(location.href),code=url.searchParams.get('ref');
      const uid=decodeUid(code);
      if(uid)localStorage.setItem(PENDING_KEY,uid);
      if(code){url.searchParams.delete('ref');history.replaceState(null,'',url.pathname+(url.search?url.search:'')+(url.hash||''))}
    }catch(_){ }
  }

  function referralUrl(uid){
    const code=encodeUid(uid);if(!code)return '';
    return `${location.origin}/?ref=${encodeURIComponent(code)}`;
  }

  function render(){
    document.getElementById('chamaReferralEntry')?.remove();
    if(!me)return;
    const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
    const link=referralUrl(me.uid);if(!link)return;
    const box=document.createElement('section');box.id='chamaReferralEntry';box.className='chama-referral-entry';
    box.innerHTML=`<div class="chama-referral-head"><div class="chama-referral-icon">🎁</div><div class="chama-referral-copy"><strong>Indique o Chama</strong><small>Convide outros afiliados para entrar na comunidade pelo seu link.</small></div></div><div class="chama-referral-url"><input class="chama-referral-input" readonly></div><div class="chama-referral-actions"><button class="chama-referral-copy-btn" type="button">📋 Copiar link</button><button class="chama-referral-share-btn" type="button">📤 Compartilhar</button></div><div class="chama-referral-note">Gerar, copiar e compartilhar este link não usa Firestore. Só registramos a indicação quando uma nova conta é criada pelo link.</div>`;
    box.querySelector('.chama-referral-input').value=link;
    box.querySelector('.chama-referral-copy-btn').onclick=async()=>{
      try{await navigator.clipboard.writeText(link);alert('Link de indicação copiado ✓')}catch{const i=box.querySelector('input');i.select();document.execCommand('copy');alert('Link de indicação copiado ✓')}
    };
    box.querySelector('.chama-referral-share-btn').onclick=async()=>{
      const text='Você é afiliado Shopee, Mercado Livre ou Shein? Entre no Chama, uma comunidade com ferramentas para afiliados.';
      if(navigator.share){try{await navigator.share({title:'Chama',text,url:link});return}catch(e){if(e?.name==='AbortError')return}}
      try{await navigator.clipboard.writeText(text+'\n'+link);alert('Convite copiado. Agora é só compartilhar ✓')}catch{alert(link)}
    };
    const tools=document.getElementById('chamaAffiliateToolsEntry');
    if(tools)tools.insertAdjacentElement('afterend',box);else{const own=sidebar.querySelector(':scope > .me');if(own)own.insertAdjacentElement('beforebegin',box);else sidebar.insertBefore(box,sidebar.firstChild)}
  }

  function freshAccount(user){
    try{
      const created=new Date(user?.metadata?.creationTime||0).getTime();
      const signed=new Date(user?.metadata?.lastSignInTime||0).getTime();
      return created>0&&signed>0&&Math.abs(created-signed)<=15000;
    }catch{return false}
  }

  async function applyPendingReferral(user){
    if(!user||!db||!fs||!freshAccount(user))return;
    const referrer=localStorage.getItem(PENDING_KEY)||'';
    if(!referrer||referrer===user.uid||localStorage.getItem(APPLIED_PREFIX+user.uid)==='1')return;
    await new Promise(r=>setTimeout(r,1400));
    try{
      await fs.setDoc(fs.doc(db,'users',user.uid),{referredByUid:referrer,referralSource:'chama-link',referredAt:fs.serverTimestamp()},{merge:true});
      localStorage.setItem(APPLIED_PREFIX+user.uid,'1');
      localStorage.removeItem(PENDING_KEY);
    }catch(e){console.warn('Chama: não foi possível registrar a indicação',e)}
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
      authMod.onAuthStateChanged(auth,user=>{
        me=user||null;render();
        if(user)applyPendingReferral(user);
      });
    }catch(e){console.warn('Chama: indicação não iniciou',e)}
  }

  function start(){captureReferral();addStyle();initFirebase();setTimeout(render,900)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();