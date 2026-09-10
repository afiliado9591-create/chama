(()=>{
  const STYLE_ID='chamaAffiliateMenuStyleV7';
  let db=null,fs=null,loaded=false,admin=false,currentButtons=[],catalog=[],floatingCatalog=[];
  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .user-name{font-size:16px!important}
      .user-email{font-size:13px!important}
      .chat-head strong{font-size:16px!important}
      .chat-head small{font-size:13px!important}
      .bubble{font-size:15px!important}
      .time{font-size:11px!important}
      .composer input{font-size:16px!important}
      .chama-affiliate-fab{position:fixed;right:16px;bottom:18px;width:58px;height:58px;border-radius:50%;border:0;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:30px;line-height:1;cursor:pointer;z-index:1800;box-shadow:0 7px 20px #0003;animation:chamaBagPulse 2.2s infinite}
      .chama-affiliate-fab:active{transform:scale(.94)}
      @keyframes chamaBagPulse{0%,100%{box-shadow:0 7px 20px #0003}50%{box-shadow:0 7px 25px #0b7a5366}}
      .chama-affiliate-panel{position:fixed;right:14px;bottom:86px;width:min(340px,calc(100vw - 28px));max-height:min(78dvh,620px);overflow:auto;background:#fff;border-radius:20px;padding:12px;z-index:1801;box-shadow:0 14px 40px #0003;border:1px solid #e5ece8}
      .chama-affiliate-title{font-weight:900;font-size:15px;color:#18352a;margin:2px 4px 10px}
      .chama-affiliate-btn{display:flex;align-items:center;justify-content:center;min-height:48px;margin:7px 0;text-decoration:none;background:#f4f8f6;color:#0b7a53;border:1px solid #d8e7df;border-radius:13px;padding:10px;font-size:14px;font-weight:850;text-align:center}
      .chama-affiliate-btn.featured{background:linear-gradient(135deg,#fff7e6,#ffedc2);color:#8b4b00;border-color:#f4b94f}
      .chama-affiliate-catalog-title{font-size:14px;font-weight:900;color:#18352a;margin:14px 3px 8px;padding-top:10px;border-top:1px solid #e5ece8}
      .chama-affiliate-products{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .chama-affiliate-product{display:block;text-decoration:none;color:#18352a;background:#fff;border:1px solid #e0e8e4;border-radius:14px;overflow:hidden;box-shadow:0 3px 10px #0000000d}
      .chama-affiliate-product-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:#eef4f1}
      .chama-affiliate-product-info{padding:8px}
      .chama-affiliate-product-name{font-size:12px;font-weight:850;line-height:1.25;min-height:30px}
      .chama-affiliate-product-store{font-size:10px;color:#718078;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .chama-affiliate-product-price{font-size:13px;font-weight:900;color:#0b7a53;margin-top:5px}
      .chama-affiliate-empty{font-size:12px;color:#718078;padding:8px 4px}
      .chama-affiliate-admin{display:none;margin:8px 0 2px}.chama-admin .chama-affiliate-admin{display:block}
      .chama-affiliate-edit{width:100%;border:1px solid #d8e7df;border-radius:11px;background:#fff;padding:9px;font-weight:850;color:#0b7a53;cursor:pointer}
      .chama-affiliate-editor{margin-top:8px;padding:10px;border-radius:14px;background:#f5f9f7;border:1px solid #dce9e3;display:none}
      .chama-affiliate-editor.open{display:block}
      .chama-affiliate-editor label{display:block;font-size:12px;font-weight:800;color:#405048;margin:7px 0 4px}
      .chama-affiliate-editor input{width:100%;border:1px solid #cbd8d2;border-radius:10px;padding:9px;background:#fff;outline:none;font:inherit;font-size:13px}
      .chama-affiliate-editor .row{display:flex;gap:7px;margin-top:8px}.chama-affiliate-editor button{flex:1;border:0;border-radius:10px;padding:9px;font-weight:850;cursor:pointer}.chama-affiliate-save{background:#0b7a53;color:#fff}.chama-affiliate-cancel{background:#e8efeb;color:#405048}
      .chama-affiliate-editor .check{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:750;color:#405048;margin-top:8px}.chama-affiliate-editor .check input{width:auto}
      .chama-affiliate-close{float:right;border:0;background:transparent;font-size:20px;cursor:pointer;color:#667}
      .chama-floating-editor{margin-top:8px;padding:10px;border-radius:14px;background:#f5f9f7;border:1px solid #dce9e3;display:none}
      .chama-floating-editor.open{display:block}
      .chama-floating-editor .product{padding:9px 0;border-bottom:1px solid #dce9e3}
      .chama-floating-editor .product:last-of-type{border-bottom:0}
      .chama-floating-editor .product-title{font-size:12px;font-weight:900;color:#18352a;margin-bottom:5px}
      .chama-floating-editor label{display:block;font-size:11px;font-weight:800;color:#405048;margin:5px 0 3px}
      .chama-floating-editor input{box-sizing:border-box;width:100%;border:1px solid #cbd8d2;border-radius:9px;padding:8px;background:#fff;outline:none;font:inherit;font-size:12px}
      .chama-floating-editor .check{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;font-weight:750;color:#405048}
      .chama-floating-editor .check input{width:auto}
      .chama-floating-editor .row{display:flex;gap:7px;margin-top:9px}.chama-floating-editor .row button{flex:1;border:0;border-radius:10px;padding:9px;font-weight:850;cursor:pointer}.chama-floating-save{background:#0b7a53;color:#fff}.chama-floating-cancel{background:#e8efeb;color:#405048}
      .chama-floating-help{font-size:10px;color:#718078;line-height:1.35;margin:2px 0 8px}
    `;document.head.appendChild(s);
  }
  function safeUrl(value){let v=String(value||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function safeImage(value){const v=String(value||'').trim();if(!v)return '';try{const u=new URL(v,location.origin);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function normalized(buttons){return (Array.isArray(buttons)?buttons:[]).slice(0,3).map(x=>({label:String(x?.label||'').trim().slice(0,24),url:safeUrl(x?.url||''),enabled:x?.enabled!==false,featured:x?.featured===true}))}
  function normalizedProducts(items){return (Array.isArray(items)?items:[]).slice(0,8).map(x=>({title:String(x?.title||x?.name||'Produto').trim().slice(0,60),store:String(x?.store||x?.loja||'').trim().slice(0,30),price:String(x?.price||x?.preco||'').trim().slice(0,24),image:safeImage(x?.image||x?.imageUrl||x?.imagem||''),url:safeUrl(x?.url||x?.link||'')})).filter(x=>x.title&&x.url)}
  function buildCatalog(panel){
    const title=document.createElement('div');title.className='chama-affiliate-catalog-title';title.textContent='🛍️ Catálogo de produtos';panel.appendChild(title);
    const grid=document.createElement('div');grid.className='chama-affiliate-products';
    const items=normalizedProducts(floatingCatalog.length?floatingCatalog:catalog);
    if(!items.length){const empty=document.createElement('div');empty.className='chama-affiliate-empty';empty.textContent='Catálogo em breve.';panel.appendChild(empty);return}
    items.forEach(item=>{
      const a=document.createElement('a');a.className='chama-affiliate-product';a.href=item.url;a.target='_blank';a.rel='noopener noreferrer sponsored';
      if(item.image){const img=document.createElement('img');img.className='chama-affiliate-product-img';img.src=item.image;img.alt=item.title;img.loading='lazy';img.referrerPolicy='no-referrer';a.appendChild(img)}
      else{const ph=document.createElement('div');ph.className='chama-affiliate-product-img';ph.style.display='grid';ph.style.placeItems='center';ph.textContent='🛍️';a.appendChild(ph)}
      const info=document.createElement('div');info.className='chama-affiliate-product-info';const name=document.createElement('div');name.className='chama-affiliate-product-name';name.textContent=item.title;info.appendChild(name);
      if(item.store){const store=document.createElement('div');store.className='chama-affiliate-product-store';store.textContent=item.store;info.appendChild(store)}
      if(item.price){const price=document.createElement('div');price.className='chama-affiliate-product-price';price.textContent=item.price;info.appendChild(price)}
      a.appendChild(info);grid.appendChild(a);
    });
    panel.appendChild(grid);
  }
  function buildFloatingEditor(panel){
    if(!admin)return;
    const box=document.createElement('div');box.className='chama-affiliate-admin chama-floating-admin';
    const edit=document.createElement('button');edit.type='button';edit.className='chama-affiliate-edit';edit.textContent='✏️ Editar catálogo (8 produtos)';box.appendChild(edit);
    const editor=document.createElement('div');editor.className='chama-floating-editor';
    const help=document.createElement('div');help.className='chama-floating-help';help.textContent='Imagem por link HTTPS. Preencha o nome e o link do produto. Até 8 produtos.';editor.appendChild(help);
    const fields=[];
    for(let i=0;i<8;i++){
      const item=floatingCatalog[i]||{};const product=document.createElement('div');product.className='product';const h=document.createElement('div');h.className='product-title';h.textContent=`Produto ${i+1}`;product.appendChild(h);
      const make=(label,placeholder,value,type='text')=>{const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.placeholder=placeholder;input.value=value||'';input.maxLength=700;l.appendChild(input);product.appendChild(l);return input};
      const title=make('Nome do produto','Ex.: Fone Bluetooth',item.title);const store=make('Loja','Mercado Livre / Shopee / Dridália',item.store);const price=make('Preço','Ex.: R$ 39,90',item.price);const image=make('Link da imagem','https://...',item.image,'url');const url=make('Link do produto/afiliado','https://...',item.url,'url');
      const check=document.createElement('label');check.className='check';const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=item.enabled!==false&&!!item.title&&!!item.url;check.append(enabled,document.createTextNode(' Exibir este produto'));product.appendChild(check);editor.appendChild(product);fields.push({title,store,price,image,url,enabled});
    }
    const row=document.createElement('div');row.className='row';const cancel=document.createElement('button');cancel.type='button';cancel.className='chama-floating-cancel';cancel.textContent='Cancelar';const save=document.createElement('button');save.type='button';save.className='chama-floating-save';save.textContent='Salvar catálogo';row.append(cancel,save);editor.append(row);box.appendChild(editor);panel.appendChild(box);
    edit.onclick=()=>editor.classList.toggle('open');cancel.onclick=()=>editor.classList.remove('open');
    save.onclick=async()=>{
      save.disabled=true;save.textContent='Salvando...';
      try{
        const next=fields.map(f=>({enabled:!!f.enabled.checked,title:String(f.title.value||'').trim().slice(0,60),store:String(f.store.value||'').trim().slice(0,30),price:String(f.price.value||'').trim().slice(0,24),image:safeImage(f.image.value||''),url:safeUrl(f.url.value||'')}));
        for(const x of next){if(x.enabled&&!x.title)throw new Error('Preencha o nome dos produtos ativos.');if(x.enabled&&!x.url)throw new Error('Preencha o link do produto nos produtos ativos.');if(x.image&&safeImage(x.image)!==x.image)throw new Error('Use um link HTTPS válido para a imagem.')}
        await fs.setDoc(fs.doc(db,'appConfig','affiliateFloatingCatalog'),{products:next,updatedAt:fs.serverTimestamp(),updatedBy:authUid||''},{merge:true});
        floatingCatalog=next;render(currentButtons);alert('Catálogo da sacolinha atualizado!');
      }catch(e){alert(e?.message||'Não foi possível salvar o catálogo agora.')}finally{save.disabled=false;save.textContent='Salvar catálogo'}
    };
  }
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
    buildFloatingEditor(panel);
  }
  let authUid='';
  function render(buttons=[]){
    currentButtons=normalized(buttons);document.getElementById('chamaAffiliateWrap')?.remove();
    const valid=currentButtons.filter(x=>x.enabled&&x.label&&x.url);if(!valid.length&&!admin&&!floatingCatalog.length&&!catalog.length)return;
    const wrap=document.createElement('div');wrap.id='chamaAffiliateWrap';if(admin)wrap.classList.add('chama-admin');
    const fab=document.createElement('button');fab.className='chama-affiliate-fab';fab.type='button';fab.textContent='🛍️';fab.title='Catálogo e ofertas';fab.setAttribute('aria-label','Abrir catálogo e ofertas');
    const panel=document.createElement('div');panel.className='chama-affiliate-panel';panel.hidden=true;
    const close=document.createElement('button');close.className='chama-affiliate-close';close.type='button';close.textContent='×';close.title='Fechar';
    const title=document.createElement('div');title.className='chama-affiliate-title';title.textContent='🛍️ Ofertas e catálogo';panel.append(close,title);
    let featuredUsed=false;
    valid.forEach(item=>{const row=document.createElement('div');const a=document.createElement('a');a.className='chama-affiliate-btn';if(item.featured&&!featuredUsed){a.classList.add('featured');featuredUsed=true}a.href=item.url;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent=item.label;row.appendChild(a);panel.appendChild(row)});
    buildCatalog(panel);buildEditor(panel);
    fab.onclick=()=>{panel.hidden=!panel.hidden};close.onclick=()=>{panel.hidden=true};wrap.append(fab,panel);document.body.appendChild(wrap);
  }
  async function init(){
    if(loaded)return;loaded=true;addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{document.getElementById('chamaAffiliateWrap')?.remove();admin=false;authUid=user?.uid||'';catalog=[];floatingCatalog=[];if(!user)return;try{const [userSnap,menuSnap,catalogSnap,floatingSnap]=await Promise.all([fs.getDoc(fs.doc(db,'users',user.uid)),fs.getDoc(fs.doc(db,'appConfig','affiliateMenu')),fs.getDoc(fs.doc(db,'appConfig','affiliateDayCatalog')),fs.getDoc(fs.doc(db,'appConfig','affiliateFloatingCatalog'))]);admin=userSnap.exists()&&userSnap.data()?.admin===true;catalog=catalogSnap.exists()?catalogSnap.data()?.products||[]:[];floatingCatalog=floatingSnap.exists()?floatingSnap.data()?.products||[]:[];render(menuSnap.exists()?menuSnap.data()?.buttons||[]:[])}catch(e){console.warn('Chama: menu/catálogo afiliados',e)}});
    }catch(e){console.warn('Chama: menu afiliados não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
