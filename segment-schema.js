/* Chama — modelo de segmentos (Etapa 1)
   Este arquivo somente define o contrato dos segmentos.
   Não altera login, conversas, mensagens, Status, áudio ou vídeo.
   A gravação do segmento será feita somente quando a tela de perfil
   permitir que o usuário escolha uma opção.
*/
(()=>{
  const SEGMENTS=Object.freeze({
    negocio:{id:'negocio',label:'Negócio',icon:'💼'},
    amizade:{id:'amizade',label:'Amizade',icon:'🤝'},
    namoro:{id:'namoro',label:'Namoro',icon:'❤️'},
    religiao:{id:'religiao',label:'Religião',icon:'🙏'}
  });

  function normalizeSegment(value){
    const id=String(value||'').trim().toLocaleLowerCase('pt-BR');
    return Object.prototype.hasOwnProperty.call(SEGMENTS,id)?id:'';
  }

  // API interna para a próxima etapa. Não executa nada sozinha.
  window.chamaSegments=Object.freeze({
    all:SEGMENTS,
    normalize:normalizeSegment
  });
})();
