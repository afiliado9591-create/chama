import { getApp, getApps } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

async function enablePersistentLogin(){
  try{
    if(!getApps().length) return;
    const auth=getAuth(getApp());
    await setPersistence(auth,browserLocalPersistence);
    console.log("Chama: sessão persistente ativada.");
  }catch(e){
    console.error("Chama: não foi possível ativar a sessão persistente.",e);
  }
}

enablePersistentLogin();
