import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const app=getApps().length?getApp():null;if(!app)throw new Error('Firebase não iniciado');const auth=getAuth(app),db=getFirestore(app);const OWNER_UID='0Mhnp79AYQTLwH6vfpAKROSGBtU2';let busy=false;
async function adminAllowed(u){if(!u)return false;if(u.uid===OWNER_UID)return true;try{const s=await getDoc(doc(db,'users',u.uid));return s.exists()&&s.data().admin===true}catch{return false}}
function fallback(u){if(!u||document.getElementById('adminBtn'))return;const top=document.querySelector('.topbar');if(!top)return;const b=document.createElement('button');b.id='adminBtn';b.dataset.recovery='1';b.className='admin-btn';b.textContent='🛡️ Admin';b.type='button';b.onclick=()=>openAdmin(u);top.insertBefore(b,document.getElementById('logoutBtn')||null)}
async function reloadPanel(){try{await import(`./admin-panel.js?adminfix=${Date.now()}`);return true}catch(e){console.warn('Admin panel reload:',e);return false}}
async function openAdmin(u){if(!(await adminAllowed(u)))return alert('Sua conta não tem permissão de administrador.');const recovery=document.querySelector('#adminBtn[data-recovery="1"]');if(recovery)recovery.remove();await reloadPanel();await new Promise(r=>setTimeout(r,220));const real=document.querySelector('#adminBtn:not([data-recovery="1"])');if(real){real.click();return}const m=document.getElementById('adminModal');if(m){m.classList.remove('hidden');return}fallback(u);alert('Não consegui abrir o painel Admin agora.')}
async function ensureAdmin(){if(busy)return;const u=auth.currentUser;if(!u||document.getElementById('adminBtn'))return;busy=true;try{if(!(await adminAllowed(u)))return;await reloadPanel();await new Promise(r=>setTimeout(r,150));if(!document.getElementById('adminBtn'))fallback(u)}finally{busy=false}}
onAuthStateChanged(auth,u=>{if(!u)return;setTimeout(ensureAdmin,100);setTimeout(ensureAdmin,700)});
// Só recupera o Admin quando ele realmente some. Não abre/fecha nem reconstrói o menu móvel.
new MutationObserver(()=>{if(auth.currentUser&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,120)}).observe(document.querySelector('.topbar')||document.body,{childList:true,subtree:false});
document.addEventListener('click',e=>{if(e.target.closest('#chamaMobileMenuBtn')&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,20)},true);
