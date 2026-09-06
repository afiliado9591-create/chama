(()=>{
  const STYLE_ID='chamaCommunityOffersStyleV1';
  let me=null,db=null,fs=null,ownLoaded=false,ownOffer=null,feedCache=null,feedLoadedAt=0;

  const clean=(v,max=200)=>String(v||'').trim().replace(/\s+/g,' ').slice(0,max);
  function safeHttps(v){let x=String(v||'').trim();if(!x)return '';if(!/^https?:\/\//i.test(x))x='https://'+x;try{const u=new URL(x);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function normalizeOffer(x={}){
    return {
      enabled:x.enabled===true,
      store:['Shopee','Mercado Livre','Shein','Outra'].includes(x.store)?x.store:'Shopee',
      title:clean(x.title,90),
      description:clean(x.description,180),
      price:clean(x.price,32),
      oldPrice:clean(x.oldPrice,32),
      imageUrl:safeHttps(x.imageUrl),
      affiliateUrl:safeHttps(x.affiliateUrl)
    };
  }
  function ready(o){return !!(o?.enabled&&o?.title&&o?.affiliateUrl)}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-community-backdrop{position:fixed;inset:0;background:#0008;z-index:3700;display:grid;place-items:center;padding:12px}
      .chama-community-modal{width:min(620px,100%);max-height:95dvh;overflow:auto;background:#f5f7f6;border-radius:24px;box-shadow:0 24px 70px #0005}
      .chama-community-head{position:sticky;top:0;z-index:3;background:#fff;border-bottom:1px solid #e3e9e6;padding:14px 16px;display:flex;align-items:center;gap:10px}.chama-community-head b{flex:1;font-size:18px;color:#183429}.chama-community-close{border:0;background:#eef4f1;color:#0b7a53;width:40px;height:40px;border-radius:12px;font-size:20px;cursor:pointer}
      .chama-community-body{padding:13px}.chama-community-info{background:#eef8f3;border:1px solid #d9ebe2;border-radius:15px;padding:11px 12px;font-size:12px;color:#496158;line-height:1.45;margin-bottom:11px}
      .chama-community-editor,.chama-community-feedbox{background:#fff;border:1px solid #e0e7e3;border-radius:18px;padding:13px;margin-bottom:12px}.chama-community-editor h3,.chama-community-feedbox h3{margin:0 0 5px;font-size:16px}.chama-community-muted{font-size:11px;color:#748079;line-height:1.4;margin-bottom:10px}
      .chama-community-grid{display:grid;gap:8px}.chama-community-grid label{font-size:12px;font-weight:850;color:#52615a}.chama-community-grid input,.chama-community-grid select,.chama-community-grid textarea{width:100%;border:1px solid #cfd8d3;border-radius:11px;padding:10px 11px;font:inherit;outline:none;background:#fff}.chama-community-grid textarea{min-height:72px;resize:vertical}.chama-community-grid input:focus,.chama-community-grid select:focus,.chama-community-grid textarea:focus{border-color:#0b7a53}.chama-community-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.chama-community-check{display:flex!important;align-items:center;gap:7px}.chama-community-check input{width:auto!important}.chama-community-save{width:100%;border:0;background:#17372b;color:#fff;border-radius:12px;padding:11px 13px;font-weight:900;margin-top:10px}.chama-community-save:disabled{opacity:.65}.chama-community-msg{font-size:12px;color:#0b7a53;font-weight:800;min-height:17px;margin-top:7px}
      .chama-community-list{display:grid;gap:10px}.chama-community-card{border:1px solid #e2e8e5;border-radius:16px;overflow:hidden;background:#fff}.chama-community-img{width:100%;height:185px;object-fit:cover;background:#eef1ef;display:block}.chama-community-cardbody{padding:12px}.chama-community-owner{display:flex;align-items:center;gap:5px;width:max-content;max-width:100%;background:#eef8f3;color:#0b7a53;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:850;margin-bottom:8px}.chama-community-store{font-size:10px;font-weight:900;color:#8b5a00}.chama-community-title{font-size:16px;font-weight:900;color:#22342c;margin:3px 0 5px}.chama-community-desc{font-size:12px;color:#66736d;line-height:1.35;margin-bottom:7px}.chama-community-old{font-size:11px;color:#7a8580;text-decoration:line-through}.chama-community-price{font-size:21px;font-weight:950;color:#0b7a53;margin:2px 0 9px}.chama-community-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.chama-community-buy,.chama-community-share,.chama-community-send{display:flex;align-items:center;justify-content:center;border:0;text-decoration:none;border-radius:10px;padding:9px 8px;font-size:13px;font-weight:900;cursor:pointer}.chama-community-buy{background:#0b7a53;color:#fff}.chama-community-share{background:#eaf1ff;color:#2350a1}.chama-community-send{grid-column:1/-1;background:#17372b;color:#fff}.chama-community-empty{padding:18px 8px;text-align:center;color:#6d7972;font-size:13px}
      .chama-community-picker{position:fixed;inset:0;background:#0009;z-index:3900;display:grid;place-items:center;padding:12px}.chama-community-picker-card{width:min(440px,100%);max-height:80dvh;display:flex;flex-direction:column;background:#fff;border-radius:20px;overflow:hidden}.chama-community-picker-head{padding:13px 14px;background:#0b7a53;color:#fff;display:flex;align-items:center;gap:8px}.chama-community-picker-head strong{flex:1}.chama-community-picker-close{border:0;background:#ffffff20;color:#fff;width:38px;height:38px;border-radius:10px;font-size:19px}.chama-community-picker-list{overflow:auto;padding:8px}.chama-community-person{width:100%;border:0;border-bottom:1px solid #edf1ef;background:#fff;padding:11px 10px;display:flex;align-items:center;gap:10px;text-align:left}.chama-community-person.selected{background:#e6f6ee}.chama-community-person-avatar{width:40px;height:40px;border-radius:50%;background:#e4f3eb;color:#0b7a53;display:grid;place-items:center;font-weight:900}.chama-community-person.selected .chama-community-person-avatar{background:#0b7a53;color:#fff}.chama-community-person-name{font-weight:850;color:#24372e}.chama-community-person small{display:block;color:#748079;margin-top:2px}.chama-community-picker-empty{padding:22px 14px;text-align:center;color:#68766f;line-height:1.45}.chama-community-picker-foot{padding:10px;border-top:1px solid #e4eae7;background:#fff}.chama-community-picker-send{width:100%;border:0;border-radius:11px;background:#0b7a53;color:#fff;padding:11px;font-weight:900}.chama-community-picker-send:disabled{opacity:.55}
      @media(max-width:390px){.chama-community-two{grid-template-columns:1fr}.chama-community-img{height:160px}}
    `;document.head.appendChild(s);
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,u=>{me=u||null;ownLoaded=false;ownOffer=null;feedCache=null;feedLoadedAt=0});
    }catch(e){console.warn('Chama: ofertas da comunidade não iniciaram',e)}
  }

  async function readOwn(){
    if(!me||!db||!fs)return normalizeOffer({});if(ownLoaded)return ownOffer||normalizeOffer({});
    try{const snap=await fs.getDoc(fs.doc(db,'publicProfiles',me.uid));ownOffer=normalizeOffer(snap.exists()?snap.data()?.communityOffer||{}:{});ownLoaded=true;return ownOffer}catch{ownLoaded=true;ownOffer=normalizeOffer({});return ownOffer}
  }

  function setEditorValues(root,o){
    root.querySelector('#chamaCommunityStore').value=o.store||'Shopee';root.querySelector('#chamaCommunityTitle').value=o.title||'';root.querySelector('#chamaCommunityDescription').value=o.description||'';root.querySelector('#chamaCommunityPrice').value=o.price||'';root.querySelector('#chamaCommunityOldPrice').value=o.oldPrice||'';root.querySelector('#chamaCommunityImage').value=o.imageUrl||'';root.querySelector('#chamaCommunityLink').value=o.affiliateUrl||'';root.querySelector('#chamaCommunityEnabled').checked=o.enabled===true;
  }

  async function saveOwn(root){
    if(!me||!db||!fs)return alert('Entre no Chama para publicar sua oferta.');
    const rawImage=root.querySelector('#chamaCommunityImage').value.trim(),rawLink=root.querySelector('#chamaCommunityLink').value.trim();
    const offer=normalizeOffer({enabled:root.querySelector('#chamaCommunityEnabled').checked,store:root.querySelector('#chamaCommunityStore').value,title:root.querySelector('#chamaCommunityTitle').value,description:root.querySelector('#chamaCommunityDescription').value,price:root.querySelector('#chamaCommunityPrice').value,oldPrice:root.querySelector('#chamaCommunityOldPrice').value,imageUrl:rawImage,affiliateUrl:rawLink});
    if(rawImage&&!offer.imageUrl)return alert('O link da imagem precisa ser https://');if(rawLink&&!offer.affiliateUrl)return alert('O link do produto precisa ser https://');if(offer.enabled&&(!offer.title||!offer.affiliateUrl))return alert('Para publicar, informe pelo menos o nome do produto e o link de afiliado.');
    const btn=root.querySelector('#chamaCommunitySave'),msg=root.querySelector('#chamaCommunityMsg');btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
    try{
      await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{communityOffer:{...offer,updatedAt:fs.serverTimestamp()}},{merge:true});ownOffer=offer;ownLoaded=true;feedCache=null;feedLoadedAt=0;msg.textContent=offer.enabled?'Oferta publicada ✓':'Oferta salva, mas não está aparecendo no mural.';await loadFeed(root,true);
    }catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}
    finally{btn.disabled=false;btn.textContent='Salvar minha oferta'}
  }

  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  async function fetchFeed(force=false){
    if(!db||!fs)return[];if(!force&&feedCache&&Date.now()-feedLoadedAt<5*60*1000)return shuffle(feedCache.slice());
    try{
      const q=fs.query(fs.collection(db,'publicProfiles'),fs.where('communityOffer.enabled','==',true),fs.limit(12));const snap=await fs.getDocs(q),items=[];
      snap.forEach(d=>{const data=d.data()||{},offer=normalizeOffer(data.communityOffer||{});if(ready(offer))items.push({uid:d.id,nome:clean(data.nome||'Afiliado',60),...offer})});feedCache=items;feedLoadedAt=Date.now();return shuffle(items.slice());
    }catch(e){console.warn('Chama: mural não carregou',e);return[]}
  }

  function cardFor(item){
    const card=document.createElement('article');card.className='chama-community-card';
    if(item.imageUrl){const img=document.createElement('img');img.className='chama-community-img';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=item.imageUrl;img.alt='Imagem da oferta';img.onerror=()=>img.remove();card.appendChild(img)}
    const body=document.createElement('div');body.className='chama-community-cardbody';
    const owner=document.createElement('div');owner.className='chama-community-owner';owner.textContent=`👤 Anunciante: ${item.nome||'Afiliado'}`;
    const store=document.createElement('div');store.className='chama-community-store';store.textContent='🔥 '+item.store.toUpperCase();
    const title=document.createElement('div');title.className='chama-community-title';title.textContent=item.title;body.append(owner,store,title);
    if(item.description){const d=document.createElement('div');d.className='chama-community-desc';d.textContent=item.description;body.appendChild(d)}
    if(item.oldPrice){const old=document.createElement('div');old.className='chama-community-old';old.textContent=item.oldPrice;body.appendChild(old)}
    if(item.price){const price=document.createElement('div');price.className='chama-community-price';price.textContent=item.price;body.appendChild(price)}
    const actions=document.createElement('div');actions.className='chama-community-actions';
    const a=document.createElement('a');a.className='chama-community-buy';a.href=item.affiliateUrl;a.target='_blank';a.rel='noopener noreferrer sponsored';a.textContent='Ver oferta';
    const share=document.createElement('button');share.type='button';share.className='chama-community-share';share.textContent='↗ Compartilhar';share.onclick=()=>shareOffer(item,share);
    const send=document.createElement('button');send.type='button';send.className='chama-community-send';send.textContent='💬 Enviar no Chama';send.onclick=()=>shareInsideChama(item);actions.append(a,share,send);body.appendChild(actions);card.appendChild(body);return card;
  }

  async function shareOffer(item,button){
    const advertiser=item.nome||'Afiliado',parts=[`🔥 ${item.title}`];if(item.description)parts.push(item.description);if(item.price)parts.push(`Preço: ${item.price}`);parts.push(`Anunciante: ${advertiser}`);const text=parts.join('\n'),full=`${text}\n${item.affiliateUrl}`;
    try{if(navigator.share){await navigator.share({title:`${item.title} — ${advertiser}`,text,url:item.affiliateUrl});return}await navigator.clipboard.writeText(full);const old=button.textContent;button.textContent='✓ Link copiado';setTimeout(()=>button.textContent=old,1600)}catch(e){if(e?.name==='AbortError')return;try{await navigator.clipboard.writeText(full);alert('Oferta copiada para compartilhar ✓')}catch{alert('Não foi possível compartilhar esta oferta agora.')}}
  }

  function shareText(item){const advertiser=item.nome||'Afiliado',parts=[`🔥 ${item.title}`];if(item.description)parts.push(item.description);if(item.oldPrice)parts.push(`De: ${item.oldPrice}`);if(item.price)parts.push(`Por: ${item.price}`);parts.push(`👤 Anunciante: ${advertiser}`,'',`👉 Ver produto: ${item.affiliateUrl}`);return parts.join('\n')}
  async function sendToConversation(item,person){const ids=[me.uid,person.uid].sort(),chatId=ids.join('_'),chatRef=fs.doc(db,'chats',chatId),message=shareText(item),label=`🛍️ ${item.title}`;await fs.setDoc(chatRef,{participants:ids},{merge:true});await fs.addDoc(fs.collection(db,'chats',chatId,'messages'),{text:message,senderId:me.uid,receiverId:person.uid,createdAt:fs.serverTimestamp()});await fs.setDoc(chatRef,{participants:ids,lastMessage:label,lastSenderId:me.uid,updatedAt:fs.serverTimestamp(),unreadCounts:{[person.uid]:fs.increment(1),[me.uid]:0}},{merge:true})}
  function shareInsideChama(item){
    document.getElementById('chamaCommunityPicker')?.remove();const rows=[...document.querySelectorAll('#usersList .user.chama-has-conversation')].filter(r=>r.dataset.uid&&r.dataset.uid!==me?.uid),people=[];for(const r of rows){if(people.some(x=>x.uid===r.dataset.uid))continue;people.push({uid:r.dataset.uid,nome:clean(r.querySelector('.user-name')?.textContent||'Usuário',60),email:clean(r.querySelector('.user-email')?.textContent||`${r.dataset.uid}@chama.local`,180),photoUrl:safeHttps(r.dataset.photoUrl||'')})}
    const selected=new Set(),wrap=document.createElement('div');wrap.id='chamaCommunityPicker';wrap.className='chama-community-picker';wrap.innerHTML='<section class="chama-community-picker-card"><header class="chama-community-picker-head"><strong>Escolha até 5 conversas</strong><button type="button" class="chama-community-picker-close">✕</button></header><div class="chama-community-picker-list"></div><footer class="chama-community-picker-foot"><button type="button" class="chama-community-picker-send" disabled>Enviar para selecionados (0/5)</button></footer></section>';const list=wrap.querySelector('.chama-community-picker-list'),send=wrap.querySelector('.chama-community-picker-send');if(!people.length){list.innerHTML='<div class="chama-community-picker-empty">Você ainda não possui uma conversa para compartilhar.<br>Inicie uma conversa e tente novamente.</div>';send.closest('footer').hidden=true}function update(){send.disabled=!selected.size;send.textContent=`Enviar para selecionados (${selected.size}/5)`}for(const person of people){const b=document.createElement('button');b.type='button';b.className='chama-community-person';b.innerHTML='<span class="chama-community-person-avatar"></span><span><span class="chama-community-person-name"></span><small>Toque para selecionar</small></span>';b.querySelector('.chama-community-person-avatar').textContent=(person.nome||'U').charAt(0).toUpperCase();b.querySelector('.chama-community-person-name').textContent=person.nome;b.onclick=()=>{if(selected.has(person.uid)){selected.delete(person.uid);b.classList.remove('selected');b.querySelector('small').textContent='Toque para selecionar'}else{if(selected.size>=5)return alert('Você pode escolher no máximo 5 conversas.');selected.add(person.uid);b.classList.add('selected');b.querySelector('small').textContent='✓ Selecionado'}update()};list.appendChild(b)}send.onclick=async()=>{if(!me||!db||!fs)return alert('Entre novamente no Chama para enviar.');const chosen=people.filter(p=>selected.has(p.uid));if(!chosen.length)return;send.disabled=true;send.textContent='Enviando...';let sent=0;try{for(const person of chosen){await sendToConversation(item,person);sent++}wrap.remove();document.getElementById('chamaCommunityOffersModal')?.remove();if(chosen.length===1&&typeof window.chamaOpenChat==='function')window.chamaOpenChat(chosen[0]);alert(`Produto enviado para ${sent} ${sent===1?'conversa':'conversas'} ✓`)}catch(e){console.error(e);alert(`Enviado para ${sent}. Não foi possível concluir os demais envios.`);send.disabled=false;update()}};wrap.querySelector('.chama-community-picker-close').onclick=()=>wrap.remove();wrap.onclick=e=>{if(e.target===wrap)wrap.remove()};document.body.appendChild(wrap)
  }

  async function loadFeed(root,force=false){
    const list=root.querySelector('#chamaCommunityList');if(!list)return;list.innerHTML='<div class="chama-community-empty">Carregando ofertas...</div>';const items=await fetchFeed(force);list.innerHTML='';if(!items.length){list.innerHTML='<div class="chama-community-empty">Ainda não há ofertas publicadas pela comunidade.</div>';return}items.forEach(x=>list.appendChild(cardFor(x)));
  }

  async function open(){
    document.getElementById('chamaCommunityOffersModal')?.remove();
    const back=document.createElement('div');back.id='chamaCommunityOffersModal';back.className='chama-community-backdrop';back.innerHTML=`<section class="chama-community-modal"><header class="chama-community-head"><b>🔥 Achadinhos da Comunidade</b><button class="chama-community-close" type="button">✕</button></header><div class="chama-community-body"><div class="chama-community-info">Aqui os afiliados também podem comprar como consumidores. Publique ofertas reais e compre somente quando tiver interesse no produto. Não combine “eu compro no seu link e você compra no meu”.</div><section class="chama-community-editor"><h3>Minha oferta</h3><div class="chama-community-muted">Cada usuário mantém no máximo uma oferta ativa. Salvar substitui a oferta anterior e gera apenas uma gravação no seu perfil.</div><div class="chama-community-grid"><label>Loja<select id="chamaCommunityStore"><option>Shopee</option><option>Mercado Livre</option><option>Shein</option><option>Outra</option></select></label><label>Produto<input id="chamaCommunityTitle" maxlength="90" placeholder="Nome do produto"></label><label>Descrição curta<textarea id="chamaCommunityDescription" maxlength="180" placeholder="Destaque o benefício ou a promoção"></textarea></label><div class="chama-community-two"><label>Preço atual<input id="chamaCommunityPrice" maxlength="32" placeholder="R$ 99,90"></label><label>Preço anterior (opcional)<input id="chamaCommunityOldPrice" maxlength="32" placeholder="R$ 149,90"></label></div><label>Link da imagem<input id="chamaCommunityImage" maxlength="900" inputmode="url" placeholder="https://..."></label><label>Link de afiliado<input id="chamaCommunityLink" maxlength="900" inputmode="url" placeholder="https://..."></label><label class="chama-community-check"><input id="chamaCommunityEnabled" type="checkbox"> Publicar no mural</label></div><button id="chamaCommunitySave" class="chama-community-save" type="button">Salvar minha oferta</button><div id="chamaCommunityMsg" class="chama-community-msg"></div></section><section class="chama-community-feedbox"><h3>Ofertas dos afiliados</h3><div class="chama-community-muted">O Chama carrega somente até 12 ofertas quando você abre esta área e mantém um cache de 5 minutos. Não há listener em tempo real nem contagem de cliques.</div><div id="chamaCommunityList" class="chama-community-list"></div></section></div></section>`;
    document.body.appendChild(back);back.querySelector('.chama-community-close').onclick=()=>back.remove();back.addEventListener('click',e=>{if(e.target===back)back.remove()});back.querySelector('#chamaCommunitySave').onclick=()=>saveOwn(back);
    const own=await readOwn();if(document.body.contains(back))setEditorValues(back,own);if(document.body.contains(back))loadFeed(back,false);
  }

  function start(){addStyle();initFirebase();document.addEventListener('chama-open-community-offers',open)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
