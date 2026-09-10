(()=>{
  if(window.__chamaStatusLoaded)return; window.__chamaStatusLoaded=true;
  const STYLE_ID='chamaStatusStyleV2';
  let fs=null,db=null,auth=null,currentUser=null,ownProfile=null;
  const esc=v=>String(v||'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  const clean=v=>String(v||'').trim();
  function safeHttps(v){let x=clean(v);if(!x)return '';if(!/^https?:\/\//i.test(x))x='https://'+x;try{const u=new URL(x);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #chamaStatusEntry{margin:8px 12px 10px;width:calc(100% - 24px);border:0;background:#fff;color:#17372b;border-radius:14px;padding:10px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;box-shadow:0 2px 10px #00000010;font-size:15px;font-weight:800;text-align:left}
      #chamaStatusEntry:active{transform:scale(.99)}
      .chama-status-icon{width:42px;height:42px;border-radius:50%;background:#0b7a53;color:#fff;display:grid;place-items:center;font-size:21px;flex:0 0 42px}
      .chama-status-entry-text{flex:1;min-width:0}.chama-status-entry-text strong{display:block}.chama-status-entry-text small{display:block;color:#718078;font-size:11px;font-weight:500;margin-top:2px}
      .chama-status-backdrop{position:fixed;inset:0;background:#0008;z-index:3500;display:grid;place-items:center;padding:14px}
      .chama-status-card{width:min(430px,100%);max-height:92dvh;overflow:auto;background:#fff;border-radius:22px;box-shadow:0 20px 70px #0006;padding:14px}
      .chama-status-head{display:flex;align-items:center;gap:10px;padding:4px 2px 12px;border-bottom:1px solid #e8ecea}.chama-status-head strong{font-size:19px;flex:1}.chama-status-close{border:0;background:#eef4f1;color:#0b7a53;width:38px;height:38px;border-radius:12px;font-size:19px}
      .chama-status-actions{display:flex;gap:8px;margin:12px 0}.chama-status-add{flex:1;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:11px;font-weight:800}.chama-status-refresh{border:1px solid #dce5e0;background:#fff;color:#0b7a53;border-radius:12px;padding:11px 13px;font-weight:800}
      .chama-status-list{display:grid;gap:9px}.chama-status-item{border:1px solid #e6ece8;border-radius:16px;overflow:hidden;background:#fff}.chama-status-meta{display:flex;align-items:center;gap:9px;padding:9px 10px}.chama-status-avatar{width:38px;height:38px;border-radius:50%;background:#e7f5ee;color:#0b7a53;display:grid;place-items:center;font-weight:900;overflow:hidden}.chama-status-avatar img{width:100%;height:100%;object-fit:cover}.chama-status-meta strong{font-size:14px}.chama-status-meta small{display:block;color:#718078;font-size:11px}.chama-status-media{width:100%;max-height:430px;display:block;object-fit:contain;background:#111}.chama-status-text{padding:10px 12px;font-size:15px;line-height:1.4}
      .chama-status-product{padding:11px 12px;border-top:1px solid #e6ece8;background:#fbfdfc}.chama-status-product .tag{font-size:10px;font-weight:900;color:#0b7a53}.chama-status-product strong{display:block;font-size:16px;margin:3px 0;color:#26342d}.chama-status-product .price{font-size:18px;font-weight:900;color:#17372b;margin:3px 0 9px}.chama-status-product a{display:flex;justify-content:center;text-decoration:none;background:#0b7a53;color:#fff;border-radius:10px;padding:10px;font-size:13px;font-weight:900}
      .chama-status-preview{margin-top:10px;border:1px solid #e1e9e4;border-radius:14px;padding:10px}.chama-status-preview img,.chama-status-preview video{width:100%;max-height:280px;object-fit:contain;border-radius:10px;background:#111}.chama-status-preview audio{width:100%}.chama-status-input{width:100%;box-sizing:border-box;border:1px solid #dce5e0;border-radius:12px;padding:11px;margin-top:9px;font-size:15px}.chama-status-send{width:100%;margin-top:9px;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:12px;font-weight:900}.chama-status-cancel{width:100%;margin-top:7px;border:0;background:#f1f4f2;color:#43534b;border-radius:12px;padding:10px;font-weight:700}.chama-status-type-row{display:flex;gap:7px;margin-top:9px}.chama-status-type{flex:1;border:1px solid #dce5e0;background:#fff;color:#405149;border-radius:11px;padding:10px 7px;font-weight:800}.chama-status-type.active{background:#eaf6f0;color:#0b7a53;border-color:#b7ddca}.chama-status-lock{font-size:11px;color:#8a6a00;background:#fff8df;border:1px solid #f0dfa4;border-radius:10px;padding:8px;margin-top:8px;line-height:1.35}
    `;document.head.appendChild(s);
  }
  function close(){document.getElementById('chamaStatusModal')?.remove()}
  function avatarHtml(name,url){return url?`<div class="chama-status-avatar"><img src="${String(url).replace(/"/g,'&quot;')}" alt=""></div>`:`<div class="chama-status-avatar">${(name||'U').charAt(0).toUpperCase()}</div>`}
  function ago(ts){const ms=ts?.toMillis?ts.toMillis():Date.now();const d=Math.max(0,Date.now()-ms);if(d<60000)return'agora';if(d<3600000)return Math.floor(d/60000)+' min';return Math.floor(d/3600000)+' h'}
  async function firebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');const app=appMod.getApps()[0];if(!app)return;
      const [a,f]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      auth=a.getAuth(app);db=f.getFirestore(app);fs=f;a.onAuthStateChanged(auth,async u=>{currentUser=u;ownProfile=null;if(u){try{const p=await fs.getDoc(fs.doc(db,'publicProfiles',u.uid));ownProfile=p.exists()?p.data()||{}:{};}catch{ownProfile={}}}});
    }catch(e){console.warn('[Chama Status]',e)}
  }
  function isProfessional(){return ownProfile?.profileType==='professional'}
  async function loadStatuses(list){
    if(!fs||!db){list.innerHTML='<div class="chama-status-empty">Firebase ainda não está pronto.</div>';return}
    list.innerHTML='<div class="chama-status-loading">Carregando Status...</div>';
    try{
      const now=fs.Timestamp.fromMillis(Date.now());const q=fs.query(fs.collection(db,'statuses'),fs.where('expiresAt','>',now),fs.orderBy('expiresAt','desc'),fs.limit(30));const snap=await fs.getDocs(q);
      if(snap.empty){list.innerHTML='<div class="chama-status-empty">Nenhum Status publicado nas últimas 24 horas.</div>';return}
      list.innerHTML='';snap.forEach(docSnap=>{const x=docSnap.data()||{},item=document.createElement('article');item.className='chama-status-item';
        const meta=document.createElement('div');meta.className='chama-status-meta';meta.innerHTML=avatarHtml(x.nome||'Usuário',x.photoUrl||'')+`<div><strong>${esc(x.nome||'Usuário')}</strong><small>${ago(x.createdAt)}</small></div>`;item.appendChild(meta);
        if(x.mediaUrl){const el=document.createElement(x.kind==='video'?'video':'img');el.className='chama-status-media';el.src=x.mediaUrl;el.loading='lazy';if(x.kind==='video'){el.controls=true;el.playsInline=true;el.preload='metadata'}item.appendChild(el)}
        if(x.text){const t=document.createElement('div');t.className='chama-status-text';t.textContent=x.text;item.appendChild(t)}
        if(x.product?.title&&x.product?.link){const p=document.createElement('div');p.className='chama-status-product';p.innerHTML=`<span class="tag">🛍️ PRODUTO</span><strong>${esc(x.product.title)}</strong>${x.product.price?`<div class="price">${esc(x.product.price)}</div>`:''}<a href="${esc(x.product.link)}" target="_blank" rel="noopener noreferrer sponsored">Ver produto</a>`;item.appendChild(p)}
        list.appendChild(item);
      });
    }catch(e){console.error('[Chama Status]',e);list.innerHTML='<div class="chama-status-empty">Não foi possível carregar os Status agora.</div>'}
  }
  function openCreate(panel){
    const box=document.createElement('div');box.className='chama-status-preview';
    const professional=isProfessional();
    box.innerHTML=`<strong>Novo Status</strong><div class="chama-status-type-row"><button type="button" class="chama-status-type active" data-type="media">📷 Foto/Vídeo</button><button type="button" class="chama-status-type" data-type="product">🛍️ Produto</button></div>${professional?'':'<div class="chama-status-lock">🔒 Produto no Status é um recurso do plano Profissional.</div>'}<input class="chama-status-input" type="file" accept="image/*,video/*"><textarea class="chama-status-input status-text" rows="2" maxlength="300" placeholder="Escreva uma mensagem (opcional)"></textarea><div class="product-fields" hidden><input class="chama-status-input product-title" maxlength="120" placeholder="Título do produto"><input class="chama-status-input product-price" maxlength="40" placeholder="Preço (ex.: R$ 119,90)"><input class="chama-status-input product-link" maxlength="900" placeholder="Link do produto (https://...)" inputmode="url"><div class="chama-status-lock">O produto aparecerá no Status com botão <strong>Ver produto</strong>.</div></div><div class="chama-status-preview-media"></div><button class="chama-status-send">Publicar Status</button><button class="chama-status-cancel">Cancelar</button>`;
    panel.appendChild(box);
    const typeButtons=box.querySelectorAll('.chama-status-type'),fileInput=box.querySelector('input[type=file]'),mediaBox=box.querySelector('.chama-status-preview-media'),productFields=box.querySelector('.product-fields');
    function setType(type){typeButtons.forEach(b=>b.classList.toggle('active',b.dataset.type===type));const product=type==='product';productFields.hidden=!product;fileInput.hidden=product;box.querySelector('.status-text').placeholder=product?'Mensagem sobre o produto (opcional)':'Escreva uma mensagem (opcional)';}
    typeButtons.forEach(b=>b.onclick=()=>{if(b.dataset.type==='product'&&!professional){alert('Recurso disponível no plano Profissional.');return}setType(b.dataset.type)});
    box.querySelector('.chama-status-cancel').onclick=()=>box.remove();
    fileInput.onchange=()=>{mediaBox.innerHTML='';const f=fileInput.files?.[0];if(!f)return;const u=URL.createObjectURL(f);const el=document.createElement(f.type.startsWith('video/')?'video':'img');el.src=u;el.style.width='100%';el.style.maxHeight='280px';el.style.objectFit='contain';el.style.borderRadius='10px';el.style.background='#111';if(f.type.startsWith('video/')){el.controls=true;el.playsInline=true}mediaBox.appendChild(el)};
    box.querySelector('.chama-status-send').onclick=async()=>{
      if(!currentUser){alert('Faça login para publicar um Status.');return}
      const product=!productFields.hidden;
      const file=fileInput.files?.[0],text=box.querySelector('.status-text').value.trim();
      let productData=null;
      if(product){if(!professional){alert('Recurso disponível no plano Profissional.');return}const title=clean(box.querySelector('.product-title').value),price=clean(box.querySelector('.product-price').value),link=safeHttps(box.querySelector('.product-link').value);if(!title||!price||!link){alert('No produto, informe título, preço e link.');return}productData={title:title.slice(0,120),price:price.slice(0,40),link};}
      if(!product&&!file&&!text){alert('Escolha uma foto/vídeo ou escreva uma mensagem.');return}
      const btn=box.querySelector('.chama-status-send');btn.disabled=true;btn.textContent='Publicando...';
      try{
        let mediaUrl='',mediaKey='',kind='text';
        if(file){if(!/^image\/(jpeg|png|webp|gif)$|^video\/(mp4|webm|quicktime)$/.test(file.type))throw new Error('Formato de imagem/vídeo não permitido.');const token=await currentUser.getIdToken();const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':file.name},body:file});const d=await r.json().catch(()=>({}));if(!r.ok||!d.url)throw new Error(d.error||'Falha ao enviar a mídia.');mediaUrl=d.url;mediaKey=d.key||'';kind=d.kind||'image';}
        const name=currentUser.displayName||currentUser.email?.split('@')[0]||'Usuário',photo=currentUser.photoURL||'';
        const payload={uid:currentUser.uid,nome:name,photoUrl:photo,mediaUrl,mediaKey,kind,text,createdAt:fs.serverTimestamp(),expiresAt:fs.Timestamp.fromMillis(Date.now()+86400000)};if(productData)payload.product=productData;
        await fs.addDoc(fs.collection(db,'statuses'),payload);
        box.remove();await loadStatuses(document.querySelector('#chamaStatusList'));alert('Status publicado!');
      }catch(e){console.error('[Chama Status]',e);alert(e?.message||'Não foi possível publicar o Status.');btn.disabled=false;btn.textContent='Publicar Status'}
    };
  }
  async function open(){
    if(!currentUser){alert('Faça login para usar o Status.');return}close();const back=document.createElement('div');back.id='chamaStatusModal';back.className='chama-status-backdrop';const card=document.createElement('section');card.className='chama-status-card';
    const head=document.createElement('div');head.className='chama-status-head';head.innerHTML='<strong>🟢 Status</strong>';const x=document.createElement('button');x.className='chama-status-close';x.textContent='✕';x.onclick=close;head.appendChild(x);
    const actions=document.createElement('div');actions.className='chama-status-actions';const add=document.createElement('button');add.className='chama-status-add';add.textContent='＋ Criar Status';const refresh=document.createElement('button');refresh.className='chama-status-refresh';refresh.textContent='↻ Atualizar';actions.append(add,refresh);
    const list=document.createElement('div');list.id='chamaStatusList';list.className='chama-status-list';card.append(head,actions,list);back.appendChild(card);back.addEventListener('click',e=>{if(e.target===back)close()});document.body.appendChild(back);
    add.onclick=()=>{if(!card.querySelector('.chama-status-preview'))openCreate(card)};refresh.onclick=()=>loadStatuses(list);await loadStatuses(list);
  }
  function installEntry(){if(document.getElementById('chamaStatusEntry'))return;const sidebar=document.querySelector('.sidebar'),list=document.getElementById('usersList');if(!sidebar||!list)return;const b=document.createElement('button');b.id='chamaStatusEntry';b.type='button';b.innerHTML='<span class="chama-status-icon">◉</span><span class="chama-status-entry-text"><strong>Status</strong><small>Fotos, vídeos e produtos por 24 horas</small></span>';b.onclick=open;list.parentNode.insertBefore(b,list)}
  function start(){styles();installEntry();firebase();new MutationObserver(installEntry).observe(document.body,{childList:true,subtree:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
