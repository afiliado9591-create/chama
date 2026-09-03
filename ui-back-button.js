(()=>{
  if(document.getElementById('chamaBackButtonStyle'))return;
  const s=document.createElement('style');
  s.id='chamaBackButtonStyle';
  s.textContent=`
    #backBtn{
      width:46px!important;
      height:46px!important;
      min-width:46px!important;
      padding:0!important;
      border-radius:14px!important;
      border:2px solid #075c3f!important;
      background:#0b7a53!important;
      color:#fff!important;
      font-size:28px!important;
      font-weight:900!important;
      line-height:1!important;
      display:grid!important;
      place-items:center!important;
      box-shadow:0 3px 8px #0b7a5338!important;
      cursor:pointer!important;
    }
    #backBtn:active{transform:scale(.96);background:#075c3f!important}
  `;
  document.head.appendChild(s);
  const btn=document.getElementById('backBtn');
  if(btn){
    btn.title='Voltar';
    btn.setAttribute('aria-label','Voltar para conversas');
  }
})();