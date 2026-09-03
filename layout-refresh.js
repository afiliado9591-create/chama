(()=>{
  const STYLE_ID='chamaLayoutRefreshV1';

  function apply(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* Cabeçalho mais leve: o verde fica como destaque, não como bloco inteiro. */
      .topbar{
        background:linear-gradient(180deg,#ffffff 0%,#f7faf8 100%)!important;
        color:#14221c!important;
        border-bottom:1px solid #dfe7e2!important;
        box-shadow:0 3px 14px #14221c0d!important;
      }
      .topbar h2{
        color:#17372b!important;
        font-weight:900!important;
        letter-spacing:-.02em;
        display:flex;align-items:center;gap:11px;
      }
      .topbar h2::before{
        content:"";width:10px;height:10px;border-radius:50%;background:#0b7a53;
        box-shadow:0 0 0 5px #e4f3eb;flex:0 0 10px;
      }
      .topbar .iconbtn,.chama-main-menu-btn{
        background:#eef6f2!important;color:#0b7a53!important;
        border:1px solid #d9e9e1!important;
        box-shadow:none!important;
      }
      .topbar .iconbtn:active,.chama-main-menu-btn:active{background:#e2f0e9!important}
      #logoutBtn{
        background:#fff!important;color:#52605a!important;border:1px solid #d9dfdc!important;
      }
      #installBtn{background:#0b7a53!important;color:#fff!important;border-color:#0b7a53!important}

      /* Cartão do usuário logado, para quebrar os grandes blocos planos. */
      .sidebar>.me{
        margin:12px 12px 7px!important;
        border:1px solid #e1e8e4!important;
        border-radius:18px!important;
        background:linear-gradient(135deg,#ffffff 0%,#f5faf7 100%)!important;
        box-shadow:0 4px 16px #14221c0a!important;
      }
      .sidebar>.section-title{padding-top:13px!important;color:#68756e!important}

      /* Os links de afiliado ficam como botões claros; mantém o verde só no texto/detalhe. */
      .chama-affiliate-menu{
        background:#f6f8f7!important;
        border-bottom:1px solid #e7ece9!important;
        padding:10px 12px!important;
      }
      .chama-affiliate-btn{
        background:#fff!important;color:#0b7a53!important;
        border:1px solid #d8e7df!important;
        box-shadow:0 2px 7px #14221c0a!important;
      }
      .chama-affiliate-btn:active{background:#eef7f2!important}

      /* Busca continua sendo o principal destaque verde da home. */
      .chama-home-tools{background:#fff!important}
      .chama-home-search-btn{box-shadow:0 3px 9px #0b7a5320!important}

      @media(max-width:700px){
        .topbar{padding-left:18px!important;padding-right:14px!important}
        .sidebar>.me{margin:10px 12px 6px!important}
      }
    `;
    document.head.appendChild(s);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply,{once:true}):apply();
})();