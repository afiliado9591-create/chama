(()=>{
function place(){
 const top=document.querySelector('.topbar');
 if(!top)return;
 const menu=document.getElementById('chamaMainMenuBtn');
 const logout=document.getElementById('logoutBtn');
 if(!menu||!logout)return;
 menu.textContent='☰';
 menu.title='Abrir menu';
 menu.setAttribute('aria-label','Abrir menu');
 menu.style.order='0';
 top.insertBefore(menu,logout);
 logout.style.display='none';
}
function start(){place();setTimeout(place,300);setTimeout(place,1000);}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
