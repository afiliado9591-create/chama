(()=>{
  if(window.__chamaStatusLoaded)return; window.__chamaStatusLoaded=true;
  const STYLE_ID='chamaStatusStyleV1';
  let fs=null,db=null,auth=null,currentUser=null;

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
      .chama-status-list{display:grid;gap:9px}.chama-status-item{border:1px solid #e6ece8;border-radius:16px;overflow:hidden;background:#fff}.chama-status-meta{display:flex;align-items:center;gap:9px;padding:9px 10px}.chama-status-avatar{width:38px;height:38px;border-radius:50%;background:#e7f5ee;color:#0b7a53;display:grid;place-items:center;font-weight:900;overflow:hidden}.chama-status-avatar img{width:100%;height:100%;object-fit:cover}.chama-status-meta strong{font-size:14px}.chama-status-meta small{display:block;color:#718078;font-size:11px}.chama-status-media{width:100%;max-height:430px;display:block;object-fit:contain;background:#111}.chama-status-text{padding:10px 12px;font-size:15px;line-height:1.4}.chama-status-empty{text-align:center;color:#718078;padding:28px 12px}.chama-status-loading{text-align:center;color:#718078;padding:20px}
      .chama-status-preview{margin-top:10px;border:1px solid #e1e9e4;border-radius:14px;padding:10px}.chama-status-preview img,.chama-status-preview video{width:100%;max-height:280px;object-fit:contain;border-radius:10px;background:#111}.chama-status-preview audio{width:100%}.chama-status-input{width:100%;box-sizing:border-box;border:1px solid #dce5e0;border-radius:12px;padding:11px;margin-top:9px;font-size:15px}.chama-status-send{width:100%;margin-top:9px;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:12px;font-weight:900}.chama-status-cancel{width:100%;margin-top:7px;border:0;background:#f1f4f2;color:#43534b;border-radius:12px;padding:10px;font-weight:700}
    `;document.head.appendChild(s);
  }
  function close(){document.getElementById('chamaStatusModal')?.remove()}
  function avatarHtml(name,url){return url?`<div class="chama-status-avatar"><img src="${String(url).replace(/"/g,'&quot;')}" alt=""></div>`:`<div class="chama-status-avatar">${(name||'U').charAt(0).toUpperCase()}</div>`}
  function ago(ts){const ms=ts?.toMillis?ts.toMillis():Date.now();const d=Math.max(0,Date.now()-ms);if(d<60000)return'agora';if(d<3600000)return Math.floor(d/60000)+' min';return Math.floor(d/3600000)+' h'}

  async function firebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      const app=appMod.getApps()[0];if(!app)return;
      const [a,f]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      auth=a.getAuth(app);db=f.getFirestore(app);fs=f; a.onAuthStateChanged(auth,u=>{currentUser=u;});
    }catch(e){console.warn('[Chama Status]',e)}
  }

  async function loadStatuses(list){
    if(!fs||!db){list.innerHTML='<div class="chama-status-empty">Firebase ainda não está pronto.</div>';return}
    list.innerHTML='<div class="chama-status-loading">Carregando Status...</div>';
    try{
      const now=fs.Timestamp.fromMillis(Date.now());
      const q=fs.query(fs.collection(db,'statuses'),fs.where('expiresAt','>',now),fs.orderBy('expiresAt','desc'),fs.limit(30));
      const snap=await fs.getDocs(q);
      if(snap.empty){list.innerHTML='<div class="chama-status-empty">Nenhum Status publicado nas últimas 24 horas.</div>';return}
      list.innerHTML='';
      snap.forEach(docSnap=>{
        const x=docSnap.data()||{},item=document.createElement('article');item.className='chama-status-item';
        const meta=document.createElement('div');meta.className='chama-status-meta';meta.innerHTML=avatarHtml(x.nome||'Usuário',x.photoUrl||'')+`<div><strong>${String(x.nome||'Usuário').replace(/</g,'&lt;')}</strong><small>${ago(x.createdAt)}</small></div>`;item.appendChild(meta);
        if(x.mediaUrl){const el=document.createElement(x.kind==='video'?'video':'img');el.className='chama-status-media';el.src=x.mediaUrl;el.loading='lazy';if(x.kind==='video'){el.controls=true;el.playsInline=true;el.preload='metadata'}item.appendChild(el)}
        if(x.text){const t=document.createElement('div');t.className='chama-status-text';t.textContent=x.text;item.appendChild(t)}
        list.appendChild(item);
      });
    }catch(e){console.error('[Chama Status]',e);list.innerHTML='<div class="chama-status-empty">Não foi possível carregar os Status agora.</div>'}
  }

  function openCreate(panel){
    const box=document.createElement('div');box.className='chama-status-preview';
    box.innerHTML='<strong>Novo Status</strong><input class="chama-status-input" type="file" accept="image/*,video/*"><textarea class="chama-status-input" rows="2" maxlength="300" placeholder="Escreva uma mensagem (opcional)"></textarea><div class="chama-status-preview-media"></div><button class="chama-status-send">Publicar Status</button><button class="chama-status-cancel">Cancelar</button>';
    panel.appendChild(box);box.querySelector('.chama-status-cancel').onclick=()=>box.remove();
    const fileInput=box.querySelector('input'),mediaBox=box.querySelector('.chama-status-preview-media');
    fileInput.onchange=()=>{mediaBox.innerHTML='';const f=fileInput.files?.[0];if(!f)return;const u=URL.createObjectURL(f);const el=document.createElement(f.type.startsWith('video/')?'video':'img');el.src=u;el.style.width='100%';el.style.maxHeight='280px';el.style.objectFit='contain';el.style.borderRadius='10px';el.style.background='#111';if(f.type.startsWith('video/')){el.controls=true;el.playsInline=true}mediaBox.appendChild(el)};
    box.querySelector('.chama-status-send').onclick=async()=>{
      if(!currentUser){alert('Faça login para publicar um Status.');return}
      const file=fileInput.files?.[0],text=box.querySelector('textarea').value.trim();if(!file&&!text){alert('Escolha uma foto/vídeo ou escreva uma mensagem.');return}
      const btn=box.querySelector('.chama-status-send');btn.disabled=true;btn.textContent='Publicando...';
      try{
        let mediaUrl='',mediaKey='',kind='text';
        if(file){
          if(!/^image\/(jpeg|png|webp|gif)$|^video\/(mp4|webm|quicktime)$/.test(file.type))throw new Error('Formato de imagem/vídeo não permitido.');
          const token=await currentUser.getIdToken();const r=await fetch('/api/media',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type,'X-File-Name':file.name},body:file});const d=await r.json().catch(()=>({}));if(!r.ok||!d.url)throw new Error(d.error||'Falha ao enviar a mídia.');mediaUrl=d.url;mediaKey=d.key||'';kind=d.kind||'image';
        }
        const name=currentUser.displayName||currentUser.email?.split('@')[0]||'Usuário';
        const photo=currentUser.photoURL||'';
        await fs.addDoc(fs.collection(db,'statuses'),{uid:currentUser.uid,nome:name,photoUrl:photo,mediaUrl,mediaKey,kind,text,createdAt:fs.serverTimestamp(),expiresAt:fs.Timestamp.fromMillis(Date.now()+86400000)});
        box.remove();await loadStatuses(document.querySelector('#chamaStatusList'));alert('Status publicado!');
      }catch(e){console.error('[Chama Status]',e);alert(e?.message||'Não foi possível publicar o Status.');btn.disabled=false;btn.textContent='Publicar Status'}
    };
  }

  async function open(){
    if(!currentUser){alert('Faça login para usar o Status.');return}
    close();const back=document.createElement('div');back.id='chamaStatusModal';back.className='chama-status-backdrop';const card=document.createElement('section');card.className='chama-status-card';
    const head=document.createElement('div');head.className='chama-status-head';head.innerHTML='<strong>🟢 Status</strong>';const x=document.createElement('button');x.className='chama-status-close';x.textContent='✕';x.onclick=close;head.appendChild(x);
    const actions=document.createElement('div');actions.className='chama-status-actions';const add=document.createElement('button');add.className='chama-status-add';add.textContent='＋ Criar Status';const refresh=document.createElement('button');refresh.className='chama-status-refresh';refresh.textContent='↻ Atualizar';actions.append(add,refresh);
    const list=document.createElement('div');list.id='chamaStatusList';list.className='chama-status-list';card.append(head,actions,list);back.appendChild(card);back.addEventListener('click',e=>{if(e.target===back)close()});document.body.appendChild(back);
    add.onclick=()=>{if(!card.querySelector('.chama-status-preview'))openCreate(card)};refresh.onclick=()=>loadStatuses(list);await loadStatuses(list);
  }

  function installEntry(){
    if(document.getElementById('chamaStatusEntry'))return;const sidebar=document.querySelector('.sidebar'),list=document.getElementById('usersList');if(!sidebar||!list)return;
    const b=document.createElement('button');b.id='chamaStatusEntry';b.type='button';b.innerHTML='<span class="chama-status-icon">◉</span><span class="chama-status-entry-text"><strong>Status</strong><small>Fotos e vídeos por 24 horas</small></span>';b.onclick=open;list.parentNode.insertBefore(b,list);
  }
  function start(){styles();installEntry();firebase();new MutationObserver(installEntry).observe(document.body,{childList:true,subtree:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
