import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const app=getApps().length?getApp():null;if(!app)throw new Error('Firebase não iniciado');const auth=getAuth(app),db=getFirestore(app);
function installStyle(){if(document.getElementById('emailPrivacyStyle'))return;const s=document.createElement('style');s.id='emailPrivacyStyle';s.textContent=`body.chama-hide-emails #usersList .user-email,body.chama-hide-emails #chatEmail,body.chama-hide-emails #profileEmail{display:none!important}body.chama-hide-emails #usersList .user-main{padding:2px 0}`;document.head.appendChild(s)}
async function apply(u){installStyle();document.body.classList.remove('chama-hide-emails','chama-admin-emails');if(!u)return;let admin=false;try{const snap=await getDoc(doc(db,'users',u.uid));admin=snap.exists()&&snap.data().admin===true}catch{}document.body.classList.add(admin?'chama-admin-emails':'chama-hide-emails')}
onAuthStateChanged(auth,apply);installStyle();