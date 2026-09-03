(()=>{
  const STYLE_ID='chamaHomeSearchStyleV1';
  let me=null, db=null, fs=null;

  function norm(v=''){
    return String(v).trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }
  function esc(v=''){
    return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  }

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .chama-home-tools{padding:10px 12px;border-bottom:1px solid #edf0ee;background:#fff;display:flex;gap:8px}
      .chama-home-tools input{flex:1;min-width:0;border:1px solid #cfd8d3;border-radius:999px;padding:10px 13px;outline:none}
      .chama-home-tools input:focus{border-color:#0b7a53}
      .chama-home-search-btn{border:0;background:#0b7a53;color:#fff;border-radius:999px;padding:10px 13px;font-weight:800;cursor:pointer}
      .chama-home-cancel{border:0;background:#eef4f1;color:#0b7a53;border-radius:999px;padding:10px 12px;font-weight:800;cursor:pointer}
      .chama-search-status{padding:16px;color:#6a756f;text-align:center}
      .chama-search-user{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f0f2f1;background:#fff;cursor:pointer}
      .chama-search-user:active{background:#f2f8f5}
      .chama-search-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#dff4ea;color:#0b7a53;font-weight:900;flex:0 0 44px}
      .chama-search-main{min-width:0;flex:1}.chama-search-name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chama-search-city{font-size:12px;color:#6a756f;margin-top:2px}
      #usersList.chama-conversations-mode .user:not(.chama-has-conversation){display:none!important}
      .chama-empty-conversations{padding:18px 16px;color:#6a756f;text-align:center;line-height:1.45}
      .chama-search-bridge{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function ensureUi(){
    const sidebar=document.querySelector('.sidebar'),list=document.getElementById('usersList');
    if(!sidebar||!list||document.getElementById('chamaHomeTools'))return;
    const title=sidebar.querySelector('.section-title');
    if(title)title.textContent='Conversas';

    const tools=document.createElement('div');
    tools.id='chamaHomeTools';tools.className='chama-home-tools';
    tools.innerHTML='<input id="chamaPeopleSearch" maxlength="60" placeholder="Buscar pessoa ou cidade"><button id="chamaPeopleSearchBtn" class="chama-home-search-btn" type="button" aria-label="Buscar">🔍</button>';
    list.insertAdjacentElement('beforebegin',tools);

    const results=document.createElement('div');
    results.id='chamaPeopleResults';results.hidden=true;
    list.insertAdjacentElement('afterend',results);

    document.getElementById('chamaPeopleSearchBtn').onclick=runSearch;
    document.getElementById('chamaPeopleSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runSearch()}});
    list.classList.add('chama-conversations-mode');
    refreshConversationRows();
  }

  function refreshConversationRows(){
    const list=document.getElementById('usersList');if(!list)return;
    let count=0;
    list.querySelectorAll('.user:not(.chama-search-bridge)').forEach(row=>{
      const has=!!row.querySelector('.chama-conversation-side');
      row.classList.toggle('chama-has-conversation',has);
      if(has)count++;
    });
    document.getElementById('chamaEmptyConversations')?.remove();
    if(count===0 && list.classList.contains('chama-conversations-mode')){
      const empty=document.createElement('div');empty.id='chamaEmptyConversations';empty.className='chama-empty-conversations';
      empty.textContent='Nenhuma conversa ainda. Use a busca acima para encontrar uma pessoa.';
      list.appendChild(empty);
    }
  }

  async function getFirebase(attempt=0){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      const app=appMod.getApps()[0];
      if(!app){if(attempt>=20)return null;await new Promise(r=>setTimeout(r,100));return getFirebase(attempt+1)}
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');
      fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
      db=fs.getFirestore(app);
      const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,u=>{me=u||null});
      return true;
    }catch(e){console.error('Chama: busca não iniciou',e);return null}
  }

  async function queryField(field,term){
    const q=fs.query(
      fs.collection(db,'publicProfiles'),
      fs.orderBy(field),
      fs.startAt(term),
      fs.endAt(term+'\uf8ff'),
      fs.limit(20)
    );
    return fs.getDocs(q);
  }

  function ensureBridge(u){
    const list=document.getElementById('usersList');if(!list)return '';
    const bridgeId='chamaBridge_'+u.uid;
    let row=document.getElementById(bridgeId);
    const pseudo=`${u.uid}@chama.local`;
    if(!row){
      row=document.createElement('div');row.id=bridgeId;row.className='user chama-search-bridge';row.dataset.uid=u.uid;
      row.innerHTML=`<div class="user-main"><div class="user-name">${esc(u.nome||'Usuário')}</div><div class="user-email">${esc(pseudo)}</div></div>`;
      list.appendChild(row);
    }
    return pseudo;
  }

  async function runSearch(){
    const input=document.getElementById('chamaPeopleSearch');
    const term=norm(input?.value||'');
    if(term.length<2)return alert('Digite pelo menos 2 letras do nome ou da cidade.');
    if(!me||!db||!fs)return alert('Aguarde o Chama terminar de carregar.');

    const list=document.getElementById('usersList'),results=document.getElementById('chamaPeopleResults');
    if(!list||!results)return;
    list.hidden=true;results.hidden=false;results.innerHTML='<div class="chama-search-status">Buscando pessoas...</div>';

    try{
      const [byName,byCity]=await Promise.all([queryField('nomeBusca',term),queryField('cidadeBusca',term)]);
      const found=new Map();
      const add=snap=>snap.forEach(d=>{const x=d.data()||{};if(d.id!==me.uid)found.set(d.id,{uid:d.id,nome:String(x.nome||'Usuário'),cidade:String(x.cidade||'')})});
      add(byName);add(byCity);
      const items=[...found.values()].slice(0,30);
      results.innerHTML='';

      const top=document.createElement('div');top.className='chama-home-tools';
      const label=document.createElement('div');label.style.cssText='flex:1;padding:10px 4px;font-weight:800;color:#34443c';label.textContent=`Resultados: ${items.length}`;
      const cancel=document.createElement('button');cancel.type='button';cancel.className='chama-home-cancel';cancel.textContent='Voltar';cancel.onclick=showConversations;
      top.append(label,cancel);results.appendChild(top);

      if(!items.length){const empty=document.createElement('div');empty.className='chama-search-status';empty.textContent='Nenhuma pessoa encontrada. Usuários antigos aparecerão na busca quando acessarem esta nova versão do Chama.';results.appendChild(empty);return}
      for(const u of items){
        const row=document.createElement('div');row.className='chama-search-user';row.dataset.uid=u.uid;
        const initial=(u.nome||'U').trim().charAt(0).toUpperCase();
        row.innerHTML=`<div class="chama-search-avatar">${esc(initial)}</div><div class="chama-search-main"><div class="chama-search-name">${esc(u.nome||'Usuário')}</div><div class="chama-search-city">${esc(u.cidade||'Cidade não informada')}</div></div>`;
        row.onclick=()=>{
          if(typeof window.chamaOpenChat!=='function')return alert('A conversa ainda está carregando. Tente novamente em alguns segundos.');
          const pseudo=ensureBridge(u);
          window.chamaOpenChat({uid:u.uid,nome:u.nome||'Usuário',email:pseudo});
        };
        results.appendChild(row);
      }
    }catch(e){
      console.error(e);results.innerHTML='<div class="chama-search-status">Não foi possível fazer a busca agora.</div>';
    }
  }

  function showConversations(){
    const list=document.getElementById('usersList'),results=document.getElementById('chamaPeopleResults');
    if(results)results.hidden=true;if(list){list.hidden=false;list.classList.add('chama-conversations-mode');refreshConversationRows()}
  }

  async function start(){
    addStyle();ensureUi();await getFirebase();
    const list=document.getElementById('usersList');
    if(list)new MutationObserver(()=>setTimeout(refreshConversationRows,0)).observe(list,{childList:true,subtree:true});
    setTimeout(refreshConversationRows,800);setTimeout(refreshConversationRows,1800);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();