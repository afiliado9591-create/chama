(()=>{
  if(!/\/admin\.html$/i.test(location.pathname))return;
  const CARD_ID='chamaCommunityCountAdminCard';

  function addStyle(){
    if(document.getElementById('chamaCommunityCountAdminStyle'))return;
    const s=document.createElement('style');
    s.id='chamaCommunityCountAdminStyle';
    s.textContent=`
      #${CARD_ID}{background:#fff;border:1px solid #e2e8e5;border-radius:18px;padding:16px;margin-bottom:14px}
      #${CARD_ID} h2{font-size:18px;margin:0 0 5px}
      .chama-count-note{color:#68756e;font-size:13px;line-height:1.45;margin:0 0 12px}
      .chama-count-fields{display:grid;gap:10px}.chama-count-fields label{font-size:13px;font-weight:800;color:#48564f}
      .chama-count-fields input[type="number"]{width:100%;border:1px solid #cad5cf;border-radius:12px;padding:11px 12px;outline:none}
      .chama-count-fields input[type="number"]:focus{border-color:#0b7a53}
      .chama-count-check{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#405048}
      .chama-count-save{width:100%;border:0;background:#0b7a53;color:#fff;border-radius:12px;padding:11px 14px;font-weight:850;margin-top:11px}.chama-count-save:disabled{opacity:.65}
      .chama-count-msg{min-height:18px;margin-top:8px;font-size:13px;color:#0b7a53;font-weight:700}
    `;
    document.head.appendChild(s);
  }

  function ensureCard(){
    const panel=document.getElementById('panel');
    if(!panel||document.getElementById(CARD_ID))return document.getElementById(CARD_ID);
    const card=document.createElement('section');
    card.id=CARD_ID;
    card.innerHTML=`<h2>👥 Contador da comunidade</h2><p class="chama-count-note">Este número é manual. Para não confundir com presença em tempo real, ele aparece para os usuários como <strong>“pessoas no Chama”</strong>. Quando ativarmos o online real, podemos trocar o rótulo.</p><div class="chama-count-fields"><label>Quantidade exibida<input id="chamaCommunityCountInput" type="number" min="0" max="9999999" step="1" inputmode="numeric" placeholder="Ex.: 120"></label><label class="chama-count-check"><input id="chamaCommunityCountEnabled" type="checkbox"> Exibir contador na tela inicial</label></div><button id="chamaCommunityCountSave" class="chama-count-save" type="button">Salvar contador</button><div id="chamaCommunityCountMsg" class="chama-count-msg"></div>`;
    const affiliateCard=document.querySelector('#affiliateGrid')?.closest('.card');
    if(affiliateCard)affiliateCard.insertAdjacentElement('afterend',card);else panel.prepend(card);
    return card;
  }

  async function init(){
    addStyle();
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
      let app=appMod.getApps()[0];
      for(let i=0;!app&&i<25;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
      if(!app)return;
      const [authMod,fs]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      const auth=authMod.getAuth(app),db=fs.getFirestore(app);
      authMod.onAuthStateChanged(auth,async user=>{
        if(!user)return;
        try{
          const own=await fs.getDoc(fs.doc(db,'users',user.uid));
          if(!own.exists()||own.data().admin!==true)return;
          const card=ensureCard();if(!card)return;
          const snap=await fs.getDoc(fs.doc(db,'appConfig','communityCount'));
          const d=snap.exists()?snap.data()||{}:{};
          card.querySelector('#chamaCommunityCountInput').value=String(Math.max(0,Math.floor(Number(d.count||0))));
          card.querySelector('#chamaCommunityCountEnabled').checked=d.enabled===true;
          const btn=card.querySelector('#chamaCommunityCountSave'),msg=card.querySelector('#chamaCommunityCountMsg');
          btn.onclick=async()=>{
            const input=card.querySelector('#chamaCommunityCountInput');
            const count=Math.max(0,Math.min(9999999,Math.floor(Number(input.value||0))));
            const enabled=card.querySelector('#chamaCommunityCountEnabled').checked;
            btn.disabled=true;btn.textContent='Salvando...';msg.textContent='';
            try{
              await fs.setDoc(fs.doc(db,'appConfig','communityCount'),{count,enabled,updatedAt:fs.serverTimestamp(),updatedBy:user.uid},{merge:true});
              input.value=String(count);msg.textContent='Contador salvo ✓';
            }catch(e){console.error(e);msg.textContent='Não foi possível salvar agora.'}
            finally{btn.disabled=false;btn.textContent='Salvar contador'}
          };
        }catch(e){console.warn('Chama: editor do contador não iniciou',e)}
      });
    }catch(e){console.warn('Chama: editor do contador não iniciou',e)}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();