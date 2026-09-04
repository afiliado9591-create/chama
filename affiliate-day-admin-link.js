(()=>{
  const STYLE_ID='chamaAffiliateDayAdminLinkStyleV1';
  let checked=false,isAdmin=false,checking=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-affday-admin-link{display:flex;align-items:center;justify-content:center;width:100%;margin:0 0 12px;border:1px solid #d8e2ff;background:#eef3ff;color:#244a9a;border-radius:11px;padding:10px 12px;font-size:13px;font-weight:900;text-decoration:none}
    `;document.head.appendChild(s);
  }

  async function checkAdmin(){
    if(checked)return isAdmin;if(checking)return checking;
    checking=(async()=>{
      try{
        const appMod=await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js');
        let app=appMod.getApps()[0];
        for(let i=0;!app&&i<20;i++){await new Promise(r=>setTimeout(r,100));app=appMod.getApps()[0]}
        if(!app)return false;
        const [authMod,fs]=await Promise.all([
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
        ]);
        const user=authMod.getAuth(app).currentUser;if(!user)return false;
        const snap=await fs.getDoc(fs.doc(fs.getFirestore(app),'users',user.uid));
        isAdmin=snap.exists()&&snap.data().admin===true;checked=true;return isAdmin;
      }catch{return false}
    })();
    return checking;
  }

  async function decorateModal(){
    const modal=document.getElementById('chamaAffiliateDayModal');if(!modal||modal.querySelector('.chama-affday-admin-link'))return;
    if(!await checkAdmin())return;
    const body=modal.querySelector('.chama-affday-body');if(!body)return;
    const a=document.createElement('a');a.className='chama-affday-admin-link';a.href='./admin.html#chamaAffiliateDayAdminCard';a.textContent='✏️ Editar catálogo e escolher Afiliado do Dia';
    const status=body.querySelector('.chama-affday-status');if(status)status.insertAdjacentElement('afterend',a);else body.prepend(a);
  }

  function handleAdminAnchor(){
    if(location.pathname.endsWith('/admin.html')&&location.hash==='#chamaAffiliateDayAdminCard'){
      let tries=0;const t=setInterval(()=>{const el=document.getElementById('chamaAffiliateDayAdminCard');if(el){clearInterval(t);el.scrollIntoView({behavior:'smooth',block:'start'});el.style.outline='3px solid #f0d28b';setTimeout(()=>el.style.outline='',2500)}else if(++tries>30)clearInterval(t)},150);
    }
  }

  function start(){
    addStyle();handleAdminAnchor();
    new MutationObserver(()=>decorateModal()).observe(document.body,{childList:true,subtree:true});
    decorateModal();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();