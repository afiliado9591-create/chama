// Chamadas e push de chamadas desativados.
// Arquivo mantido somente para compatibilidade com versões antigas do Chama.
// Não registra token, não grava em `users` e não chama /api/call-push.
window.ChamaCallPush={
  notify:async()=>({ok:false,reason:'chamadas_desativadas'}),
  register:async()=>false
};
