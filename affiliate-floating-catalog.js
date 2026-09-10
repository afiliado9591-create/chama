(()=>{
  const STYLE_ID='chamaFloatingCatalogStyleV1';
  let loaded=false, db=null, fs=null, uid='';
  let items=[];

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-floating-catalog-admin{margin-top:8px}
      .chama-floating-catalog-edit{width:100%;border:1px solid #d8e7df;border-radius:11px;background:#fff;padding:9px;font-weight:850;color:#0b7a53;cursor:pointer}
      .chama-floating-catalog-editor{display:none;margin-top:8px;padding:10px;border-radius:14px;background:#f5f9f7;border:1px solid #dce9e3}
      .chama-floating-catalog-editor.open{display:block}
      .chama-floating-catalog-editor .product{padding:10px 0;border-bottom:1px solid #dce9e3}
      .chama-floating-catalog-editor .product:last-of-type{border-bottom:0}
      .chama-floating-catalog-editor .product-title{font-size:12px;font-weight:900;color:#18352a;margin-bottom:5px}
      .chama-floating-catalog-editor label{display:block;font-size:11px;font-weight:800;color:#405048;margin:5px 0 3px}
      .chama-floating-catalog-editor input{box-sizing:border-box;width:100%;border:1px solid #cbd8d2;border-radius:9px;padding:8px;background:#fff;outline:none;font:inherit;font-size:12px}
      .chama-floating-catalog-editor .check{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;font-weight:750;color:#405048}
      .chama-floating-catalog-editor .check input{width:auto}
      .chama-floating-catalog-editor .actions{display:flex;gap:7px;margin-top:9px}
      .chama-floating-catalog-editor button{flex:1;border:0;border-radius:10px;padding:9px;font-weight:850;cursor:pointer}
      .chama-floating-catalog-save{background:#0b7a53;color:#fff}
      .chama-floating-catalog-cancel{background:#e8efeb;color:#405048}
      .chama-floating-catalog-help{font-size:10px;color:#718078;line-height:1.35;margin:2px 0 8px}
    `;document.head.appendChild(s);
  }
  function safeUrl(v){v=String(v||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function safeImage(v){v=String(v||'').trim();if(!v)return '';try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function normalize(list){return (Array.isArray(list)?list:[]).slice(0,8).map(x=>({enabled:x?.enabled!==false,title:String(x?.title||'').trim().slice(0,60),store:String(x?.store||'').trim().slice(0,30),price:String(x?.price||'').trim().slice(0,24),image:safeImage(x?.image||''),url:safeUrl(x?.url||'')}))}
  function findPanel(){return document.querySelector('#chamaAffiliateWrap .chama-affiliate-panel')}
  function replaceCatalog(panel){
    panel.querySelector('.chama-floating-catalog-admin')?.remove();
    panel.querySelector('.chama-affiliate-catalog-title')?.remove();
    panel.querySelector('.chama-affiliate-products')?.remove();
    panel.querySelector('.chama-affiliate-empty')?.remove();
    const title=document.createElement('div');title.className='chama-affiliate-catalog-title';title.textContent='🛍️ Catálogo de produtos';panel.appendChild(title);
    const grid=document.createElement('div');grid.className='chama-affiliate-products';
    const valid=normalize(items).filter(x=>x.enabled&&x.title&&x.url);
    if(!valid.length){const empty=document.createElement('div');empty.className='chama-affiliate-empty';empty.textContent='Catálogo em breve.';panel.appendChild(empty)}
    else valid.forEach(item=>{
      const a=document.createElement('a');a.className='chama-affiliate-product';a.href=item.url;a.target='_blank';a.rel='noopener noreferrer sponsored';
      if(item.image){const img=document.createElement('img');img.className='chama-affiliate-product-img';img.src=item.image;img.alt=item.title;img.loading='lazy';img.referrerPolicy='no-referrer';a.appendChild(img)}else{const ph=document.createElement('div');ph.className='chama-affiliate-product-img';ph.style.display='grid';ph.style.placeItems='center';ph.textContent='🛍️';a.appendChild(ph)}
      const info=document.createElement('div');info.className='chama-affiliate-product-info';const name=document.createElement('div');name.className='chama-affiliate-product-name';name.textContent=item.title;info.appendChild(name);if(item.store){const st=document.createElement('div');st.className='chama-affiliate-product-store';st.textContent=item.store;info.appendChild(st)}if(item.price){const pr=document.createElement('div');pr.className='chama-affiliate-product-price';pr.textContent=item.price;info.appendChild(pr)}a.appendChild(info);grid.appendChild(a);
    });
    if(valid.length)panel.appendChild(grid);
  }
  function addEditor(panel){
    if(!document.querySelector('#chamaAffiliateWrap.chama-admin'))return;
    const box=document.createElement('div');box.className='chama-floating-catalog-admin';
    const edit=document.createElement('button');edit.type='button';edit.className='chama-floating-catalog-edit';edit.textContent='✏️ Editar catálogo (somente admin)';box.appendChild(edit);
    const editor=document.createElement('div');editor.className='chama-floating-catalog-editor';
    const help=document.createElement('div');help.className='chama-floating-catalog-help';help.textContent='Cole o link da imagem e o seu link de afiliado. Até 8 produtos.';editor.appendChild(help);
    const fields=[];
    for(let i=0;i<8;i++){
      const item=items[i]||{};const product=document.createElement('div');product.className='product';const h=document.createElement('div');h.className='product-title';h.textContent=`Produto ${i+1}`;product.appendChild(h);
      const make=(label,placeholder,value,type='text')=>{const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.placeholder=placeholder;input.value=value||'';input.maxLength=700;l.appendChild(input);product.appendChild(l);return input};
      const title=make('Nome do produto','Ex.: Fone Bluetooth',item.title);const store=make('Loja','Mercado Livre / Shopee / Dridália',item.store);const price=make('Preço','Ex.: R$ 39,90',item.price);const image=make('Link da imagem','https://...',item.image,'url');const url=make('Link do produto/afiliado','https://...',item.url,'url');
      const check=document.createElement('label');check.className='check';const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=item.enabled!==false&&!!item.title&&!!item.url;check.append(enabled,document.createTextNode(' Exibir este produto'));product.appendChild(check);editor.appendChild(product);fields.push({title,store,price,image,url,enabled});
    }
    const actions=document.createElement('div');actions.className='actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='chama-floating-catalog-cancel';cancel.textContent='Cancelar';const save=document.createElement('button');save.type='button';save.className='chama-floating-catalog-save';save.textContent='Salvar catálogo';actions.append(cancel,save);editor.appendChild(actions);box.appendChild(editor);panel.appendChild(box);
    edit.onclick=()=>editor.classList.toggle('open');cancel.onclick=()=>editor.classList.remove('open');
    save.onclick=async()=>{
      save.disabled=true;save.textContent='Salvando...';
      try{
        const next=fields.map(f=>({enabled:!!f.enabled.checked,title:String(f.title.value||'').trim().slice(0,60),store:String(f.store.value||'').trim().slice(0,30),price:String(f.price.value||'').trim().slice(0,24),image:safeImage(f.image.value||''),url:safeUrl(f.url.value||'')}));
        for(const x of next){if(x.enabled&&!x.title)throw new Error('Preencha o nome dos produtos ativos.');if(x.enabled&&!x.url)throw new Error('Preencha o link do produto nos produtos ativos.');if(x.image&&safeImage(x.image)!==x.image)throw new Error('Use um link HTTPS válido para a imagem.')}
        await fs.setDoc(fs.doc(db,'appConfig','affiliateFloatingCatalog'),{products:next,updatedAt:fs.serverTimestamp(),updatedBy:uid},{merge:true});
        items=next;replaceCatalog(panel);addEditor(panel);alert('Catálogo da sacolinha atualizado!');
      }catch(e){alert(e?.message||'Não foi possível salvar o catálogo agora.')}finally{save.disabled=false;save.textContent='Salvar catálogo'}
    };
  }
  async function load(){
    if(!db||!fs||!uid)return;
    try{const snap=await fs.getDoc(fs.doc(db,'appConfig','affiliateFloatingCatalog'));items=snap.exists()?snap.data()?.products||[]:[];const panel=findPanel();if(panel){replaceCatalog(panel);addEditor(panel)}}catch(e){console.warn('Chama: catálogo flutuante',e)}
  }
  async function init(){
    if(loaded)return;loaded=true;addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(async user=>{uid=user?.uid||'';items=[];if(uid)await load()});
      const mo=new MutationObserver(()=>{const panel=findPanel();if(panel&&!panel.dataset.floatingCatalogReady&&uid){panel.dataset.floatingCatalogReady='1';load()}});mo.observe(document.body,{childList:true,subtree:true});
    }catch(e){console.warn('Chama: catálogo flutuante não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();