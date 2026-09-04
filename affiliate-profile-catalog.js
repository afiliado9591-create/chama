(()=>{
  const STYLE_ID='chamaAffiliateProfileCatalogStyleV1';
  const CACHE_MS=5*60*1000;
  let fs=null,db=null,me=null;
  let catalogCache=null,catalogAt=0;
  const profileCache=new Map();
  let dayCatalog=[],dayLinks={},dayUid='',dayPreparing=false;

  const clean=(v,max)=>String(v||'').trim().slice(0,max);
  const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  function safeUrl(value){let v=String(value||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function normalizeProducts(d={}){return (Array.isArray(d.products)?d.products:[]).slice(0,20).map(x=>({id:clean(x.id,80),store:clean(x.store,32),title:clean(x.title,90),description:clean(x.description,180),price:clean(x.price,32),imageUrl:safeUrl(x.imageUrl),enabled:x.enabled!==false})).filter(x=>x.id&&x.title&&x.enabled)}
  function normalizeLinks(d={}){const src=d.affiliateCatalogLinks&&typeof d.affiliateCatalogLinks==='object'?d.affiliateCatalogLinks:{};const out={};for(const [k,v] of Object.entries(src).slice(0,30)){const id=clean(k,80),url=safeUrl(v);if(id&&url)out[id]=url}return out}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-affcat-profile-actions{display:grid;gap:8px;margin-top:14px}.chama-affcat-profile-btn{border:0;border-radius:13px;padding:12px 14px;font-weight:900;cursor:pointer}.chama-affcat-view{background:#0b7a53;color:#fff}.chama-affcat-edit{background:#eef8f3;color:#0b7a53;border:1px solid #cfe8db}
      .chama-affcat-backdrop{position:fixed;inset:0;background:#0007;z-index:3600;display:grid;place-items:center;padding:14px}.chama-affcat-modal{width:min(760px,100%);max-height:92dvh;overflow:auto;background:#f7f9f8;border-radius:22px;box-shadow:0 22px 60px #0004}.chama-affcat-head{position:sticky;top:0;z-index:2;background:#0b7a53;color:#fff;padding:15px 16px;display:flex;gap:10px;align-items:center}.chama-affcat-head strong{font-size:18px;flex:1}.chama-affcat-close{border:0;background:#ffffff20;color:#fff;width:38px;height:38px;border-radius:11px;font-size:20px}.chama-affcat-body{padding:14px}.chama-affcat-note{background:#fff8e7;border:1px solid #f0d89a;color:#704900;border-radius:13px;padding:11px 12px;font-size:13px;line-height:1.45;margin-bottom:12px}.chama-affcat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.chama-affcat-card{background:#fff;border:1px solid #e1e7e4;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}.chama-affcat-img{width:100%;aspect-ratio:1.35/1;object-fit:cover;background:#eef2ef}.chama-affcat-cardbody{padding:12px;display:grid;gap:6px;flex:1}.chama-affcat-store{font-size:10px;color:#6c7872;font-weight:900;text-transform:uppercase}.chama-affcat-title{font-weight:900;line-height:1.25}.chama-affcat-desc{font-size:12px;color:#65716b;line-height:1.4}.chama-affcat-price{font-weight:950;color:#0b7a53}.chama-affcat-link{display:flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:9px 10px;font-size:12px;font-weight:900;background:#0b7a53;color:#fff;margin-top:5px}.chama-affcat-missing{border-radius:10px;padding:9px 10px;font-size:12px;font-weight:850;background:#f2f4f3;color:#7b8580;text-align:center;margin-top:5px}.chama-affcat-input{width:100%;border:1px solid #cad5cf;border-radius:10px;padding:10px 11px;outline:none;margin-top:5px}.chama-affcat-save{width:100%;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:12px 14px;font-weight:900;margin-top:13px}.chama-affcat-msg{min-height:18px;margin-top:8px;color:#0b7a53;font-size:13px;font-weight:800}.chama-affcat-empty{padding:24px;text-align:center;color:#65716b;background:#fff;border-radius:14px}
      @media(max-width:520px){.chama-affcat-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  async function loadCatalog(force=false){
    if(!db||!fs)return [];if(!force&&catalogCache&&Date.now()-catalogAt<CACHE_MS)return catalogCache;
    const snap=await fs.getDoc(fs.doc(db,'appConfig','affiliateDayCatalog'));catalogCache=normalizeProducts(snap.exists()?snap.data()||{}:{});catalogAt=Date.now();return catalogCache;
  }
  async function loadProfile(uid,force=false){
    if(!uid||!db||!fs)return {nome:'Usuário',links:{}};const cached=profileCache.get(uid);if(!force&&cached&&Date.now()-cached.at<CACHE_MS)return cached.value;
    const snap=await fs.getDoc(fs.doc(db,'publicProfiles',uid));const d=snap.exists()?snap.data()||{}:{};const value={nome:clean(d.nome,80)||'Usuário',links:normalizeLinks(d)};profileCache.set(uid,{at:Date.now(),value});return value;
  }

  function closeCatalog(){document.getElementById('chamaAffiliateProfileCatalogModal')?.remove()}
  function activeProfileUid(){
    const modal=document.getElementById('chamaProfileModal');if(!modal)return '';
    if(modal.querySelector('#chamaProfileSave'))return me?.uid||'';
    return document.getElementById('activeChat')?.dataset?.uid||'';
  }

  async function openCatalog(uid,edit=false){
    if(!me||!uid)return alert('Faça login para abrir o catálogo.');if(edit&&uid!==me.uid)return;
    let products,profile;try{[products,profile]=await Promise.all([loadCatalog(false),loadProfile(uid,false)])}catch(e){console.error(e);return alert('Não foi possível abrir o catálogo agora.')}
    closeCatalog();const back=document.createElement('div');back.id='chamaAffiliateProfileCatalogModal';back.className='chama-affcat-backdrop';const modal=document.createElement('section');modal.className='chama-affcat-modal';const head=document.createElement('div');head.className='chama-affcat-head';const title=document.createElement('strong');title.textContent=edit?'✏️ Configurar meu catálogo':`🛍️ Catálogo de ${profile.nome||'afiliado'}`;const close=document.createElement('button');close.type='button';close.className='chama-affcat-close';close.textContent='✕';close.onclick=closeCatalog;head.append(title,close);const body=document.createElement('div');body.className='chama-affcat-body';
    const note=document.createElement('div');note.className='chama-affcat-note';note.textContent=edit?'Os produtos são escolhidos pela administração. Você só precisa colar o seu link de afiliado em cada produto que quiser divulgar.':'Os produtos abaixo usam os links cadastrados por este afiliado. Quando um produto ainda não tiver link próprio, ele fica indisponível para compra neste perfil.';body.appendChild(note);
    if(!products.length){const empty=document.createElement('div');empty.className='chama-affcat-empty';empty.textContent='O catálogo mestre ainda não tem produtos.';body.appendChild(empty)}else{
      const grid=document.createElement('div');grid.className='chama-affcat-grid';
      for(const p of products){const card=document.createElement('article');card.className='chama-affcat-card';card.dataset.productId=p.id;if(p.imageUrl){const img=document.createElement('img');img.className='chama-affcat-img';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=p.imageUrl;card.appendChild(img)}const cb=document.createElement('div');cb.className='chama-affcat-cardbody';if(p.store){const st=document.createElement('div');st.className='chama-affcat-store';st.textContent=p.store;cb.appendChild(st)}const tt=document.createElement('div');tt.className='chama-affcat-title';tt.textContent=p.title;cb.appendChild(tt);if(p.description){const d=document.createElement('div');d.className='chama-affcat-desc';d.textContent=p.description;cb.appendChild(d)}if(p.price){const pr=document.createElement('div');pr.className='chama-affcat-price';pr.textContent=p.price;cb.appendChild(pr)}const link=profile.links[p.id]||'';if(edit){const input=document.createElement('input');input.className='chama-affcat-input';input.type='url';input.maxLength=900;input.placeholder='https://seu-link-de-afiliado...';input.value=link;cb.appendChild(input)}else if(link){const a=document.createElement('a');a.className='chama-affcat-link';a.href=link;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent='Ver oferta';cb.appendChild(a)}else{const miss=document.createElement('div');miss.className='chama-affcat-missing';miss.textContent='Link ainda não configurado';cb.appendChild(miss)}card.appendChild(cb);grid.appendChild(card)}body.appendChild(grid)
    }
    if(edit&&products.length){const save=document.createElement('button');save.type='button';save.className='chama-affcat-save';save.textContent='Salvar meus links';const msg=document.createElement('div');msg.className='chama-affcat-msg';body.append(save,msg);save.onclick=async()=>{const links={};for(const card of body.querySelectorAll('.chama-affcat-card')){const id=clean(card.dataset.productId,80),raw=(card.querySelector('.chama-affcat-input')?.value||'').trim();if(!raw)continue;const url=safeUrl(raw);if(!url)return alert('Use somente links seguros começando com https://');links[id]=url}save.disabled=true;save.textContent='Salvando...';msg.textContent='';try{await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{affiliateCatalogLinks:links,affiliateCatalogUpdatedAt:fs.serverTimestamp()},{mergeFields:['affiliateCatalogLinks','affiliateCatalogUpdatedAt']});profile.links=links;profileCache.set(me.uid,{at:Date.now(),value:{...profile,links:{...links}}});dayLinks={...links};msg.textContent='Seus links foram salvos ✓';save.textContent='Salvo ✓';setTimeout(()=>{if(save.isConnected){save.disabled=false;save.textContent='Salvar meus links'}},900)}catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.';save.disabled=false;save.textContent='Salvar meus links'}}}
    modal.append(head,body);back.appendChild(modal);back.addEventListener('click',e=>{if(e.target===back)closeCatalog()});document.body.appendChild(back);
  }

  function decorateProfile(){
    const modal=document.getElementById('chamaProfileModal'),body=modal?.querySelector('.chama-profile-body');if(!modal||!body||body.querySelector('.chama-affcat-profile-actions'))return;
    const uid=activeProfileUid();if(!uid)return;const own=uid===me?.uid;const name=clean(modal.querySelector('#chamaProfileNameText')?.textContent,80)||'afiliado';const wrap=document.createElement('div');wrap.className='chama-affcat-profile-actions';const view=document.createElement('button');view.type='button';view.className='chama-affcat-profile-btn chama-affcat-view';view.textContent=own?'🛍️ Ver meu catálogo':`🛍️ Ver catálogo de ${name}`;view.onclick=()=>openCatalog(uid,false);wrap.appendChild(view);if(own){const edit=document.createElement('button');edit.type='button';edit.className='chama-affcat-profile-btn chama-affcat-edit';edit.textContent='✏️ Configurar meus links';edit.onclick=()=>openCatalog(uid,true);wrap.appendChild(edit)}const shop=body.querySelector('#chamaProfileShopArea');if(shop)shop.insertAdjacentElement('afterend',wrap);else body.prepend(wrap);
  }

  async function prepareDayLinks(){
    const modal=document.getElementById('chamaAffiliateDayModal');if(!modal||!modal.querySelector('#chamaAffdayCustomLink')||!me)return;
    if(dayUid===me.uid||dayPreparing)return;dayPreparing=true;
    try{const [products,profile]=await Promise.all([loadCatalog(false),loadProfile(me.uid,false)]);dayCatalog=products;dayLinks={...profile.links};dayUid=me.uid;const box=modal.querySelector('.chama-affday-linkbox');if(box&&!box.querySelector('.chama-affcat-dayhint')){const hint=document.createElement('div');hint.className='chama-affcat-dayhint';hint.style.cssText='font-size:11px;color:#607069;line-height:1.35';hint.textContent='Se você já configurou este produto no seu perfil, o Chama usa seu link automaticamente.';box.appendChild(hint)}}catch(e){console.warn('Chama: links do catálogo do afiliado não carregaram',e)}finally{dayPreparing=false}
  }

  function applySavedDayLink(button){
    if(!button||!dayCatalog.length||!me)return;const cards=[...document.querySelectorAll('#chamaAffiliateDayModal .chama-affday-card')],card=button.closest('.chama-affday-card'),idx=cards.indexOf(card);if(idx<0)return;const p=dayCatalog[idx];if(!p)return;const saved=dayLinks[p.id]||'';const input=document.getElementById('chamaAffdayCustomLink');if(input)input.value=saved||'';
  }

  async function initFirebase(){
    try{const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);authMod.onAuthStateChanged(auth,u=>{me=u||null;dayCatalog=[];dayLinks={};dayUid='';dayPreparing=false;if(!u)profileCache.clear()})}catch(e){console.warn('Chama: catálogo do perfil não iniciou',e)}
  }

  function start(){
    addStyle();initFirebase();
    new MutationObserver(()=>{decorateProfile();prepareDayLinks()}).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',e=>{const b=e.target.closest?.('.chama-affday-choose');if(b)applySavedDayLink(b)},true);
    setTimeout(()=>{decorateProfile();prepareDayLinks()},700);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();