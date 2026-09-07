(()=>{
  const STYLE_ID='chamaLayoutRefreshV3';

  function apply(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* Cabeçalho mais leve: o verde fica como destaque, não como bloco inteiro. */
      html,body{width:100%;max-width:100%;overflow-x:hidden}
      #appView.shell{width:100%!important;max-width:900px!important;overflow-x:hidden!important}
      .topbar{
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
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

      /* Tipografia da tela principal inspirada nas proporções do WhatsApp. */
      .topbar h2{font-size:23px!important;line-height:1.15!important}
      .topbar .chama-community-count{font-size:13px!important;font-variant-numeric:tabular-nums}
      #logoutBtn{font-size:16px!important}
      .chama-home-tools input{font-size:17px!important;line-height:1.3!important;color:#26332d!important}
      #usersList .user-name{font-size:18px!important;line-height:1.22!important;font-weight:750!important;letter-spacing:-.01em!important}
      #usersList .conversation-preview{font-size:15px!important;line-height:1.28!important;color:#66716c!important}
      #usersList .chama-profile-home-message,#usersList .chama-own-description{font-size:14px!important;line-height:1.3!important}
      #usersList .conversation-time,.chama-last-message{font-size:12px!important;font-variant-numeric:tabular-nums}
      #usersList .conversation-unread,.chama-unread-badge{font-size:12px!important;font-variant-numeric:tabular-nums}
      .chama-affiliate-day-kicker{font-size:12px!important}.chama-affiliate-day-name{font-size:18px!important}
      .chama-affiliate-day-title,.chama-affiliate-day-cta{font-size:14px!important}
      .chama-engagement button,.chama-engagement [data-k=views]{font-size:13px!important;font-variant-numeric:tabular-nums}

      @media(max-width:700px){
        #appView.shell{max-width:100%!important;margin:0!important}
        .topbar{height:62px!important;min-height:62px!important;padding-left:16px!important;padding-right:10px!important;gap:8px!important}
        .topbar h2{font-size:23px!important;gap:9px!important}
        .topbar .chama-community-count-wrap{min-width:0!important}
        .topbar .chama-community-count{padding:5px 8px!important}
        .chama-main-menu-btn{width:40px!important;height:40px!important;flex-basis:40px!important}
        #logoutBtn{padding:9px 11px!important;flex:0 0 auto!important}
        .sidebar>.me{margin:10px 12px 6px!important}
      }
    `;
    document.head.appendChild(s);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply,{once:true}):apply();
})();
