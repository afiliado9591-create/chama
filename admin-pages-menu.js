(()=>{
  if(!/\/admin\.html$/i.test(location.pathname))return;
  const STYLE_ID='chamaAdminPagesMenuStyleV1';
  const DEFAULT_ITEMS=[{type:'external',label:'ChatShop',icon:'🛍️',url:'https://alibr.com.br/',enabled:true,highlight:true,title:'',slug:'',content:''}];
  let me=null,db=null,fs=null,allowed=false;

  const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  const clean=(v,max)=>String(v||'').trim().replace(/\s+/g,' ').slice(0,max);
  const slugify=v=>clean(v,60).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
  function safeUrl(v){let x=String(v||'').trim();if(!x)return '';if(!/^https?:\/\//i.test(x))x='https://'+x;try{const u=new URL(x);return u.protocol==='https:'?u.href:''}catch{return ''}}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .pages-menu-card h2{margin:0 0 5px}.pages-menu-help{font-size:13px;color:#68756e;line-height:1.45;margin-bottom:12px}
      .pages-menu-grid{display:grid;gap:10px}.pages-menu-row{border:1px solid #e2e8e5;border-radius:15px;padding:12px;background:#fbfcfb}.pages-menu-row strong{display:block;margin-bottom:9px}
      .pages-menu-fields{display:grid;grid-template-columns:110px 1fr 80px;gap:8px}.pages-menu-fields input,.pages-menu-fields select,.pages-page-fields input,.pages-page-fields textarea{width:100%;border:1px solid #cad5cf;border-radius:11px;padding:10px 11px;font:inherit;outline:none;background:#fff}.pages-menu-fields input:focus,.pages-menu-fields select:focus,.pages-page-fields input:focus,.pages-page-fields textarea:focus{border-color:#0b7a53}
      .pages-page-fields{display:grid;gap:8px;margin-top:8px}.pages-page-fields textarea{min-height:110px;resize:vertical}.pages-menu-options{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:9px;font-size:13px;font-weight:700;color:#405048}.pages-menu-options label{display:flex;align-items:center;gap:6px}.pages-menu-preview{font-size:11px;color:#6f7b75;margin-top:7px;overflow-wrap:anywhere}.pages-menu-save{width:100%;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:11px 14px;font-weight:850;margin-top:12px}.pages-menu-save:disabled{opacity:.65}.pages-menu-msg{min-height:18px;margin-top:8px;font-size:13px;color:#0b7a53;font-weight:750}
      @media(max-width:620px){.pages-menu-fields{grid-template-columns:1fr 76px}.pages-menu-type{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }

  function normalizeItem(x={}){
    const type=x.type==='page'?'page':'external';
    return {type,label:clean(x.label,28),icon:clean(x.icon,4)||'🔗',url:safeUrl(x.url),enabled:x.enabled===true,highlight:x.highlight===true,title:clean(x.title,80),slug:slugify(x.slug||x.title||x.label),content:String(x.content||'').trim().slice(0,5000)};
  }

  function ensureCard(){
    if(document.getElementById('pagesMenuCard'))return document.getElementById('pagesMenuCard');
    const panel=document.getElementById('panel');if(!panel)return null;
    const card=document.createElement('div');card.id='pagesMenuCard';card.className='card pages-menu-card';
    card.innerHTML='<h2>📄 Páginas e menu lateral</h2><div class="pages-menu-help">Crie até 5 itens no menu do Chama. Pode ser um link externo, como o ChatShop, ou uma página interna criada por você. O menu faz apenas uma leitura dessa configuração por sessão, sem listener em tempo real.</div><div id="pagesMenuGrid" class="pages-menu-grid"></div><button id="pagesMenuSave" class="pages-menu-save" type="button">Salvar páginas e menu</button><div id="pagesMenuMsg" class="pages-menu-msg"></div>';
    const affiliateCard=document.getElementById('affiliateGrid')?.closest('.card');
    if(affiliateCard)affiliateCard.insertAdjacentElement('afterend',card);else panel.prepend(card);
    card.querySelector('#pagesMenuSave').onclick=save;
    return card;
  }

  function render(items=[]){
    const card=ensureCard();if(!card)return;const grid=card.querySelector('#pagesMenuGrid');grid.innerHTML='';
    const list=Array.isArray(items)?items:[];
    for(let i=0;i<5;i++){
      const item=normalizeItem(list[i]||{}),row=document.createElement('div');row.className='pages-menu-row';row.dataset.index=String(i);
      row.innerHTML=`<strong>Item ${i+1}</strong><div class="pages-menu-fields"><select class="pages-menu-type"><option value="external" ${item.type==='external'?'selected':''}>Link externo</option><option value="page" ${item.type==='page'?'selected':''}>Página interna</option></select><input class="pages-menu-label" maxlength="28" placeholder="Nome no menu" value="${esc(item.label)}"><input class="pages-menu-icon" maxlength="4" placeholder="🔗" value="${esc(item.icon)}"></div><div class="pages-page-fields external-fields"><input class="pages-menu-url" maxlength="900" inputmode="url" placeholder="https://..." value="${esc(item.url)}"></div><div class="pages-page-fields internal-fields"><input class="pages-page-title" maxlength="80" placeholder="Título da página" value="${esc(item.title)}"><input class="pages-page-slug" maxlength="48" placeholder="endereco-da-pagina" value="${esc(item.slug)}"><textarea class="pages-page-content" maxlength="5000" placeholder="Escreva aqui o conteúdo da página...">${esc(item.content)}</textarea></div><div class="pages-menu-options"><label><input class="pages-menu-enabled" type="checkbox" ${item.enabled?'checked':''}> Exibir no menu</label><label><input class="pages-menu-highlight" type="checkbox" ${item.highlight?'checked':''}> Destacar</label></div><div class="pages-menu-preview"></div>`;
      grid.appendChild(row);
      const type=row.querySelector('.pages-menu-type'),title=row.querySelector('.pages-page-title'),slug=row.querySelector('.pages-page-slug');
      const refresh=()=>{
        const isPage=type.value==='page';row.querySelector('.external-fields').hidden=isPage;row.querySelector('.internal-fields').hidden=!isPage;
        const p=row.querySelector('.pages-menu-preview');p.textContent=isPage?(slug.value?`Página: /pagina.html?p=${slugify(slug.value)}`:'A página ganhará um endereço quando você informar o título.'):(row.querySelector('.pages-menu-url').value||'Informe o link externo.');
      };
      type.onchange=refresh;title.addEventListener('blur',()=>{if(!slug.value.trim())slug.value=slugify(title.value);refresh()});slug.addEventListener('input',refresh);row.querySelector('.pages-menu-url').addEventListener('input',refresh);refresh();
    }
  }

  async function load(){
    if(!allowed||!db||!fs)return;
    try{const snap=await fs.getDoc(fs.doc(db,'appConfig','customPagesMenu'));render(snap.exists()?snap.data()?.items||[]:DEFAULT_ITEMS)}catch(e){console.warn('Chama admin: páginas/menu não carregaram',e);render(DEFAULT_ITEMS)}
  }

  async function save(){
    if(!allowed||!me)return alert('Acesso restrito ao administrador.');
    const btn=document.getElementById('pagesMenuSave'),msg=document.getElementById('pagesMenuMsg'),items=[];const slugs=new Set();
    for(const row of document.querySelectorAll('.pages-menu-row')){
      const type=row.querySelector('.pages-menu-type').value==='page'?'page':'external',label=clean(row.querySelector('.pages-menu-label').value,28),icon=clean(row.querySelector('.pages-menu-icon').value,4)||'🔗',enabled=row.querySelector('.pages-menu-enabled').checked,highlight=row.querySelector('.pages-menu-highlight').checked;
      let url='',title='',slug='',content='';
      if(type==='external'){
        const raw=row.querySelector('.pages-menu-url').value.trim();url=safeUrl(raw);if(raw&&!url)return alert('Use apenas links externos seguros começando com https://');
        if(enabled&&(!label||!url))return alert('Para exibir um link, preencha o nome e o endereço.');
      }else{
        title=clean(row.querySelector('.pages-page-title').value,80);slug=slugify(row.querySelector('.pages-page-slug').value||title||label);content=String(row.querySelector('.pages-page-content').value||'').trim().slice(0,5000);
        if(enabled&&(!label||!title||!slug))return alert('Para exibir uma página, preencha o nome do menu e o título da página.');
        if(slug){if(slugs.has(slug))return alert('Existem duas páginas com o mesmo endereço. Troque um dos nomes.');slugs.add(slug)}
      }
      items.push({type,label,icon,url,title,slug,content,enabled:!!enabled,highlight:!!highlight});
    }
    btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
    try{await fs.setDoc(fs.doc(db,'appConfig','customPagesMenu'),{items,updatedAt:fs.serverTimestamp(),updatedBy:me.uid},{merge:true});msg.textContent='Menu e páginas salvos ✓';render(items)}
    catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}
    finally{btn.disabled=false;btn.textContent='Salvar páginas e menu'}
  }

  async function start(){
    addStyle();ensureCard();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');let app=appMod.getApps()[0];for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}if(!app)return;
      const [authMod,firestoreMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);fs=firestoreMod;db=fs.getFirestore(app);const auth=authMod.getAuth(app);
      authMod.onAuthStateChanged(auth,async user=>{me=user||null;allowed=false;if(!user)return;try{const s=await fs.getDoc(fs.doc(db,'users',user.uid));allowed=s.exists()&&s.data().admin===true;if(allowed)load()}catch(e){console.warn(e)}});
    }catch(e){console.warn('Chama admin: módulo de páginas não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();