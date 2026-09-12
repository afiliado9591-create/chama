(()=>{
  if(window.__CHAMA_GROUPS_SAFE__) return;
  window.__CHAMA_GROUPS_SAFE__=true;
  const STYLE_ID='chamaGroupsSafeStyle';
  let db=null,fs=null,auth=null,me=null,currentGroup='Todos',userCache=new Map(),booted=false;
  const wait=(p,ms=5000)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
  const GROUPS=[
    {id:'Todos',label:'Todos',icon:'👥'},
    {id:'Comércio',label:'Comércio',icon:'🛍️'},
    {id:'Amizade',label:'Amizade',icon:'🤝'},
    {id:'Namoro',label:'Namoro',icon:'❤️'},
    {id:'Religião',label:'Religião',icon:'🙏'}
  ];
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  function style(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-groups{padding:10px 12px 8px;border-bottom:1px solid #e6e9e7;background:#fff}
      .chama-groups-title{font-size:12px;font-weight:850;color:#6a756f;text-transform:uppercase;letter-spacing:.06em;margin:2px 4px 8px}
      .chama-group-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .chama-group-btn{border:1px solid #d8e0dc;background:#f8faf9;color:#274037;border-radius:11px;padding:9px 8px;text-align:left;font-size:13px;font-weight:750;cursor:pointer}
      .chama-group-btn.active{background:#0b7a53;color:#fff;border-color:#0b7a53}
      .chama-group-btn span{margin-right:5px}
      .chama-group-count{font-size:11px;font-weight:700;opacity:.72;margin-left:3px}
      .chama-group-modal{position:fixed;inset:0;background:#0008;z-index:5100;display:grid;place-items:center;padding:16px}
      .chama-group-card{width:min(430px,100%);background:#fff;border-radius:22px;box-shadow:0 20px 70px #0005;overflow:hidden}
      .chama-group-head{background:#0b7a53;color:#fff;padding:20px}.chama-group-head strong{font-size:20px}.chama-group-head p{margin:6px 0 0;opacity:.9;font-size:13px}
      .chama-group-body{padding:20px}.chama-group-options{display:grid;gap:9px}
      .chama-group-option{border:1px solid #d2dbd6;background:#fff;border-radius:14px;padding:13px;text-align:left;cursor:pointer;font-weight:800;color:#20372d}
      .chama-group-option small{display:block;color:#6a756f;font-weight:500;margin-top:3px}
      .chama-group-option.selected{border-color:#0b7a53;background:#effaf5;box-shadow:0 0 0 2px #0b7a5322}
      .chama-group-save{width:100%;border:0;background:#0b7a53;color:#fff;border-radius:13px;padding:13px;margin-top:14px;font-weight:900;cursor:pointer}.chama-group-save:disabled{opacity:.6}
      .chama-group-msg{min-height:18px;color:#b42318;font-size:12px;margin-top:8px}
      .chama-group-badge{display:inline-block;font-size:10px;font-weight:800;color:#0b7a53;background:#e7f7ef;border-radius:999px;padding:3px 7px;margin-left:5px;vertical-align:middle}
      @media(max-width:700px){.chama-group-grid{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(s);
  }
  async function firebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      const app=appMod.getApps()[0];if(!app)return false;
      const [am,fm]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
      auth=am.getAuth(app);db=fm.getFirestore(app);fs=fm;
      am.onAuthStateChanged(auth,async u=>{me=u||null;if(u){await setup();}else{removeUi();}});
      return true;
    }catch(e){console.warn('Chama grupos:',e);return false}
  }
  function removeUi(){document.getElementById('chamaGroups')?.remove();document.getElementById('chamaGroupModal')?.remove();userCache.clear()}
  async function getMyData(){
    if(!me||!db||!fs)return {};
    const snap=await wait(fs.getDoc(fs.doc(db,'users',me.uid)),4500);
    return snap.exists()?snap.data():{};
  }
  async function setup(){
    if(booted)return;
    booted=true;style();
    let d={};try{d=await getMyData()}catch(_){ }
    const segment=normalize(d.segmento||d.segment||'');
    if(!segment) await chooseSegment();
    else currentGroup='Todos';
    ensureGroupsUi();
    await loadUsers();
    const name=document.getElementById('meName');
    if(name&&!name.dataset.groupBound){name.dataset.groupBound='1';name.addEventListener('click',()=>setTimeout(ensureGroupsUi,50));}
  }
  function normalize(v){
    const x=String(v||'').trim().toLowerCase();
    if(x==='negócio'||x==='negocio')return'Comércio';
    if(x==='comércio'||x==='comercio')return'Comércio';
    if(x==='amizade')return'Amizade';if(x==='namoro')return'Namoro';if(x==='religião'||x==='religiao')return'Religião';if(x==='todos')return'Todos';return'';
  }
  async function chooseSegment(){
    if(!me||!db||!fs)return;
    document.getElementById('chamaGroupModal')?.remove();
    const modal=document.createElement('div');modal.id='chamaGroupModal';modal.className='chama-group-modal';
    const card=document.createElement('div');card.className='chama-group-card';
    card.innerHTML='<div class="chama-group-head"><strong>Escolha seu grupo</strong><p>Isso define em qual grupo você aparecerá. Depois você poderá visitar os outros grupos.</p></div><div class="chama-group-body"><div class="chama-group-options"></div><button class="chama-group-save" type="button">Continuar</button><div class="chama-group-msg"></div></div>';
    modal.appendChild(card);document.body.appendChild(modal);
    const box=card.querySelector('.chama-group-options');let selected='';
    GROUPS.forEach(g=>{const b=document.createElement('button');b.type='button';b.className='chama-group-option';b.innerHTML=`${g.icon} ${esc(g.label)}<small>${g.id==='Todos'?'Você poderá aparecer em todos os grupos.':'Você aparecerá automaticamente neste grupo.'}</small>`;b.onclick=()=>{selected=g.id;box.querySelectorAll('.chama-group-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};box.appendChild(b)});
    card.querySelector('.chama-group-save').onclick=async()=>{
      const btn=card.querySelector('.chama-group-save'),msg=card.querySelector('.chama-group-msg');
      if(!selected){msg.textContent='Escolha um grupo para continuar.';return}
      btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
      try{await wait(fs.setDoc(fs.doc(db,'users',me.uid),{uid:me.uid,segmento:selected,updatedAt:fs.serverTimestamp()},{merge:true}),5000);currentGroup='Todos';modal.remove();await loadUsers();ensureGroupsUi();}
      catch(e){console.error(e);msg.textContent='Não foi possível salvar. Tente novamente.';btn.disabled=false;btn.textContent='Continuar'}
    };
  }
  function ensureGroupsUi(){
    const list=document.getElementById('usersList');if(!list||!list.parentElement)return;
    let host=document.getElementById('chamaGroups');
    if(!host){host=document.createElement('div');host.id='chamaGroups';host.className='chama-groups';list.parentElement.insertBefore(host,list)}
    host.innerHTML='<div class="chama-groups-title">Grupos</div><div class="chama-group-grid"></div>';
    const grid=host.querySelector('.chama-group-grid');
    GROUPS.forEach(g=>{const b=document.createElement('button');b.type='button';b.className='chama-group-btn'+(currentGroup===g.id?' active':'');b.dataset.group=g.id;b.innerHTML=`<span>${g.icon}</span>${esc(g.label)}<span class="chama-group-count" data-count="${esc(g.id)}"></span>`;b.onclick=async()=>{currentGroup=g.id;ensureGroupsUi();await loadUsers();};grid.appendChild(b)});
    updateCounts();
  }
  function updateCounts(){
    document.querySelectorAll('.chama-group-count').forEach(el=>{const g=el.dataset.count;let n=0;userCache.forEach(u=>{const s=normalize(u.segmento||u.segment);if(g==='Todos'||s===g||s==='Todos')n++});el.textContent=n?`(${n})`:''});}
  async function loadUsers(){
    if(!me||!db||!fs)return;
    try{
      const snap=await wait(fs.getDocs(fs.query(fs.collection(db,'users'),fs.limit(100))),6000);userCache.clear();snap.forEach(d=>{const u=d.data()||{};if(u.uid&&u.uid!==me.uid)userCache.set(u.uid,u)});
      filterExistingRows();updateCounts();
    }catch(e){console.warn('Chama grupos load:',e)}
  }
  function filterExistingRows(){
    const list=document.getElementById('usersList');if(!list)return;
    const rows=[...list.querySelectorAll('.user')];
    if(!rows.length)return;
    rows.forEach(row=>{const uid=row.dataset.uid,u=userCache.get(uid),s=normalize(u?.segmento||u?.segment);const show=currentGroup==='Todos'||s===currentGroup||s==='Todos';row.style.display=show?'flex':'none';let badge=row.querySelector('.chama-group-badge');if(badge)badge.remove();if(show&&s){const name=row.querySelector('.user-name');if(name){badge=document.createElement('span');badge.className='chama-group-badge';badge.textContent=s;name.appendChild(badge)}}});
  }
  const observer=new MutationObserver(()=>{if(document.getElementById('usersList')){ensureGroupsUi();filterExistingRows();}});
  function boot(){style();firebase();setTimeout(()=>{ensureGroupsUi();observer.observe(document.body,{childList:true,subtree:true});},300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();