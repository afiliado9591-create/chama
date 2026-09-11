(()=>{
  const STYLE_ID='chamaContactSearchStyleV2';
  function initSearch(){
    const sidebar=document.querySelector('.sidebar'),me=sidebar?.querySelector('.me');
    if(!sidebar||!me||document.getElementById('contactSearch'))return;
    if(!document.getElementById(STYLE_ID)){
      const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
        .contact-search-wrap{padding:10px 12px;background:#fff;border-bottom:1px solid var(--line)}
        .contact-search{display:flex;align-items:center;gap:9px;background:#f0f2f1;border-radius:12px;padding:0 12px}
        .contact-search span{font-size:17px;color:var(--muted)}
        .contact-search input{width:100%;border:0;outline:0;background:transparent;padding:11px 0;font-size:14px;color:var(--text)}
        .contact-search input::placeholder{color:#7b8580}
        .search-empty{padding:16px;color:var(--muted);text-align:center;font-size:14px}
        #usersList .user{cursor:pointer!important;pointer-events:auto!important}
        #usersList .user *{pointer-events:none}
      `;document.head.appendChild(style)
    }
    const wrap=document.createElement('div');wrap.className='contact-search-wrap';
    wrap.innerHTML='<div class="contact-search"><span>⌕</span><input id="contactSearch" type="search" placeholder="Pesquisar conversas ou pessoas" autocomplete="off" aria-label="Pesquisar pessoas"></div>';
    me.insertAdjacentElement('afterend',wrap);
    const input=wrap.querySelector('#contactSearch'),list=document.getElementById('usersList');if(!list)return;
    const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    function filter(){
      const term=normalize(input.value),rows=[...list.querySelectorAll('.user')];let visible=0;
      rows.forEach(row=>{const match=!term||normalize(row.innerText).includes(term);row.style.display=match?'':'none';if(match)visible++});
      let empty=list.querySelector('.search-empty');
      if(term&&rows.length&&visible===0){if(!empty){empty=document.createElement('div');empty.className='search-empty';empty.textContent='Nenhum resultado encontrado.';list.appendChild(empty)}}else if(empty)empty.remove();
    }
    input.addEventListener('input',filter);
    new MutationObserver(filter).observe(list,{childList:true,subtree:true});
    // Garante que o resultado da pesquisa continue abrindo a conversa mesmo se outro script mexer no clique da linha.
    list.addEventListener('click',e=>{
      const row=e.target.closest?.('.user');if(!row||row.style.display==='none')return;
      const uid=String(row.dataset.uid||'').trim();if(!uid)return;
      e.preventDefault();e.stopPropagation();
      const name=row.querySelector('.user-name')?.textContent?.trim()||'Usuário';
      const email=row.querySelector('.user-email')?.textContent?.trim()||'';
      if(typeof window.chamaOpenChat==='function')window.chamaOpenChat({uid,nome:name,email});
      else setTimeout(()=>typeof window.chamaOpenChat==='function'&&window.chamaOpenChat({uid,nome:name,email}),250);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSearch,{once:true});else initSearch();
})();
