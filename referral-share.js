(()=>{
  const STYLE='chamaReferralShareStyleV1';
  const BOX='chamaReferralBox';
  const URL='https://chama.alibr.com.br/';
  const TEXT='Vem conversar comigo no Chama! É um app brasileiro para encontrar pessoas e conversar. Entre aqui: '+URL;
  function start(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');s.id=STYLE;s.textContent=`
      #${BOX}{margin:8px 0 0;padding:14px 16px 16px;background:#fff;border-top:1px solid #e6e9e7;border-bottom:1px solid #e6e9e7}
      .chama-referral-title{font-size:14px;font-weight:850;color:#14221c;margin-bottom:4px}
      .chama-referral-sub{font-size:12px;color:#6a756f;margin-bottom:10px}
      .chama-referral-btn{width:100%;border:0;border-radius:12px;padding:11px 14px;background:#0b7a53;color:#fff;font-weight:850;cursor:pointer}
      .chama-referral-menu{display:none;gap:8px;margin-top:8px}.chama-referral-menu.open{display:grid}
      .chama-referral-option{border:1px solid #dfe8e3;background:#fff;color:#14221c;border-radius:10px;padding:10px;font-weight:750;text-align:left;cursor:pointer}
      .chama-referral-option:hover{background:#f6faf8}
    `;document.head.appendChild(s);
    render();
    new MutationObserver(()=>render()).observe(document.body,{childList:true,subtree:true});
  }
  function render(){
    const sidebar=document.querySelector('.sidebar');const users=document.getElementById('usersList');
    if(!sidebar||!users||document.getElementById(BOX))return;
    const box=document.createElement('div');box.id=BOX;
    box.innerHTML='<div class="chama-referral-title">Indique seu parente ou amigo</div><div class="chama-referral-sub">Compartilhe o Chama com quem você conhece.</div><button type="button" class="chama-referral-btn">➤ Indique</button><div class="chama-referral-menu"><button type="button" class="chama-referral-option" data-share="whatsapp">💬 Compartilhar no WhatsApp</button><button type="button" class="chama-referral-option" data-share="facebook">📘 Compartilhar no Facebook</button><button type="button" class="chama-referral-option" data-share="native">📤 Outras formas de compartilhar</button></div>';
    const button=box.querySelector('.chama-referral-btn'),menu=box.querySelector('.chama-referral-menu');
    button.onclick=()=>menu.classList.toggle('open');
    box.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>share(b.dataset.share));
    users.parentNode.insertBefore(box,users.nextSibling);
  }
  async function share(type){
    const encoded=encodeURIComponent(URL),text=encodeURIComponent(TEXT);
    if(type==='whatsapp'){window.open('https://wa.me/?text='+text,'_blank','noopener,noreferrer');return}
    if(type==='facebook'){window.open('https://www.facebook.com/sharer/sharer.php?u='+encoded,'_blank','noopener,noreferrer');return}
    if(navigator.share){try{await navigator.share({title:'Chama',text:TEXT,url:URL})}catch(_){}return}
    try{await navigator.clipboard.writeText(URL);alert('Link do Chama copiado. Agora é só enviar para seu parente ou amigo.')}catch(_){alert(URL)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();