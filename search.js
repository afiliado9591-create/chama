(()=>{
  function initSearch(){
    const sidebar=document.querySelector('.sidebar');
    const me=sidebar?.querySelector('.me');
    if(!sidebar||!me||document.getElementById('contactSearch')) return;

    const style=document.createElement('style');
    style.textContent=`
      .contact-search-wrap{padding:10px 12px;background:#fff;border-bottom:1px solid var(--line)}
      .contact-search{display:flex;align-items:center;gap:9px;background:#f0f2f1;border-radius:12px;padding:0 12px}
      .contact-search span{font-size:17px;color:var(--muted)}
      .contact-search input{width:100%;border:0;outline:0;background:transparent;padding:11px 0;font-size:14px;color:var(--text)}
      .contact-search input::placeholder{color:#7b8580}
      .search-empty{padding:16px;color:var(--muted);text-align:center;font-size:14px}
    `;
    document.head.appendChild(style);

    const wrap=document.createElement('div');
    wrap.className='contact-search-wrap';
    wrap.innerHTML=`<div class="contact-search"><span>⌕</span><input id="contactSearch" type="search" placeholder="Pesquisar conversas ou pessoas" autocomplete="off" aria-label="Pesquisar pessoas"></div>`;
    me.insertAdjacentElement('afterend',wrap);

    const input=wrap.querySelector('#contactSearch');
    const list=document.getElementById('usersList');
    if(!list) return;

    function normalize(v=''){
      return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    }

    function filter(){
      const term=normalize(input.value);
      const rows=[...list.querySelectorAll('.user')];
      let visible=0;
      rows.forEach(row=>{
        const match=!term||normalize(row.innerText).includes(term);
        row.style.display=match?'':'none';
        if(match) visible++;
      });
      let empty=list.querySelector('.search-empty');
      if(term&&rows.length&&visible===0){
        if(!empty){ empty=document.createElement('div'); empty.className='search-empty'; empty.textContent='Nenhum resultado encontrado.'; list.appendChild(empty); }
      }else if(empty){ empty.remove(); }
    }

    input.addEventListener('input',filter);
    const observer=new MutationObserver(filter);
    observer.observe(list,{childList:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initSearch);
  else initSearch();
})();
