import{getApps}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const OWNER_UID='0Mhnp79AYQTLwH6vfpAKROSGBtU2';
let retried=false,allowed=false;
function getApp(){return getApps()[0]||null}
async function isAdminUser(u){if(!u)return false;if(u.uid===OWNER_UID)return true;const app=getApp();if(!app)return false;try{const s=await getDoc(doc(getFirestore(app),'users',u.uid));return s.exists()&&s.data().admin===true}catch{return false}}
async function repair(){if(!allowed)return;let b=document.getElementById('adminBtn');if(!b&&!retried){retried=true;try{await import('./admin-panel.js?admin-repair=72')}catch{}await new Promise(r=>setTimeout(r,120));b=document.getElementById('adminBtn')}
if(!b){const top=document.querySelector('.topbar');if(!top)return;b=document.createElement('button');b.id='adminBtn';b.className='admin-btn';b.textContent='🛡️ Admin';b.onclick=async()=>{try{await import('./admin-panel.js?admin-open='+Date.now());setTimeout(()=>{const real=document.getElementById('adminBtn');if(real&&real!==b)real.click();else document.dispatchEvent(new CustomEvent('chama-admin-request'))},120)}catch{alert('Não consegui carregar o painel de administrador.')}};top.insertBefore(b,document.getElementById('logoutBtn'))}
document.getElementById('chamaMobileMenuBtn')?.dispatchEvent(new Event('admin-ready'))}
function start(){const app=getApp();if(!app){setTimeout(start,50);return}const auth=getAuth(app);onAuthStateChanged(auth,async u=>{allowed=await isAdminUser(u);retried=false;if(allowed)repair()})}
start();document.addEventListener('click',e=>{if(allowed&&e.target.closest('#chamaMobileMenuBtn'))repair()},true);setInterval(()=>{if(allowed&&!document.getElementById('adminBtn'))repair()},30000);