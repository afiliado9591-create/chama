import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const app=getApps().length?getApp():null;if(!app)throw new Error('Firebase não iniciado');const auth=getAuth(app),db=getFirestore(app);const OWNER_UID='0Mhnp79AYQTLwH6vfpAKROSGBtU2';let timer=null,busy=false;
async function adminAllowed(u){if(!u)return false;if(u.uid===OWNER_UID)return true;try{const s=await getDoc(doc(db,'users',u.uid));return s.exists()&&s.data().admin===true}catch{return false}}
async function loadPanel(){try{await import('./admin-panel.js');return true}catch(e){console.warn('Admin panel load:',e);return false}}
function directButton(u){if(!u||document.getElementById('adminBtn'))return;const top=document.querySelector('.topbar');if(!top)return;const b=document.createElement('button');b.id='adminBtn';b.className='admin-btn';b.textContent='🛡️ Admin';b.type='button';b.onclick=async()=>{b.disabled=true;try{await loadPanel();await new Promise(r=>setTimeout(r,120));const m=document.getElementById('adminModal');if(m)m.classList.remove('hidden');else alert('Não consegui abrir o painel Admin agora.')}finally{b.disabled=false}};top.insertBefore(b,document.getElementById('logoutBtn')||null)}
async function ensureAdmin(){if(busy)return;const u=auth.currentUser;if(!u||document.getElementById('adminBtn'))return;busy=true;try{if(!(await adminAllowed(u)))return;await loadPanel();if(!document.getElementById('adminBtn'))directButton(u)}finally{busy=false}}
function start(u){clearInterval(timer);if(!u)return;ensureAdmin();setTimeout(ensureAdmin,300);setTimeout(ensureAdmin,1000);timer=setInterval(()=>{if(!document.getElementById('adminBtn'))ensureAdmin()},5000)}
onAuthStateChanged(auth,start);
new MutationObserver(()=>{const u=auth.currentUser;if(u&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,100)}).observe(document.querySelector('.topbar')||document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('#chamaMobileMenuBtn')&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,20)},true);
