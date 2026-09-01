import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const app=getApps().length?getApp():null;if(!app)throw new Error('Firebase não iniciado');const auth=getAuth(app),db=getFirestore(app);const OWNER_UID='0Mhnp79AYQTLwH6vfpAKROSGBtU2';let tries=0,timer=null;
async function adminAllowed(u){if(!u)return false;if(u.uid===OWNER_UID)return true;try{const s=await getDoc(doc(db,'users',u.uid));return s.exists()&&s.data().admin===true}catch{return false}}
async function ensureAdmin(){const u=auth.currentUser;if(!u||document.getElementById('adminBtn'))return;if(!(await adminAllowed(u)))return;tries++;try{await import(`./admin-panel.js?recover=70-${tries}`)}catch(e){console.warn('Admin recovery import:',e)}setTimeout(()=>{if(!document.getElementById('adminBtn')&&tries<8)ensureAdmin()},500)}
onAuthStateChanged(auth,u=>{clearInterval(timer);tries=0;if(!u)return;setTimeout(ensureAdmin,250);setTimeout(ensureAdmin,900);setTimeout(ensureAdmin,1800);timer=setInterval(ensureAdmin,4000)});
new MutationObserver(()=>{if(auth.currentUser&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,120)}).observe(document.querySelector('.topbar')||document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('#chamaMobileMenuBtn')&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,30)},true);