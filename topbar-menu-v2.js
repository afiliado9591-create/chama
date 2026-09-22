(()=>{
  // O menu deste arquivo foi desativado de propósito: ele duplicava, com o
  // mesmo id "chamaMainMenuBtn", o botão de menu que o app-menu.js já cria
  // do lado direito da topbar.
  //
  // Mantemos apenas o carregamento dos scripts de correção/estabilidade que
  // este arquivo também injetava. O "?v=3" no media-fix.js (em vez do "?v=2"
  // antigo) força o navegador a buscar a versão nova do arquivo em vez de
  // usar uma cópia guardada em cache.
  function start(){
    for(const src of [
      './chama-visual-fixes.js?v=6',
      './chama-message-media-runtime-v2.js?v=11',
      './chama-stability-fix.js?v=4',
      './chama-keyboard-fix-v2.js?v=2',
      './media-render-safe.js?v=3',
      './media-render-direct.js?v=1',
      './media-fix.js?v=3'
    ]){
      const s=document.createElement('script');
      s.src=src;
      document.head.appendChild(s);
    }
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
