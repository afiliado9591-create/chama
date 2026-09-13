(()=>{
  if(window.__CHAMA_GROUPS_FIXED__)return;window.__CHAMA_GROUPS_FIXED__=true;
  const norm=v=>{v=String(v||'').trim().toLowerCase();if(v.includes('negócio')||v.includes('negocio'))return'Negócio';if(v.includes('amizade'))return'Amizade';if(v.includes('namoro'))return'Namoro';if(v.includes('religião')||v.includes('religiao'))return'Religião';return''};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function firebase(){const a=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),am=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');const app=a.getApps()[0];return {am,fs,app,me:am.getAuth(app).currentUser,db:fs.getFirestore(app)}}
  async function loadGroup(segment){
    if(!segment)return;
    const list=document.getElementById('usersList');if(!list)return;
    list.innerHTML='<div style="padding:16px;color:#6a756f">Carregando pessoas do grupo...</div>';
    try{
      const {fs,me,db}=await firebase();
      if(!me){list.innerHTML='<div style="padding:16px;color:#b42318">Faça login para entrar no grupo.</div>';return}
      const snap=await fs.getDocs(fs.query(fs.collection(db,'publicProfiles'),fs.where('segmento','==',segment),fs.limit(100)));
      list.innerHTML='';
      if(snap.empty){list.innerHTML='<div style="padding:16px;color:#6a756f">Você entrou no grupo. Ainda não há outros contatos aqui.</div>';return}
      snap.forEach(d=>{
        const p=d.data()||{},uid=p.uid||d.id,own=uid===me.uid;
        const row=document.createElement('div');row.className='user';row.dataset.uid=uid;row.dataset.segmento=segment;
        row.innerHTML='<div class="avatar">'+String(p.nome||'U').slice(0,1).toUpperCase()+'</div><div class="user-main"><div class="user-name">'+esc(p.nome||'Usuário')+(own?' <small style="font-weight:700;color:#0b7a53">(Você)</small>':'')+'</div><div class="user-email">'+esc(p.email||'')+'</div></div>';
        if(!own)row.onclick=()=>{if(typeof window.chamaOpenChat==='function')window.chamaOpenChat({id:uid,uid,nome:p.nome||'Usuário',email:p.email||'',photoUrl:p.photoUrl||''})};
        list.appendChild(row);
      });
    }catch(e){console.error('Chama grupo:',e);list.innerHTML='<div style="padding:16px;color:#b42318">Não foi possível carregar os contatos deste grupo.</div>'}
  }
  async function enterGroup(segment){
    try{
      const {fs,me,db}=await firebase();if(!me)throw new Error('LOGIN');
      const data={uid:me.uid,segmento:segment,updatedAt:fs.serverTimestamp()};
      await fs.setDoc(fs.doc(db,'users',me.uid),data,{merge:true});
      await fs.setDoc(fs.doc(db,'publicProfiles',me.uid),data,{merge:true});
      return true;
    }catch(e){console.error('Chama entrada grupo:',e);return false}
  }
  function bind(){
    const box=document.getElementById('cfGroups');if(!box)return;
    box.querySelectorAll('.cf-btn').forEach(b=>{
      if(b.dataset.groupFixed)return;b.dataset.groupFixed='1';
      b.addEventListener('click',async e=>{
        e.preventDefault();e.stopImmediatePropagation();
        const segment=norm(b.textContent);if(!segment)return;
        b.disabled=true;const old=b.textContent;b.textContent='Salvando...';
        const ok=await enterGroup(segment);b.disabled=false;b.textContent=ok?'✓ '+segment:old;
        if(ok)await loadGroup(segment);else{const list=document.getElementById('usersList');if(list)list.innerHTML='<div style="padding:16px;color:#b42318">Não foi possível salvar seu contato neste grupo. Tente novamente.</div>'}
      },true);
    });
  }
  function start(){bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();