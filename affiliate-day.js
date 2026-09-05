(()=>{
  const STYLE_ID='chamaAffiliateDayStyleV1';
  const CACHE_MS=5*60*1000;
  let fs=null,db=null,me=null;
  let active=null,activeLoadedAt=0,catalog=null,catalogLoadedAt=0,selection=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[s]));
  function todaySP(){
    const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const g=t=>p.find(x=>x.type===t)?.value||'';return `${g('year')}-${g('month')}-${g('day')}`;
  }
  function safeUrl(value){let v=String(value||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function cleanText(v,max){return String(v||'').trim().slice(0,max)}
  function isToday(){return !!active&&active.enabled===true&&active.date===todaySP()&&!!active.affiliateUid}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-affiliate-day-top{margin:10px 12px 0;border:1px solid #f0d28b;background:linear-gradient(135deg,#fff9ea,#fff2c9);border-radius:17px;padding:12px;box-shadow:0 3px 10px #8b5b0012}
      .chama-affiliate-day-kicker{font-size:11px;font-weight:950;color:#9a5b00;letter-spacing:.04em;text-transform:uppercase}.chama-affiliate-day-name{font-size:17px;font-weight:950;color:#3d2a08;margin-top:3px}.chama-affiliate-day-product{display:flex;gap:10px;align-items:center;margin-top:10px}.chama-affiliate-day-thumb{width:58px;height:58px;border-radius:12px;object-fit:cover;background:#fff;border:1px solid #eadbb7;flex:0 0 58px}.chama-affiliate-day-info{min-width:0;flex:1}.chama-affiliate-day-title{font-size:13px;font-weight:900;color:#302718;line-height:1.25}.chama-affiliate-day-price{font-size:14px;font-weight:950;color:#0b7a53;margin-top:3px}.chama-affiliate-day-note{font-size:12px;color:#76623b;line-height:1.35;margin-top:7px}.chama-affiliate-day-cta{display:flex;align-items:center;justify-content:center;text-decoration:none;border:0;background:#0b7a53;color:#fff;border-radius:11px;padding:10px 12px;font-size:13px;font-weight:900;margin-top:10px;width:100%;cursor:pointer}
      .chama-affday-backdrop{position:fixed;inset:0;background:#0007;z-index:3100;display:grid;place-items:center;padding:16px}.chama-affday-modal{width:min(720px,100%);max-height:92dvh;overflow:auto;background:#f7f9f8;border-radius:22px;box-shadow:0 20px 60px #0004}.chama-affday-head{position:sticky;top:0;z-index:2;background:#0b7a53;color:#fff;padding:15px 16px;display:flex;align-items:center;gap:10px}.chama-affday-head strong{font-size:18px;flex:1}.chama-affday-close{border:0;background:#ffffff20;color:#fff;width:38px;height:38px;border-radius:11px;font-size:20px}.chama-affday-body{padding:14px}.chama-affday-status{background:#fff8e7;border:1px solid #f0d89a;color:#704900;border-radius:14px;padding:12px 13px;font-size:13px;line-height:1.45;margin-bottom:12px}.chama-affday-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.chama-affday-card{background:#fff;border:1px solid #e1e7e4;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}.chama-affday-img{width:100%;aspect-ratio:1.35/1;object-fit:cover;background:#eef2ef}.chama-affday-cardbody{padding:12px;display:grid;gap:6px;flex:1}.chama-affday-store{font-size:10px;color:#6c7872;font-weight:900;text-transform:uppercase}.chama-affday-cardtitle{font-weight:900;line-height:1.25}.chama-affday-desc{font-size:12px;color:#65716b;line-height:1.4}.chama-affday-price{font-weight:950;color:#0b7a53}.chama-affday-actions{display:grid;gap:7px;margin-top:auto;padding-top:5px}.chama-affday-link,.chama-affday-choose{display:flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:9px 10px;font-size:12px;font-weight:900}.chama-affday-link{background:#eef8f3;color:#0b7a53;border:1px solid #d7eadf}.chama-affday-choose{border:0;background:#0b7a53;color:#fff;cursor:pointer}.chama-affday-empty{padding:24px;text-align:center;color:#65716b;background:#fff;border-radius:14px}.chama-affday-linkbox{display:grid;gap:8px;background:#eef8f3;border:1px solid #d8ebe1;border-radius:13px;padding:11px;margin:8px 0 12px}.chama-affday-linkbox label{font-size:12px;font-weight:900;color:#405048}.chama-affday-linkbox input{width:100%;border:1px solid #c8d6cf;border-radius:10px;padding:10px 11px;outline:none}.chama-affday-own{background:#fff;border:2px solid #9ed4bb;border-radius:16px;padding:13px;margin:0 0 14px}.chama-affday-own summary{cursor:pointer;font-weight:950;color:#0b7a53;list-style:none}.chama-affday-own summary::-webkit-details-marker{display:none}.chama-affday-own-help{font-size:12px;line-height:1.4;color:#65716b;margin:7px 0 10px}.chama-affday-own-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.chama-affday-own-grid label{display:grid;gap:5px;font-size:12px;font-weight:850;color:#405048}.chama-affday-own-grid label.wide{grid-column:1/-1}.chama-affday-own-grid input,.chama-affday-own-grid textarea{width:100%;border:1px solid #c8d6cf;border-radius:10px;padding:10px 11px;font:inherit;outline:none}.chama-affday-own-grid textarea{min-height:70px;resize:vertical}.chama-affday-own-save{width:100%;border:0;background:#0b7a53;color:#fff;border-radius:11px;padding:11px 12px;font-weight:900;margin-top:10px;cursor:pointer}
      @media(max-width:520px){.chama-affday-grid,.chama-affday-own-grid{grid-template-columns:1fr}.chama-affday-own-grid label.wide{grid-column:auto}.chama-affiliate-day-top{margin:8px 10px 0}}
    `;document.head.appendChild(s);
  }

  function normalizeActive(d={}){return {enabled:d.enabled===true,date:cleanText(d.date,10),affiliateUid:cleanText(d.affiliateUid,160),affiliateName:cleanText(d.affiliateName,80)}}
  function normalizeSelection(d={}){const x=d.affiliateDaySelection||{};return {date:cleanText(x.date,10),productId:cleanText(x.productId,80),title:cleanText(x.title,90),description:cleanText(x.description,180),price:cleanText(x.price,32),imageUrl:safeUrl(x.imageUrl),affiliateUrl:safeUrl(x.affiliateUrl)}}
  function normalizeProducts(d={}){return (Array.isArray(d.products)?d.products:[]).slice(0,20).map(x=>({id:cleanText(x.id,80),store:cleanText(x.store,32),title:cleanText(x.title,90),description:cleanText(x.description,180),price:cleanText(x.price,32),imageUrl:safeUrl(x.imageUrl),defaultUrl:safeUrl(x.defaultUrl),enabled:x.enabled!==false})).filter(x=>x.id&&x.title&&x.enabled)}

  async function loadActive(force=false){
    if(!me||!db||!fs)return null;if(!force&&active&&Date.now()-activeLoadedAt<CACHE_MS)return active;
    const snap=await fs.getDoc(fs.doc(db,'appConfig','affiliateDayActive'));active=normalizeActive(snap.exists()?snap.data()||{}:{});activeLoadedAt=Date.now();selection=null;
    if(isToday()){
      try{const p=await fs.getDoc(fs.doc(db,'publicProfiles',active.affiliateUid));selection=normalizeSelection(p.exists()?p.data()||{}:{})}catch{selection=null}
    }
    renderTop();return active;
  }
  async function loadCatalog(force=false){
    if(!db||!fs)return [];if(!force&&catalog&&Date.now()-catalogLoadedAt<CACHE_MS)return catalog;
    const snap=await fs.getDoc(fs.doc(db,'appConfig','affiliateDayCatalog'));catalog=normalizeProducts(snap.exists()?snap.data()||{}:{});catalogLoadedAt=Date.now();return catalog;
  }

  function validSelection(){return !!selection&&isToday()&&selection.date===active.date&&!!selection.productId&&!!selection.affiliateUrl}
  function placeTop(el){
    const sidebar=document.querySelector('.sidebar');if(!sidebar||!el)return;const affiliate=document.getElementById('chamaAffiliateMenu');
    if(affiliate&&affiliate.parentNode===sidebar){if(el.nextSibling!==affiliate)sidebar.insertBefore(el,affiliate)}else if(sidebar.firstChild!==el)sidebar.insertBefore(el,sidebar.firstChild);
  }
  function renderTop(){
    document.getElementById('chamaAffiliateDayTop')?.remove();if(!me||!isToday())return;
    const box=document.createElement('section');box.id='chamaAffiliateDayTop';box.className='chama-affiliate-day-top';
    const kicker=document.createElement('div');kicker.className='chama-affiliate-day-kicker';kicker.textContent='⭐ Afiliado do Dia';
    const name=document.createElement('div');name.className='chama-affiliate-day-name';name.textContent=`Hoje é o dia de ${active.affiliateName||'um afiliado do Chama'}`;box.append(kicker,name);
    if(validSelection()){
      const row=document.createElement('div');row.className='chama-affiliate-day-product';
      if(selection.imageUrl){const img=document.createElement('img');img.className='chama-affiliate-day-thumb';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=selection.imageUrl;row.appendChild(img)}
      const info=document.createElement('div');info.className='chama-affiliate-day-info';const title=document.createElement('div');title.className='chama-affiliate-day-title';title.textContent=selection.title||'Oferta escolhida';info.appendChild(title);if(selection.price){const price=document.createElement('div');price.className='chama-affiliate-day-price';price.textContent=selection.price;info.appendChild(price)}row.appendChild(info);box.appendChild(row);
      const a=document.createElement('a');a.className='chama-affiliate-day-cta';a.href=selection.affiliateUrl;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent=`Ver oferta de ${active.affiliateName||'hoje'}`;box.appendChild(a);
    }else{
      const note=document.createElement('div');note.className='chama-affiliate-day-note';note.textContent=me.uid===active.affiliateUid?'Seu dia está ativo. Escolha um produto do catálogo para aparecer aqui.':`${active.affiliateName||'O afiliado'} ainda não escolheu a oferta de hoje.`;box.appendChild(note);
      if(me.uid===active.affiliateUid){const b=document.createElement('button');b.type='button';b.className='chama-affiliate-day-cta';b.textContent='Escolher meu produto';b.onclick=openCatalog;box.appendChild(b)}
    }
    placeTop(box);setTimeout(()=>placeTop(box),500);setTimeout(()=>placeTop(box),1500);
  }

  function closeModal(){document.getElementById('chamaAffiliateDayModal')?.remove()}
  async function chooseProduct(product){
    if(!me||!active||me.uid!==active.affiliateUid||!isToday())return alert('A escolha está liberada somente para o Afiliado do Dia.');
    const input=document.getElementById('chamaAffdayCustomLink');let raw=(input?.value||'').trim();
    if(!raw){raw=prompt(`Cole seu link de afiliado para “${product.title}”:`,'')||''}
    const affiliateUrl=safeUrl(raw);if(!affiliateUrl)return alert('Cole um link válido começando com https://');
    const payload={date:active.date,productId:product.id,title:product.title,description:product.description||'',price:product.price||'',imageUrl:product.imageUrl||'',affiliateUrl,updatedAt:fs.serverTimestamp()};
    try{
      await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{affiliateDaySelection:payload},{merge:true});
      selection={...payload,updatedAt:null};renderTop();closeModal();alert('Produto escolhido. Ele já está no destaque do seu dia.');
    }catch(e){console.error(e);alert('Não foi possível salvar sua escolha agora.')}
  }

  async function chooseOwnProduct(){
    if(!me||!active||me.uid!==active.affiliateUid||!isToday())return alert('O produto próprio só pode ser escolhido pelo Afiliado do Dia.');
    const title=cleanText(document.getElementById('chamaAffdayOwnTitle')?.value,90);
    const store=cleanText(document.getElementById('chamaAffdayOwnStore')?.value,32);
    const price=cleanText(document.getElementById('chamaAffdayOwnPrice')?.value,32);
    const description=cleanText(document.getElementById('chamaAffdayOwnDescription')?.value,180);
    const rawImage=(document.getElementById('chamaAffdayOwnImage')?.value||'').trim();
    const rawLink=(document.getElementById('chamaAffdayOwnLink')?.value||'').trim();
    const imageUrl=rawImage?safeUrl(rawImage):'';
    const affiliateUrl=safeUrl(rawLink);
    if(!title)return alert('Digite o título do seu produto.');
    if(rawImage&&!imageUrl)return alert('Cole um link de imagem válido começando com https://');
    if(!affiliateUrl)return alert('Cole seu link de afiliado ou de venda começando com https://');
    const payload={date:active.date,productId:`own-${me.uid.slice(0,18)}`,title,store,description,price,imageUrl,affiliateUrl,source:'affiliate',updatedAt:fs.serverTimestamp()};
    const btn=document.getElementById('chamaAffdayOwnSave');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
    try{
      await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{affiliateDaySelection:payload},{merge:true});
      selection={...payload,updatedAt:null};renderTop();closeModal();alert('Seu produto foi escolhido e já está no destaque do seu dia.');
    }catch(e){console.error(e);alert('Não foi possível salvar seu produto agora.');if(btn){btn.disabled=false;btn.textContent='Usar meu produto hoje'}}
  }

  async function openCatalog(){
    if(!me)return alert('Faça login para abrir o catálogo.');
    try{await loadActive(true);await loadCatalog(true)}catch(e){console.error(e);return alert('Não foi possível abrir o catálogo agora.')}
    closeModal();const wrap=document.createElement('div');wrap.id='chamaAffiliateDayModal';wrap.className='chama-affday-backdrop';const modal=document.createElement('section');modal.className='chama-affday-modal';
    const head=document.createElement('div');head.className='chama-affday-head';const title=document.createElement('strong');title.textContent='⭐ Dia do Afiliado';const x=document.createElement('button');x.type='button';x.className='chama-affday-close';x.textContent='✕';x.onclick=closeModal;head.append(title,x);const body=document.createElement('div');body.className='chama-affday-body';
    const status=document.createElement('div');status.className='chama-affday-status';
    if(isToday()&&me.uid===active.affiliateUid)status.innerHTML=`<strong>Hoje é o seu dia.</strong><br>Escolha qualquer produto abaixo, cole o seu link de afiliado e ele ficará em destaque no topo do Chama durante o dia.`;
    else if(isToday())status.textContent=`Hoje é o dia de ${active.affiliateName||'um afiliado da comunidade'}. Você pode aproveitar o catálogo normalmente.`;
    else status.textContent='Catálogo de produtos selecionados pela administração do Chama.';
    body.appendChild(status);
    if(isToday()&&me.uid===active.affiliateUid){
      const own=document.createElement('details');own.className='chama-affday-own';own.open=!validSelection();
      own.innerHTML=`<summary>＋ Quero divulgar meu próprio produto</summary><div class="chama-affday-own-help">Preencha os dados abaixo para usar um produto diferente das sugestões do administrador.</div><div class="chama-affday-own-grid"><label>Loja ou plataforma<input id="chamaAffdayOwnStore" maxlength="32" placeholder="Shopee, Mercado Livre, minha loja..."></label><label>Preço<input id="chamaAffdayOwnPrice" maxlength="32" placeholder="R$ 79,90"></label><label class="wide">Título do produto<input id="chamaAffdayOwnTitle" maxlength="90" placeholder="Nome do produto"></label><label class="wide">Descrição curta<textarea id="chamaAffdayOwnDescription" maxlength="180" placeholder="Explique rapidamente o produto"></textarea></label><label class="wide">Link da imagem (opcional)<input id="chamaAffdayOwnImage" type="url" maxlength="900" placeholder="https://..."></label><label class="wide">Seu link de afiliado ou de venda<input id="chamaAffdayOwnLink" type="url" maxlength="900" placeholder="https://..."></label></div><button id="chamaAffdayOwnSave" class="chama-affday-own-save" type="button">Usar meu produto hoje</button>`;
      own.querySelector('#chamaAffdayOwnSave').onclick=chooseOwnProduct;body.appendChild(own);
      const box=document.createElement('div');box.className='chama-affday-linkbox';const label=document.createElement('label');label.textContent='Ou cole seu link de afiliado e escolha uma sugestão do administrador';const input=document.createElement('input');input.id='chamaAffdayCustomLink';input.type='url';input.maxLength=900;input.placeholder='https://seu-link-de-afiliado...';box.append(label,input);body.appendChild(box)
    }
    const products=Array.isArray(catalog)?catalog:[];
    if(!products.length){const empty=document.createElement('div');empty.className='chama-affday-empty';empty.textContent='O catálogo ainda não tem produtos disponíveis.';body.appendChild(empty)}
    else{
      const grid=document.createElement('div');grid.className='chama-affday-grid';
      for(const p of products){
        const card=document.createElement('article');card.className='chama-affday-card';if(p.imageUrl){const img=document.createElement('img');img.className='chama-affday-img';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=p.imageUrl;card.appendChild(img)}
        const cb=document.createElement('div');cb.className='chama-affday-cardbody';if(p.store){const st=document.createElement('div');st.className='chama-affday-store';st.textContent=p.store;cb.appendChild(st)}const ct=document.createElement('div');ct.className='chama-affday-cardtitle';ct.textContent=p.title;cb.appendChild(ct);if(p.description){const d=document.createElement('div');d.className='chama-affday-desc';d.textContent=p.description;cb.appendChild(d)}if(p.price){const pr=document.createElement('div');pr.className='chama-affday-price';pr.textContent=p.price;cb.appendChild(pr)}
        const actions=document.createElement('div');actions.className='chama-affday-actions';if(p.defaultUrl){const a=document.createElement('a');a.className='chama-affday-link';a.href=p.defaultUrl;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent='Ver oferta';actions.appendChild(a)}if(isToday()&&me.uid===active.affiliateUid){const choose=document.createElement('button');choose.type='button';choose.className='chama-affday-choose';choose.textContent=selection?.productId===p.id&&selection?.date===active.date?'✓ Escolhido hoje':'Escolher este produto';choose.onclick=()=>chooseProduct(p);actions.appendChild(choose)}cb.appendChild(actions);card.appendChild(cb);grid.appendChild(card)
      }
      body.appendChild(grid);
    }
    modal.append(head,body);wrap.appendChild(modal);wrap.addEventListener('click',e=>{if(e.target===wrap)closeModal()});document.body.appendChild(wrap);
  }

  function injectMenuButton(){
    const links=document.querySelector('#chamaMainMenu .chama-menu-links');if(!links||document.getElementById('chamaAffiliateDayMenuLink'))return;
    const b=document.createElement('button');b.id='chamaAffiliateDayMenuLink';b.type='button';b.className='chama-menu-link';b.innerHTML='<span class="chama-menu-icon">⭐</span><span>Dia do Afiliado</span>';b.onclick=()=>{document.getElementById('chamaMainMenu')?.remove();openCatalog()};
    const tutorial=[...links.children].find(el=>(el.textContent||'').includes('Como usar o Chama'));if(tutorial)links.insertBefore(b,tutorial);else links.appendChild(b);
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{me=user||null;active=null;selection=null;activeLoadedAt=0;document.getElementById('chamaAffiliateDayTop')?.remove();if(user){try{await loadActive(true)}catch(e){console.warn('Chama: Dia do Afiliado não carregou',e)}}});
    }catch(e){console.warn('Chama: Dia do Afiliado não iniciou',e)}
  }

  function start(){addStyle();initFirebase();import('./affiliate-profile-catalog.js?v=2').catch(e=>console.warn('Chama: catálogo do perfil não carregou',e));new MutationObserver(()=>injectMenuButton()).observe(document.body,{childList:true,subtree:true});injectMenuButton();document.addEventListener('chama-open-affiliate-day',openCatalog)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
