(()=>{
  const STYLE_ID='chamaPeopleFallbackStyleV1';
  let me=null,db=null,fs=null,running=false,lastKey='';
  const norm=v=>String(v||'').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const esc=v=>String(v||'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-fallback-note{padding:9px 14px;background:#fff8e8;color:#74521c;font-size:11px;border-bottom:1px solid #f0e1b9}
      .chama-fallback-user{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f0f2f1;background:#fff;cursor:pointer}
      .chama-fallback-user:active{background:#f2f8f5}.chama-fallback-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#dff4ea;color:#0b7a53;font-weight:900;flex:0 0 44px}.chama-fallback-main{min-width:0;flex:1}.chama-fallback-name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chama-fallback-sub{font-size:11px;color:#6a756f;margin-top:2px}
    `;document.head.appendChild(s);
  }

  function shouldFallback(results){
    if(!results||results.hidden||running||!me||!db||!fs)return false;
    const text=results.textContent||'';
    return text.includes('Nenhuma pessoa encontrada');
  }

  async function run(results){
    const input=document.getElementById('chamaPeopleSearch'),term=norm(input?.value||'');
    if(term.length<2)return;const key=me.uid+'|'+term;if(key===lastKey)return;lastKey=key;running=true;
    try{
      const snap=await fs.getDocs(fs.query(fs.collection(db,'users'),fs.limit(40))),items=[];
      snap.forEach(d=>{if(d.id===me.uid)return;const x=d.data()||{},nome=String(x.nome||x.email?.split('@')?.[0]||'Usuário'),hay=norm(nome+' '+String(x.email||''));if(hay.includes(term))items.push({uid:d.id,nome})});
      if(!items.length)return;
      results.innerHTML='';const note=document.createElement('div');note.className='chama-fallback-note';note.textContent='Encontrados em cadastros antigos do Chama. Esta busca adicional só acontece quando a busca normal não encontra ninguém.';results.appendChild(note);
      for(const u of items.slice(0,20)){
        const row=document.createElement('div');row.className='chama-fallback-user';const initial=(u.nome||'U').trim().charAt(0).toUpperCase();row.innerHTML=`<div class="chama-fallback-avatar">${esc(initial)}</div><div class="chama-fallback-main"><div class="chama-fallback-name">${esc(u.nome)}</div><div class="chama-fallback-sub">Usuário do Chama</div></div>`;
        row.onclick=()=>{if(typeof window.chamaOpenChat!=='function')return alert('A conversa ainda está carregando. Tente novamente em alguns segundos.');window.chamaOpenChat({uid:u.uid,nome:u.nome,email:`${u.uid}@chama.local`})};results.appendChild(row);
      }
    }catch(e){console.warn('Chama: busca adicional não carregou',e)}finally{running=false}
  }

  async function initFirebase(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);authMod.onAuthStateChanged(auth,u=>{me=u||null;lastKey=''});
    }catch(e){console.warn('Chama: busca adicional não iniciou',e)}
  }

  function watch(){
    const attach=()=>{const results=document.getElementById('chamaPeopleResults');if(!results)return false;new MutationObserver(()=>{if(shouldFallback(results))setTimeout(()=>run(results),120)}).observe(results,{childList:true,subtree:true,characterData:true});return true};
    if(!attach()){let n=0;const t=setInterval(()=>{n++;if(attach()||n>30)clearInterval(t)},150)}
  }

  function start(){addStyle();initFirebase();watch()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();