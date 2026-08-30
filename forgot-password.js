import{getApps,initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,sendPasswordResetEmail}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig={apiKey:"AIzaSyCcAVkmLUKPcEMZ5erDswbOQ8eO493pl2I",authDomain:"chama-cfc28.firebaseapp.com",projectId:"chama-cfc28",storageBucket:"chama-cfc28.firebasestorage.app",messagingSenderId:"680045231088",appId:"1:680045231088:web:8db35684e4b56a320ebb35"};
const app=getApps()[0]||initializeApp(firebaseConfig),auth=getAuth(app);

function addForgot(){
  const loginBtn=document.getElementById('loginBtn');
  const email=document.getElementById('email');
  const msg=document.getElementById('authMsg');
  if(!loginBtn||!email||document.getElementById('forgotPasswordBtn'))return;
  const b=document.createElement('button');
  b.id='forgotPasswordBtn';
  b.type='button';
  b.textContent='Esqueci minha senha';
  b.style.cssText='display:block;width:100%;border:0;background:transparent;color:#0b7a53;font-weight:700;padding:10px 6px 2px;cursor:pointer';
  b.onclick=async()=>{
    const e=email.value.trim();
    if(!e){msg.textContent='Digite seu e-mail acima para recuperar a senha.';email.focus();return}
    const old=b.textContent;
    try{
      b.disabled=true;b.textContent='Enviando...';msg.style.color='#0b7a53';
      await sendPasswordResetEmail(auth,e);
      msg.textContent='E-mail de recuperação enviado. Confira também a caixa de spam.';
    }catch(err){
      msg.style.color='#b42318';
      const c=err?.code||'';
      if(c.includes('invalid-email'))msg.textContent='Digite um e-mail válido.';
      else if(c.includes('too-many-requests'))msg.textContent='Muitas tentativas. Aguarde um pouco e tente novamente.';
      else msg.textContent='Não foi possível enviar agora. Confira o e-mail e tente novamente.';
    }finally{b.disabled=false;b.textContent=old}
  };
  loginBtn.insertAdjacentElement('afterend',b);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addForgot);else addForgot();