import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const app=getApps().length?getApp():null;if(!app)throw new Error('Firebase não iniciado');const auth=getAuth(app),db=getFirestore(app);let retried=false,timer=null;
async function ensureAdmin(){const u=auth.currentUser;if(!u||document.getElementById('adminBtn'))return;try{const s=await getDoc(doc(db,'users',u.uid));if(!s.exists()||s.data().admin!==true)return;if(!retried){retried=true;await import('./admin-panel.js?recover=69')}}catch(e){console.warn('Admin recovery:',e)}}
onAuthStateChanged(auth,u=>{clearInterval(timer);retried=false;if(!u)return;setTimeout(ensureAdmin,400);setTimeout(ensureAdmin,1400);timer=setInterval(ensureAdmin,5000)});
new MutationObserver(()=>{if(auth.currentUser&&!document.getElementById('adminBtn'))setTimeout(ensureAdmin,150)}).observe(document.querySelector('.topbar')||document.body,{childList:true,subtree:true});