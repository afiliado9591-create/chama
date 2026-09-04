(()=>{
  const STYLE_ID='chamaCommunityCountStyleV2';
  let currentUid='',db=null,fs=null,me=null,isAdmin=false,currentCount=0,currentEnabled=false;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .chama-community-count-wrap{margin-top:10px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
      .chama-community-count{display:inline-flex;align-items:center;gap:7px;background:#eef8f3;border:1px solid #d8ebe1;color:#0b7a53;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:850}
      .chama-community-count-dot{width:8px;height:8px;border-radius:50%;background:#16a36a;box-shadow:0 0 0 3px #16a36a1f}
      .chama-community-count-edit{border:0;background:#fff8e8;color:#805100;border:1px solid #f0ddb0;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:850;cursor:pointer}
      .chama-count-backdrop{position:fixed;inset:0;background:#0007;z-index:3900;display:grid;place-items:center;padding:16px}
      .chama-count-modal{width:min(380px,100%);background:#fff;border-radius:20px;padding:18px;box-shadow:0 22px 60px #0004}
      .chama-count-modal h3{margin:0 0 6px}.chama-count-modal p{margin:0 0 14px;color:#68756e;font-size:13px;line-height:1.45}
      .chama-count-modal label{display:grid;gap:6px;font-size:13px;font-weight:800;color:#48564f;margin-bottom:10px}
      .chama-count-modal input[type="number"]{width:100%;border:1px solid #cad5cf;border-radius:12px;padding:11px 12px;font:inherit}
      .chama-count-check{display:flex!important;grid-template-columns:none!important;align-items:center;gap:8px!important}
      .chama-count-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.chama-count-actions button{border:0;border-radius:12px;padding:11px 12px;font-weight:850}.chama-count-cancel{background:#eef4f1;color:#0b7a53}.chama-count-save{background:#0b7a53;color:#fff}
      .chama-count-msg{min-height:18px;margin-top:8px;font-size:12px;color:#0b7a53;font-weight:800}
      .chama-affday-admin-shortcut{width:100%;border:1px solid #f0ddb0;background:#fff8e8;color:#805100;border-radius:12px;padding:11px 13px;font-weight:900;cursor:pointer;margin:0 0 12px}
    `;
    document.head.appendChild(s);
  }

  function ensureAffiliateDayAdminShortcut(){
    const existing=document.getElementById('chamaAffdayAdminShortcut');
    if(!isAdmin){existing?.remove();return}
    const body=document.querySelector('#chamaAffiliateDayModal .chama-affday-body');
    if(!body||existing)return;
    const btn=document.createElement('button');
    btn.id='chamaAffdayAdminShortcut';
    btn.type='button';
    btn.className='chama-affday-admin-shortcut';
    btn.textContent='✏️ Editar catálogo';
    btn.onclick=()=>{location.href='./admin.html#chamaAffiliateDayAdminCard'};
    const status=body.querySelector('.chama-affday-status');
    if(status)status.insertAdjacentElement('afterend',btn);else body.prepend(btn);
  }

  function render(){
    const meBox=document.querySelector('.me');
    if(!meBox){ensureAffiliateDayAdminShortcut();return}
    let wrap=document.getElementById('chamaCommunityCountWrap');
    if(!currentEnabled&&!isAdmin){wrap?.remove();ensureAffiliateDayAdminShortcut();return}
    if(!wrap){wrap=document.createElement('div');wrap.id='chamaCommunityCountWrap';wrap.className='chama-community-count-wrap';meBox.appendChild(wrap)}
    wrap.innerHTML='';
    if(currentEnabled||isAdmin){
      const chip=document.createElement('div');chip.className='chama-community-count';chip.innerHTML='<span class="chama-community-count-dot"></span><span></span>';
      chip.querySelector('span:last-child').textContent=`${Math.max(0,currentCount).toLocaleString('pt-BR')} pessoas no Chama`;
      if(!currentEnabled&&isAdmin)chip.style.opacity='.65';
      wrap.appendChild(chip);
    }
    if(isAdmin){const edit=document.createElement('button');edit.type='button';edit.className='chama-community-count-edit';edit.textContent='✏️ Editar';edit.onclick=openEditor;wrap.appendChild(edit)}
    ensureAffiliateDayAdminShortcut();
  }

  function openEditor(){
    if(!isAdmin||!me||!db||!fs)return;
    document.getElementById('chamaCountEditor')?.remove();
    const back=document.createElement('div');back.id='chamaCountEditor';back.className='chama-count-backdrop';
    back.innerHTML=`<section class="chama-count-modal"><h3>👥 Contador da comunidade</h3><p>Você escolhe o número exibido. Ele aparece como “pessoas no Chama”, não como pessoas online.</p><label>Quantidade exibida<input id="chamaCountInput" type="number" min="0" max="9999999" step="1" inputmode="numeric" value="${Math.max(0,currentCount)}"></label><label class="chama-count-check"><input id="chamaCountEnabled" type="checkbox" ${currentEnabled?'checked':''}> Exibir para todos na tela inicial</label><div class="chama-count-actions"><button type="button" class="chama-count-cancel">Cancelar</button><button type="button" class="chama-count-save">Salvar</button></div><div class="chama-count-msg"></div></section>`;
    document.body.appendChild(back);back.querySelector('.chama-count-cancel').onclick=()=>back.remove();back.addEventListener('click',e=>{if(e.target===back)back.remove()});
    back.querySelector('.chama-count-save').onclick=async()=>{
      const btn=back.querySelector('.chama-count-save'),msg=back.querySelector('.chama-count-msg');
      const n=Math.max(0,Math.min(9999999,Math.floor(Number(back.querySelector('#chamaCountInput').value||0))));
      const enabled=back.querySelector('#chamaCountEnabled').checked;btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
      try{await fs.setDoc(fs.doc(db,'appConfig','communityCount'),{count:n,enabled,updatedAt:fs.serverTimestamp(),updatedBy:me.uid},{merge:true});currentCount=n;currentEnabled=enabled;render();msg.textContent='Salvo ✓';setTimeout(()=>back.remove(),450)}
      catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}
      finally{btn.disabled=false;btn.textContent='Salvar'}
    };
  }

  async function init(){
    addStyle();
    new MutationObserver(()=>ensureAffiliateDayAdminShortcut()).observe(document.body,{childList:true,subtree:true});
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];
      for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{
        currentUid=user?.uid||'';me=user||null;isAdmin=false;currentCount=0;currentEnabled=false;
        if(!user){render();return}const uid=user.uid;
        try{
          const [cfgSnap,userSnap]=await Promise.all([fs.getDoc(fs.doc(db,'appConfig','communityCount')),fs.getDoc(fs.doc(db,'users',uid))]);
          if(currentUid!==uid)return;isAdmin=userSnap.exists()&&userSnap.data().admin===true;
          const d=cfgSnap.exists()?cfgSnap.data()||{}:{};currentCount=Math.max(0,Math.floor(Number(d.count||0)));currentEnabled=d.enabled===true;render();
        }catch(e){console.warn('Chama: contador da comunidade não carregou',e);render()}
      });
    }catch(e){console.warn('Chama: contador da comunidade não iniciou',e)}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();