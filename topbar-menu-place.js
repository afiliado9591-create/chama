(()=>{
function place(){
 const top=document.querySelector('.topbar');
 if(!top)return;
 const logout=document.getElementById('logoutBtn');
 let menu=document.getElementById('chamaMainMenuBtn');
 if(!menu){
  menu=document.createElement('button');
  menu.id='chamaMainMenuBtn';
  menu.type='button';
  menu.className='iconbtn';
  menu.textContent='☰';
  menu.title='Abrir menu';
  menu.setAttribute('aria-label','Abrir menu');
  menu.style.cssText='display:inline-flex!important;align-items:center;justify-content:center;width:44px;height:44px;font-size:22px;font-weight:900;order:0;';
  top.appendChild(menu);
 }
 menu.textContent='☰';
 menu.style.order='0';
 if(logout){
  top.insertBefore(menu,logout);
  logout.style.setProperty('display','none','important');
 }
}
function start(){place();setTimeout(place,300);setTimeout(place,1000);setTimeout(place,2000);}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
