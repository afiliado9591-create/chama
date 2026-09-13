(()=>{
  const norm=v=>{v=String(v||'').trim().toLowerCase();if(v==='negócio'||v==='negocio')return'Negócio';if(v==='amizade')return'Amizade';if(v==='namoro')return'Namoro';if(v==='religião'||v==='religiao')return'Religião';if(v==='todos')return'Todos';return''};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let bound=false;
  async function loadGroup(segment){
    if(!segment||segment==='Todos')return;
    const list=document.getElementById('usersList');if(!list)return;
    list.innerHTML='<div style="padding:16px;color:#6a756f">Carregando pessoas do grupo...</div>';
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');
      const fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
      const app=appMod.getApps()[0],auth=authMod.getAuth(app),me=auth.currentUser;
      if(!me){list.innerHTML='<div style="padding:16px;color:#b42318">Faça login para ver o grupo.</div>';return}
      const db=fs.getFirestore(app);
      const snap=await fs.getDocs(fs.query(fs.collection(db,'publicProfiles'),fs.where('segmento','==',segment),fs.limit(50)));
      list.innerHTML='';
      if(snap.empty){list.innerHTML='<div style="padding:16px;color:#6a756f">Ainda não há contatos neste grupo.</div>';return}
      snap.forEach(d=>{
        const p=d.data()||{},uid=p.uid||d.id;if(uid===me.uid)return;
        const row=document.createElement('div');row.className='user';row.dataset.uid=uid;row.dataset.segmento=segment;
        row.innerHTML='<div class="avatar">'+String(p.nome||'U').slice(0,1).toUpperCase()+'</div><div class="user-main"><div class="user-name">'+esc(p.nome||'Usuário')+'</div><div class="user-email">'+esc(p.email||'')+'</div></div>';
        row.onclick=()=>{if(typeof window.chamaOpenChat==='function')window.chamaOpenChat({id:uid,uid,nome:p.nome||'Usuário',email:p.email||'',photoUrl:p.photoUrl||''})};list.appendChild(row);
      });
      if(!list.children.length)list.innerHTML='<div style="padding:16px;color:#6a756f">Ainda não há outros contatos neste grupo.</div>';
    }catch(e){console.error('Chama grupo:',e);list.innerHTML='<div style="padding:16px;color:#b42318">Não foi possível carregar os contatos deste grupo.</div>'}
  }
  function bind(){
    if(bound)return;const box=document.getElementById('cfGroups');if(!box)return;const buttons=box.querySelectorAll('.cf-btn');if(!buttons.length)return;
    bound=true;buttons.forEach(b=>b.addEventListener('click',()=>{const text=b.textContent.replace(/^[^A-Za-zÀ-ÿ]*/,'').trim();loadGroup(norm(text))}));
  }
  function start(){bind();new MutationObserver(()=>{if(!bound)bind()}).observe(document.body,{childList:true,subtree:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();