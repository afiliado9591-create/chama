import{getApps,initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const cfg={apiKey:"AIzaSyCcAVkmLUKPcEMZ5erDswbOQ8eO493pl2I",authDomain:"chama-cfc28.firebaseapp.com",projectId:"chama-cfc28",storageBucket:"chama-cfc28.firebasestorage.app",messagingSenderId:"680045231088",appId:"1:680045231088:web:8db35684e4b56a320ebb35"};
const app=getApps()[0]||initializeApp(cfg),auth=getAuth(app),db=getFirestore(app);
const OWNER_UID='0Mhnp79AYQTLwH6vfpAKROSGBtU2';
let retried=false;
async function isAdminUser(u){if(!u)return false;if(u.uid===OWNER_UID)return true;try{const s=await getDoc(doc(db,'users',u.uid));return s.exists()&&s.data().admin===true}catch{return false}}
async function repair(){const u=auth.currentUser;if(!(await isAdminUser(u)))return;let b=document.getElementById('adminBtn');if(!b&&!retried){retried=true;try{await import('./admin-panel.js?admin-repair=70')}catch{}await new Promise(r=>setTimeout(r,350));b=document.getElementById('adminBtn')}
if(!b){const top=document.querySelector('.topbar');if(!top)return;b=document.createElement('button');b.id='adminBtn';b.className='admin-btn';b.textContent='🛡️ Admin';b.onclick=async()=>{try{await import('./admin-panel.js?admin-open='+Date.now());setTimeout(()=>{const real=document.getElementById('adminBtn');if(real&&real!==b)real.click();else document.dispatchEvent(new CustomEvent('chama-admin-request'))},350)}catch{alert('Não consegui carregar o painel de administrador.')}};top.insertBefore(b,document.getElementById('logoutBtn'))}
setTimeout(()=>document.getElementById('chamaMobileMenuBtn')?.dispatchEvent(new Event('admin-ready')),50)}
onAuthStateChanged(auth,()=>{setTimeout(repair,250);setTimeout(repair,1200)});document.addEventListener('click',e=>{if(e.target.closest('#chamaMobileMenuBtn'))setTimeout(repair,30)},true);setInterval(()=>{if(auth.currentUser&&!document.getElementById('adminBtn'))repair()},5000);