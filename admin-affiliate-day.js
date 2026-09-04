(()=>{
  if(!/\/admin\.html$/i.test(location.pathname))return;
  const CARD_ID='chamaAffiliateDayAdminCard';
  let fs=null,db=null,me=null,active={enabled:false,date:'',affiliateUid:'',affiliateName:''};

  const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  function clean(v,max){return String(v||'').trim().slice(0,max)}
  function safeUrl(value){let v=String(value||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{const u=new URL(v);return u.protocol==='https:'?u.href:null}catch{return null}}
  function todaySP(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t)?.value||'';return `${g('year')}-${g('month')}-${g('day')}`}
  function newId(){return 'p_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}

  function addStyle(){
    if(document.getElementById('chamaAffiliateDayAdminStyle'))return;
    const s=document.createElement('style');s.id='chamaAffiliateDayAdminStyle';s.textContent=`
      #${CARD_ID}{background:#fff;border:1px solid #e2e8e5;border-radius:18px;padding:16px;margin-bottom:14px}#${CARD_ID} h2{font-size:18px;margin:0 0 5px}.chama-affday-admin-note{color:#68756e;font-size:13px;line-height:1.45;margin:0 0 13px}.chama-affday-admin-section{border-top:1px solid #edf0ee;padding-top:14px;margin-top:14px}.chama-affday-admin-section h3{font-size:15px;margin:0 0 9px}.chama-affday-admin-grid{display:grid;gap:10px}.chama-affday-admin-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px}.chama-affday-admin-fields label,.chama-affday-admin-row label{font-size:12px;font-weight:800;color:#4d5b54;display:grid;gap:5px}.chama-affday-admin-fields input,.chama-affday-admin-fields select,.chama-affday-admin-row input,.chama-affday-admin-row textarea{width:100%;border:1px solid #cad5cf;border-radius:10px;padding:10px 11px;outline:none;background:#fff}.chama-affday-admin-row textarea{min-height:72px;resize:vertical}.chama-affday-admin-product{border:1px solid #e2e8e5;border-radius:14px;padding:11px;background:#fbfcfb}.chama-affday-admin-product-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}.chama-affday-admin-product-top strong{flex:1}.chama-affday-admin-check{display:flex!important;grid-template-columns:none!important;align-items:center;gap:6px!important;font-size:12px!important}.chama-affday-admin-check input{width:auto!important}.chama-affday-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.chama-affday-admin-btn{border:0;border-radius:11px;padding:10px 12px;font-weight:850;cursor:pointer}.chama-affday-admin-primary{background:#0b7a53;color:#fff}.chama-affday-admin-soft{background:#eef8f3;color:#0b7a53}.chama-affday-admin-danger{background:#fff0f0;color:#b42318}.chama-affday-admin-msg{min-height:18px;margin-top:8px;color:#0b7a53;font-size:13px;font-weight:750}.chama-affday-admin-help{background:#fff8e7;border:1px solid #f0d89a;color:#704900;border-radius:11px;padding:9px 10px;font-size:12px;line-height:1.4;margin:8px 0 10px}@media(max-width:620px){.chama-affday-admin-fields{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function ensureCard(){
    const panel=document.getElementById('panel');if(!panel)return null;let card=document.getElementById(CARD_ID);if(card)return card;
    card=document.createElement('section');card.id=CARD_ID;card.innerHTML=`
      <h2>⭐ Dia do Afiliado</h2>
      <p class="chama-affday-admin-note">Você controla um catálogo mestre com seus links de afiliado e escolhe manualmente quem terá o destaque do dia. Sem listener em tempo real.</p>
      <div class="chama-affday-admin-section">
        <h3>1. Catálogo mestre</h3>
        <div class="chama-affday-admin-help">Os usuários veem seus links normalmente. Somente o Afiliado do Dia pode escolher um produto e trocar o link daquele destaque pelo próprio link.</div>
        <div id="chamaAffdayProducts" class="chama-affday-admin-grid"></div>
        <div class="chama-affday-admin-actions"><button id="chamaAffdayAdd" class="chama-affday-admin-btn chama-affday-admin-soft" type="button">＋ Adicionar produto</button><button id="chamaAffdaySaveCatalog" class="chama-affday-admin-btn chama-affday-admin-primary" type="button">Salvar catálogo</button></div>
        <div id="chamaAffdayCatalogMsg" class="chama-affday-admin-msg"></div>
      </div>
      <div class="chama-affday-admin-section">
        <h3>2. Escolher o Afiliado do Dia</h3>
        <div class="chama-affday-admin-fields"><label>Data<input id="chamaAffdayDate" type="date"></label><label>Afiliado<select id="chamaAffdayUser"><option value="">Carregando usuários...</option></select></label></div>
        <label class="chama-affday-admin-check" style="margin-top:10px"><input id="chamaAffdayEnabled" type="checkbox"> Ativar destaque para essa data</label>
        <div class="chama-affday-admin-actions"><button id="chamaAffdaySaveActive" class="chama-affday-admin-btn chama-affday-admin-primary" type="button">Salvar Afiliado do Dia</button></div>
        <div id="chamaAffdayActiveMsg" class="chama-affday-admin-msg"></div>
      </div>`;
    const count=document.getElementById('chamaCommunityCountAdminCard');if(count)count.insertAdjacentElement('afterend',card);else{const affiliate=document.querySelector('#affiliateGrid')?.closest('.card');if(affiliate)affiliate.insertAdjacentElement('afterend',card);else panel.prepend(card)}
    return card;
  }

  function productRow(p={}){
    const row=document.createElement('div');row.className='chama-affday-admin-product';row.dataset.id=clean(p.id,80)||newId();row.innerHTML=`
      <div class="chama-affday-admin-product-top"><strong>Produto</strong><label class="chama-affday-admin-check"><input class="ad-enabled" type="checkbox" ${p.enabled!==false?'checked':''}> Exibir</label></div>
      <div class="chama-affday-admin-row chama-affday-admin-fields"><label>Título<input class="ad-title" maxlength="90" value="${esc(p.title||'')}" placeholder="Nome do produto"></label><label>Loja<input class="ad-store" maxlength="32" value="${esc(p.store||'')}" placeholder="Shopee, Mercado Livre..."></label></div>
      <div class="chama-affday-admin-row chama-affday-admin-fields" style="margin-top:8px"><label>Preço<input class="ad-price" maxlength="32" value="${esc(p.price||'')}" placeholder="Ex.: R$ 79,90"></label><label>Imagem por link<input class="ad-image" maxlength="900" value="${esc(p.imageUrl||'')}" placeholder="https://..."></label></div>
      <div class="chama-affday-admin-row" style="margin-top:8px"><label>Descrição<textarea class="ad-description" maxlength="180" placeholder="Descrição curta">${esc(p.description||'')}</textarea></label></div>
      <div class="chama-affday-admin-row" style="margin-top:8px"><label>Seu link de afiliado<input class="ad-url" maxlength="900" value="${esc(p.defaultUrl||'')}" placeholder="https://seu-link..."></label></div>
      <div class="chama-affday-admin-actions"><button class="chama-affday-admin-btn chama-affday-admin-danger ad-remove" type="button">Remover</button></div>`;
    row.querySelector('.ad-remove').onclick=()=>row.remove();return row;
  }

  function renderProducts(products=[]){const box=document.getElementById('chamaAffdayProducts');if(!box)return;box.innerHTML='';for(const p of (Array.isArray(products)?products:[]).slice(0,20))box.appendChild(productRow(p));if(!box.children.length)box.appendChild(productRow({enabled:true}))}

  function collectProducts(){
    const rows=[...document.querySelectorAll('#chamaAffdayProducts .chama-affday-admin-product')];if(rows.length>20)throw new Error('Use no máximo 20 produtos por enquanto.');const out=[];
    for(const row of rows){const enabled=!!row.querySelector('.ad-enabled')?.checked,title=clean(row.querySelector('.ad-title')?.value,90),store=clean(row.querySelector('.ad-store')?.value,32),price=clean(row.querySelector('.ad-price')?.value,32),description=clean(row.querySelector('.ad-description')?.value,180),imageRaw=clean(row.querySelector('.ad-image')?.value,900),urlRaw=clean(row.querySelector('.ad-url')?.value,900),imageUrl=safeUrl(imageRaw),defaultUrl=safeUrl(urlRaw);if(imageRaw&&imageUrl===null)throw new Error(`Imagem inválida em “${title||'produto'}”. Use https://`);if(urlRaw&&defaultUrl===null)throw new Error(`Link inválido em “${title||'produto'}”. Use https://`);if(enabled&&(!title||!defaultUrl))throw new Error('Todo produto exibido precisa de título e link de afiliado.');if(!title&&!urlRaw&&!description&&!imageRaw&&!price&&!store)continue;out.push({id:row.dataset.id||newId(),enabled,store,title,price,description,imageUrl:imageUrl||'',defaultUrl:defaultUrl||''})}
    return out;
  }

  function populateUsers(){
    const sel=document.getElementById('chamaAffdayUser');if(!sel)return;const current=sel.value||active.affiliateUid||'';const rows=[...document.querySelectorAll('#users .user[data-uid]')];const items=rows.map(r=>({uid:r.dataset.uid||'',name:clean(r.querySelector('.name')?.textContent?.replace('🛡️',''),80)})).filter(x=>x.uid&&x.name);if(!items.length)return;
    sel.innerHTML='<option value="">Escolha um usuário</option>'+items.map(x=>`<option value="${esc(x.uid)}">${esc(x.name)}</option>`).join('');if(current&&!items.some(x=>x.uid===current)){const o=document.createElement('option');o.value=current;o.textContent=active.affiliateName||'Usuário selecionado';sel.appendChild(o)}sel.value=current;
  }

  async function saveCatalog(){const btn=document.getElementById('chamaAffdaySaveCatalog'),msg=document.getElementById('chamaAffdayCatalogMsg');try{const products=collectProducts();btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';await fs.setDoc(fs.doc(db,'appConfig','affiliateDayCatalog'),{products,updatedAt:fs.serverTimestamp(),updatedBy:me.uid},{merge:true});msg.textContent=`Catálogo salvo ✓ (${products.filter(x=>x.enabled).length} produtos ativos)`}catch(e){console.error(e);msg.textContent=e?.message||'Não foi possível salvar o catálogo.'}finally{btn.disabled=false;btn.textContent='Salvar catálogo'}}
  async function saveActive(){const btn=document.getElementById('chamaAffdaySaveActive'),msg=document.getElementById('chamaAffdayActiveMsg'),date=clean(document.getElementById('chamaAffdayDate')?.value,10),sel=document.getElementById('chamaAffdayUser'),uid=clean(sel?.value,160),name=clean(sel?.selectedOptions?.[0]?.textContent,80),enabled=!!document.getElementById('chamaAffdayEnabled')?.checked;if(enabled&&(!date||!uid)){msg.textContent='Escolha a data e o afiliado.';return}btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';try{await fs.setDoc(fs.doc(db,'appConfig','affiliateDayActive'),{enabled,date,affiliateUid:uid,affiliateName:name,updatedAt:fs.serverTimestamp(),updatedBy:me.uid},{merge:true});active={enabled,date,affiliateUid:uid,affiliateName:name};msg.textContent=enabled?`Afiliado do Dia salvo para ${date} ✓`:'Destaque desativado ✓'}catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}finally{btn.disabled=false;btn.textContent='Salvar Afiliado do Dia'}}

  async function loadData(){
    const [catSnap,activeSnap]=await Promise.all([fs.getDoc(fs.doc(db,'appConfig','affiliateDayCatalog')),fs.getDoc(fs.doc(db,'appConfig','affiliateDayActive'))]);const products=catSnap.exists()?(catSnap.data()?.products||[]):[];const a=activeSnap.exists()?activeSnap.data()||{}:{};active={enabled:a.enabled===true,date:clean(a.date,10),affiliateUid:clean(a.affiliateUid,160),affiliateName:clean(a.affiliateName,80)};renderProducts(products);document.getElementById('chamaAffdayDate').value=active.date||todaySP();document.getElementById('chamaAffdayEnabled').checked=active.enabled;populateUsers();
  }

  async function init(){
    addStyle();const card=ensureCard();if(!card)return;
    try{const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);authMod.onAuthStateChanged(auth,async user=>{me=user||null;if(!user){card.hidden=true;return}try{const own=await fs.getDoc(fs.doc(db,'users',user.uid));if(!own.exists()||own.data().admin!==true){card.hidden=true;return}card.hidden=false;await loadData();document.getElementById('chamaAffdayAdd').onclick=()=>{const box=document.getElementById('chamaAffdayProducts');if(box.children.length>=20)return alert('Limite atual: 20 produtos.');box.appendChild(productRow({enabled:true}))};document.getElementById('chamaAffdaySaveCatalog').onclick=saveCatalog;document.getElementById('chamaAffdaySaveActive').onclick=saveActive;const users=document.getElementById('users');if(users)new MutationObserver(()=>populateUsers()).observe(users,{childList:true,subtree:true});setTimeout(populateUsers,500);setTimeout(populateUsers,1400)}catch(e){console.warn('Chama: admin do Dia do Afiliado não carregou',e);card.hidden=true}})}catch(e){console.warn('Chama: admin do Dia do Afiliado não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();