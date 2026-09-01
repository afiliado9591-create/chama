// Recibos de leitura em modo econômico.
// O listener extra de mensagens foi removido para não duplicar as leituras do Firestore.
// A conversa principal já possui seu próprio onSnapshot em index.html.
// Os recibos completos (visto/áudio aberto) serão integrados ao listener principal sem criar nova consulta.
(()=>{
  if(document.getElementById('chamaReceiptStyle'))return;
  const s=document.createElement('style');
  s.id='chamaReceiptStyle';
  s.textContent='.chama-receipt{display:inline-block;margin-left:4px;font-size:10px;font-weight:900;color:#0b7a53}.chama-receipt.seen{color:#1685e6}';
  document.head.appendChild(s);
})();
