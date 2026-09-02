import{getApps,getApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
const BASE='https://alibr.com.br/sso-chama.html';
async function open(next='/'){const app=getApps().length?getApp():null;if(!app){location.href='https://alibr.com.br';return}const auth=getAuth(app),u=auth.currentUser;if(!u){alert('Entre no Chama primeiro.');return}try{const token=await u.getIdToken();const url=new URL(BASE);url.searchParams.set('next',next.startsWith('/')?next:'/');url.hash='token='+encodeURIComponent(token);window.open(url.toString(),'_blank','noopener')}catch(e){console.warn('Chama SSO:',e);alert('Não foi possível conectar sua conta ao ChatShop agora.')}}
window.ChamaSSO={open};
