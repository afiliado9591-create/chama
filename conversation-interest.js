(()=>{
  const STYLE_ID='chamaConversationInterestStyleV1';
  const VALID=['religiao','namoro','amizade','negocios'];
  const LABELS={religiao:'Religião',namoro:'Namoro (18+)',amizade:'Amizade',negocios:'Negócios'};
  const ICONS={religiao:'🙏',namoro:'❤️',amizade:'🤝',negocios:'💼'};
  let me=null,db=null,fs=null,current='',profileObserver=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      .chama-interest-overlay{position:fixed;inset:0;z-index:2147483638;background:rgba(8,31,22,.64);display:grid;place-items:center;padding:18px}
      .chama-interest-card{width:min(440px,100%);max-height:calc(100dvh - 36px);overflow:auto;background:#fff;border-radius:25px;box-shadow:0 24px 70px rgba(0,0,0,.28);padding:24px}
      .chama-interest-card h2{margin:0;color:#123c2d;font-size:24px}.chama-interest-card p{color:#63716b;line-height:1.45;margin:8px 0 18px}
      .chama-interest-options{display:grid;grid-template-columns:1fr 1fr;gap:10px}.chama-interest-option{border:1px solid #d8e7df;background:#f7fbf9;border-radius:17px;padding:17px 10px;color:#193d30;font:800 16px inherit;cursor:pointer}.chama-interest-option span{display:block;font-size:26px;margin-bottom:6px}.chama-interest-option[aria-pressed="true"]{border:2px solid #0b865d;background:#e8f7f0;color:#08734f}
      .chama-interest-actions{display:flex;gap:10px;margin-top:18px}.chama-interest-save,.chama-interest-cancel{flex:1;border:0;border-radius:14px;padding:13px;font:800 15px inherit;cursor:pointer}.chama-interest-save{background:#0b865d;color:#fff}.chama-interest-save:disabled{opacity:.55}.chama-interest-cancel{background:#edf3f0;color:#365248}.chama-interest-error{color:#a13b32;font-size:13px;margin-top:10px}
      .chama-interest-profile{margin-top:14px;border:1px solid #dbece3;background:#f6fbf8;border-radius:16px;padding:14px;display:flex;align-items:center;gap:10px}.chama-interest-profile-main{min-width:0;flex:1}.chama-interest-profile small{display:block;color:#65736c;font-weight:700}.chama-interest-profile strong{display:block;color:#16372a;margin-top:3px}.chama-interest-change{border:1px solid #b9ddcc;background:#e7f6ef;color:#08734f;border-radius:999px;padding:9px 12px;font-weight:800;cursor:pointer}
      @media(max-width:370px){.chama-interest-options{grid-template-columns:1fr}.chama-interest-card{padding:19px}}
    `;document.head.appendChild(style);
  }

  function label(value){return LABELS[value]||'Escolher'}

  function closeChooser(){document.getElementById('chamaInterestOverlay')?.remove()}

  function openChooser(required=false){
    if(!me)return;
    closeChooser();
    let selected=VALID.includes(current)?current:'';
    const overlay=document.createElement('div');overlay.id='chamaInterestOverlay';overlay.className='chama-interest-overlay';
    const card=document.createElement('section');card.className='chama-interest-card';card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','chamaInterestTitle');
    card.innerHTML=`<h2 id="chamaInterestTitle">Com quem você quer conversar?</h2><p>Escolha o público que mais combina com você. Isso ajuda o Chama a mostrar pessoas com o mesmo interesse primeiro.</p><div class="chama-interest-options">${VALID.map(v=>`<button type="button" class="chama-interest-option" data-interest="${v}" aria-pressed="${selected===v}"><span>${ICONS[v]}</span>${LABELS[v]}</button>`).join('')}</div><div class="chama-interest-actions">${required?'':'<button type="button" class="chama-interest-cancel">Cancelar</button>'}<button type="button" class="chama-interest-save" ${selected?'':'disabled'}>Salvar escolha</button></div><div class="chama-interest-error" hidden></div>`;
    overlay.appendChild(card);document.body.appendChild(overlay);
    const save=card.querySelector('.chama-interest-save'),error=card.querySelector('.chama-interest-error');
    card.querySelectorAll('.chama-interest-option').forEach(btn=>btn.onclick=()=>{selected=btn.dataset.interest;card.querySelectorAll('.chama-interest-option').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));save.disabled=false});
    card.querySelector('.chama-interest-cancel')?.addEventListener('click',closeChooser);
    if(!required)overlay.addEventListener('click',e=>{if(e.target===overlay)closeChooser()});
    save.onclick=async()=>{
      if(!VALID.includes(selected))return;
      if(selected==='namoro'&&!confirm('A opção Namoro é exclusiva para maiores de 18 anos. Você confirma que tem 18 anos ou mais?'))return;
      save.disabled=true;save.textContent='Salvando...';error.hidden=true;
      try{
        const now=fs.serverTimestamp(),userData={conversationInterest:selected,conversationInterestUpdatedAt:now};
        if(selected==='namoro')userData.datingAdultConfirmedAt=now;
        await Promise.all([
          fs.setDoc(fs.doc(db,'users',me.uid),userData,{merge:true}),
          fs.setDoc(fs.doc(db,'publicProfiles',me.uid),{conversationInterest:selected,conversationInterestUpdatedAt:now},{merge:true})
        ]);
        current=selected;updateProfileControl();closeChooser();
        document.dispatchEvent(new CustomEvent('chama-conversation-interest',{detail:{value:selected,label:label(selected)}}));
      }catch(e){console.error('Chama: não foi possível salvar o interesse',e);error.textContent='Não foi possível salvar agora. Confira sua conexão e tente novamente.';error.hidden=false;save.disabled=false;save.textContent='Salvar escolha'}
    };
    setTimeout(()=>card.querySelector(`[data-interest="${selected}"]`)?.focus()||card.querySelector('.chama-interest-option')?.focus(),30);
  }

  function updateProfileControl(){
    const body=document.querySelector('#chamaProfileModal .chama-profile-body');
    if(!body||!body.querySelector('#chamaProfileSave'))return;
    let box=body.querySelector('#chamaInterestProfile');
    if(!box){
      box=document.createElement('div');box.id='chamaInterestProfile';box.className='chama-interest-profile';
      const location=body.querySelector('.chama-profile-location');(location||body.firstElementChild)?.insertAdjacentElement(location?'afterend':'beforebegin',box);
    }
    box.innerHTML=`<div class="chama-interest-profile-main"><small>Público que quero conversar</small><strong>${ICONS[current]||'💬'} ${label(current)}</strong></div><button type="button" class="chama-interest-change">Alterar</button>`;
    box.querySelector('.chama-interest-change').onclick=()=>openChooser(false);
  }

  async function loadInterest(){
    if(!me||!db||!fs)return;
    try{
      const snap=await fs.getDoc(fs.doc(db,'users',me.uid)),value=String(snap.data()?.conversationInterest||'');current=VALID.includes(value)?value:'';
      updateProfileControl();
      if(!current)setTimeout(()=>openChooser(true),250);
      else document.dispatchEvent(new CustomEvent('chama-conversation-interest',{detail:{value:current,label:label(current)}}));
    }catch(e){console.warn('Chama: preferência de conversa não carregou',e)}
  }

  async function start(attempt=0){
    addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),app=appMod.getApps()[0];
      if(!app){if(attempt<30)setTimeout(()=>start(attempt+1),150);return}
      const authMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js');fs=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');db=fs.getFirestore(app);
      authMod.onAuthStateChanged(authMod.getAuth(app),user=>{me=user||null;current='';closeChooser();if(me)loadInterest()});
      if(!profileObserver){profileObserver=new MutationObserver(updateProfileControl);profileObserver.observe(document.body,{childList:true,subtree:true})}
    }catch(e){console.error('Chama: escolha de público não iniciou',e)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>start(),{once:true}):start();
})();
