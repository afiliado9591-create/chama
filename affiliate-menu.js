(()=>{
  const STYLE_ID='chamaAffiliateMenuStyleV4';
  let db=null,fs=null,loaded=false,admin=false,currentButtons=[];

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-affiliate-fab{position:fixed;right:16px;bottom:18px;width:58px;height:58px;border-radius:50%;border:0;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:30px;line-height:1;cursor:pointer;z-index:1800;box-shadow:0 7px 20px #0003;animation:chamaBagPulse 2.2s infinite}
      .chama-affiliate-fab:active{transform:scale(.94)}
      @keyframes chamaBagPulse{0%,100%{box-shadow:0 7px 20px #0003}50%{box-shadow:0 7px 25px #0b7a5366}}
      .chama-affiliate-panel{position:fixed;right:14px;bottom:86px;width:min(320px,calc(100vw - 28px));background:#fff;border-radius:20px;padding:12px;z-index:1801;box-shadow:0 14px 40px #0003;border:1px solid #e5ece8}
      .chama-affiliate-title{font-weight:900;font-size:15px;color:#18352a;margin:2px 4px 10px}
      .chama-affiliate-btn{display:flex;align-items:center;justify-content:center;min-height:48px;margin:7px 0;text-decoration:none;background:#f4f8f6;color:#0b7a53;border:1px solid #d8e7df;border-radius:13px;padding:10px;font-size:14px;font-weight:850;text-align:center}
      .chama-affiliate-btn.featured{background:linear-gradient(135deg,#fff7e6,#ffedc2);color:#8b4b00;border-color:#f4b94f}
      .chama-affiliate-admin{display:none;margin:8px 0 2px}.chama-admin .chama-affiliate-admin{display:block}
      .chama-affiliate-edit{width:100%;border:1px solid #d8e7df;border-radius:11px;background:#fff;padding:9px;font-weight:850;color:#0b7a53;cursor:pointer}
      .chama-affiliate-editor{margin-top:8px;padding:10px;border-radius:14px;background:#f5f9f7;border:1px solid #dce9e3;display:none}
      .chama-affiliate-editor.open{display:block}
      .chama-affiliate-editor label{display:block;font-size:12px;font-weight:800;color:#405048;margin:7px 0 4px}
      .chama-affiliate-editor input{width:100%;border:1px solid #cbd8d2;border-radius:10px;padding:9px;background:#fff;outline:none;font:inherit;font-size:13px}
      .chama-affiliate-editor .row{display:flex;gap:7px;margin-top:8px}.chama-affiliate-editor button{flex:1;border:0;border-radius:10px;padding:9px;font-weight:850;cursor:pointer}.chama-affiliate-save{background:#0b7a53;color:#fff}.chama-affiliate-cancel{background:#e8efeb;color:#405048}
      .chama-affiliate-editor .check{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:750;color:#405048;margin-top:8px}.chama-affiliate-editor .check input{width:auto}
      .chama-affiliate-close{float:right;border:0;background:transparent;font-size:20px;cursor:pointer;color:#667}
    `;document.head.appendChild(s);
  }
  function safeUrl(value){let v=String(value||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function normalized(buttons){return (Array.isArray(buttons)?buttons:[]).slice(0,3).map(x=>({label:String(x?.label||'').trim().slice(0,24),url:safeUrl(x?.url||''),enabled:x?.enabled!==false,featured:x?.featured===true}))}
  function buildEditor(panel){
    if(!admin)return;
    const adminBox=document.createElement('div');adminBox.className='chama-affiliate-admin';
    const edit=document.createElement('button');edit.type='button';edit.className='chama-affiliate-edit';edit.textContent='✏️ Editar links (somente admin)';adminBox.appendChild(edit);
    const editor=document.createElement('div');editor.className='chama-affiliate-editor';
    const fields=[];
    for(let i=0;i<3;i++){
      const item=currentButtons[i]||{};const label=document.createElement('label');label.textContent=`Botão ${i+1} — nome`;
      const name=document.createElement('input');name.type='text';name.maxLength=24;name.value=item.label||'';label.appendChild(name);
      const urlLabel=document.createElement('label');urlLabel.textContent='Link de afiliado';
      const url=document.createElement('input');url.type='url';url.maxLength=700;url.placeholder='https://...';url.value=item.url||'';urlLabel.appendChild(url);
      const check=document.createElement('label');check.className='check';const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=item.enabled!==false&&!!item.label&&!!item.url;check.append(enabled,document.createTextNode(' Exibir este botão'));
      editor.append(label,urlLabel,check);fields.push({name,url,enabled});
    }
    const row=document.createElement('div');row.className='row';const cancel=document.createElement('button');cancel.type='button';cancel.className='chama-affiliate-cancel';cancel.textContent='Cancelar';const save=document.createElement('button');save.type='button';save.className='chama-affiliate-save';save.textContent='Salvar';row.append(cancel,save);editor.append(row);adminBox.appendChild(editor);panel.appendChild(adminBox);
    edit.onclick=()=>{editor.classList.toggle('open')};cancel.onclick=()=>{editor.classList.remove('open')};
    save.onclick=async()=>{
      save.disabled=true;save.textContent='Salvando...';
      try{
        const buttons=fields.map(f=>{const label=String(f.name.value||'').trim().slice(0,24);const raw=String(f.url.value||'').trim();const url=safeUrl(raw);if(raw&&!url)throw new Error('Use links https:// válidos.');return {label,url,enabled:!!f.enabled.checked,featured:false}});
        const valid=buttons.filter(x=>x.enabled&&x.label&&x.url);if(!valid.length)throw new Error('Mantenha pelo menos um botão preenchido e ativo.');
        await fs.setDoc(fs.doc(db,'appConfig','affiliateMenu'),{buttons,updatedAt:fs.serverTimestamp(),updatedBy:authUid||''},{merge:true});
        currentButtons=buttons;render(currentButtons);alert('Links da sacolinha atualizados!');
      }catch(e){alert(e?.message||'Não foi possível salvar os links agora.')}finally{save.disabled=false;save.textContent='Salvar'}
    };
  }
  let authUid='';
  function render(buttons=[]){
    currentButtons=normalized(buttons);document.getElementById('chamaAffiliateWrap')?.remove();
    const valid=currentButtons.filter(x=>x.enabled&&x.label&&x.url);if(!valid.length&&!admin)return;
    const wrap=document.createElement('div');wrap.id='chamaAffiliateWrap';if(admin)wrap.classList.add('chama-admin');
    const fab=document.createElement('button');fab.className='chama-affiliate-fab';fab.type='button';fab.textContent='🛍️';fab.title='Ofertas';fab.setAttribute('aria-label','Abrir ofertas');
    const panel=document.createElement('div');panel.className='chama-affiliate-panel';panel.hidden=true;
    const close=document.createElement('button');close.className='chama-affiliate-close';close.type='button';close.textContent='×';close.title='Fechar';
    const title=document.createElement('div');title.className='chama-affiliate-title';title.textContent='🛍️ Ofertas e links';panel.append(close,title);
    let featuredUsed=false;
    valid.forEach(item=>{const row=document.createElement('div');const a=document.createElement('a');a.className='chama-affiliate-btn';if(item.featured&&!featuredUsed){a.classList.add('featured');featuredUsed=true}a.href=item.url;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent=item.label;row.appendChild(a);panel.appendChild(row)});
    buildEditor(panel);
    fab.onclick=()=>{panel.hidden=!panel.hidden};close.onclick=()=>{panel.hidden=true};wrap.append(fab,panel);document.body.appendChild(wrap);
  }
  async function init(){
    if(loaded)return;loaded=true;addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{document.getElementById('chamaAffiliateWrap')?.remove();admin=false;authUid=user?.uid||'';if(!user)return;try{const [userSnap,menuSnap]=await Promise.all([fs.getDoc(fs.doc(db,'users',user.uid)),fs.getDoc(fs.doc(db,'appConfig','affiliateMenu'))]);admin=userSnap.exists()&&userSnap.data()?.admin===true;render(menuSnap.exists()?menuSnap.data()?.buttons||[]:[])}catch(e){console.warn('Chama: menu afiliados',e)}});
    }catch(e){console.warn('Chama: menu afiliados não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();