(()=>{
  function fixRows(){
    const list=document.getElementById('usersList');
    if(!list)return;
    list.querySelectorAll('.user').forEach(row=>{
      const name=row.querySelector('.user-name');
      const avatar=row.querySelector('.avatar');
      if(name){name.onclick=null;name.classList.remove('profile-link');name.style.textDecoration='none';}
      if(avatar)avatar.onclick=null;
    });
  }
  const start=()=>{
    const list=document.getElementById('usersList');
    if(!list)return setTimeout(start,100);
    fixRows();
    new MutationObserver(fixRows).observe(list,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();