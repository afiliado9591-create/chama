(()=>{
  if(!/\/admin\.html$/i.test(location.pathname))return;
  const CARD_ID='chamaAffiliateLinksAdmin';
  let fs=null,db=null,me=null;

  function safeUrl(value){
    const raw=String(value||'').trim();if(!raw)return '';
    try{const u=new URL(raw);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}
  }
  function style(){
    if(document.getElementById('chamaAffiliateLinksAdminStyle'))return;
    const s=document.createElement('style');s.id='chamaAffiliateLinksAdminStyle';
    s.textContent=`
      #${CARD_ID}{margin-top:16px}
      .chama-link-note{color:#6a756f;font-size:13px;line-height:1.45}
      .chama-link-default,.chama-link-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}
      .chama-link-default input,.chama-link-row input{min-width:0;width:100%;border:1px solid #ccd8d2;border-radius:11px;padding:11px 12px;font:inherit}
      .chama-link-save,.chama-link-remove{border:0;border-radius:11px;padding:11px 12px;font-weight:900;cursor:pointer}
      .chama-link-save{background:#0b7a53;color:#fff}.chama-link-remove{background:#fff0ed;color:#b42318}
      .chama-link-users{display:grid;gap:10px;margin-top:14px}.chama-link-user{border-top:1px solid #edf0ee;padding-top:10px}
      .chama-link-user strong{display:block;font-size:14px}.chama-link-user small{display:block;color:#6a756f;margin:2px 0 7px;overflow-wrap:anywhere}
      .chama-link-row{grid-template-columns:minmax(0,1fr) auto auto}
      .chama-link-msg{min-height:18px;color:#0b7a53;font-size:12px;font-weight:800;margin-top:7px}
      @media(max-width:520px){.chama-link-row{grid-template-columns:1fr 1fr}.chama-link-row input{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }
  async function save(id,input,msg,remove=false){
    msg.textContent='';
    try{
      if(remove){await fs.deleteDoc(fs.doc(db,'appConfig',id));input.value='';msg.textContent='Link individual removido ✓';return}
      const url=safeUrl(input.value);if(!url)throw new Error('Cole um link completo começando com https://');
      await fs.setDoc(fs.doc(db,'appConfig',id),{url,updatedAt:fs.serverTimestamp(),updatedBy:me.uid},{merge:true});
      input.value=url;msg.textContent='Link salvo ✓';
    }catch(e){console.error(e);msg.textContent=e.message||'Não foi possível salvar.'}
  }
  async function build(){
    const main=document.querySelector('main');if(!main||document.getElementById(CARD_ID))return;
    const own=await fs.getDoc(fs.doc(db,'users',me.uid));if(!own.exists()||own.data().admin!==true)return;
    const card=document.createElement('section');card.id=CARD_ID;card.className='card';
    card.innerHTML='<h2>🎁 Botão Pra você</h2><p class="chama-link-note">O link padrão aparece para todos. Um link individual substitui o padrão somente no perfil escolhido.</p>';
    const defWrap=document.createElement('div');defWrap.className='chama-link-default';
    const defInput=document.createElement('input');defInput.type='url';defInput.placeholder='Link padrão para todos os perfis';
    const defBtn=document.createElement('button');defBtn.type='button';defBtn.className='chama-link-save';defBtn.textContent='Salvar padrão';
    const defMsg=document.createElement('div');defMsg.className='chama-link-msg';defMsg.style.gridColumn='1/-1';
    defWrap.append(defInput,defBtn,defMsg);card.appendChild(defWrap);
    const defSnap=await fs.getDoc(fs.doc(db,'appConfig','affiliateLink_default'));if(defSnap.exists())defInput.value=defSnap.data()?.url||'';
    defBtn.onclick=()=>save('affiliateLink_default',defInput,defMsg);

    const users=document.createElement('div');users.className='chama-link-users';users.innerHTML='<div>Carregando usuários...</div>';card.appendChild(users);main.appendChild(card);
    const snap=await fs.getDocs(fs.query(fs.collection(db,'users'),fs.limit(200)));users.innerHTML='';
    const list=[];snap.forEach(d=>list.push({uid:d.id,...d.data()}));list.sort((a,b)=>String(a.nome||a.email||'').localeCompare(String(b.nome||b.email||''),'pt-BR'));
    for(const u of list){
      const wrap=document.createElement('div');wrap.className='chama-link-user';
      const title=document.createElement('strong');title.textContent=u.nome||'Usuário';
      const email=document.createElement('small');email.textContent=u.email||u.uid;
      const row=document.createElement('div');row.className='chama-link-row';
      const input=document.createElement('input');input.type='url';input.placeholder='Link individual (opcional)';
      const saveBtn=document.createElement('button');saveBtn.type='button';saveBtn.className='chama-link-save';saveBtn.textContent='Salvar';
      const removeBtn=document.createElement('button');removeBtn.type='button';removeBtn.className='chama-link-remove';removeBtn.textContent='Remover';
      const msg=document.createElement('div');msg.className='chama-link-msg';
      row.append(input,saveBtn,removeBtn);wrap.append(title,email,row,msg);users.appendChild(wrap);
      const id='affiliateLink_'+u.uid;
      fs.getDoc(fs.doc(db,'appConfig',id)).then(s=>{if(s.exists())input.value=s.data()?.url||''}).catch(()=>{});
      saveBtn.onclick=()=>save(id,input,msg);removeBtn.onclick=()=>save(id,input,msg,true);
    }
  }
  async function init(){
    style();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];
      for(let i=0;!app&&i<30;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);authMod.onAuthStateChanged(authMod.getAuth(app),u=>{me=u||null;if(me)build()});
    }catch(e){console.warn('Chama: editor do botão Pra você não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();