import{getApps,initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,collection,query,where,limit,getDocs}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyCcAVkmLUKPcEMZ5erDswbOQ8eO493pl2I",authDomain:"chama-cfc28.firebaseapp.com",projectId:"chama-cfc28",storageBucket:"chama-cfc28.firebasestorage.app",messagingSenderId:"680045231088",appId:"1:680045231088:web:8db35684e4b56a320ebb35"};
const app=getApps()[0]||initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const BASE=location.origin+location.pathname;

async function nativeShare(title,text,url){
  try{
    if(navigator.share){await navigator.share({title,text,url});return}
    if(navigator.clipboard){await navigator.clipboard.writeText(url);alert('Link copiado!');return}
    prompt('Copie este link:',url)
  }catch(e){if(e?.name!=='AbortError')prompt('Copie este link:',url)}
}
function btn(label,fn){const b=document.createElement('button');b.type='button';b.className='secondary share-btn';b.textContent=label;b.onclick=fn;return b}
function visible(id){const el=document.getElementById(id);return !!el&&!el.classList.contains('hidden')}
function text(id){return document.getElementById(id)?.textContent?.trim()||''}
async function uidByEmail(email){
  if(!email)return auth.currentUser?.uid||'';
  if(auth.currentUser?.email===email)return auth.currentUser.uid;
  try{const s=await getDocs(query(collection(db,'users'),where('email','==',email),limit(1)));return s.empty?'':s.docs[0].id}catch{return ''}
}
async function contextUid(){
  let email='';
  if(visible('profileModal'))email=text('profileEmail');
  if(!email)email=text('chatEmail');
  if(!email)email=auth.currentUser?.email||'';
  return uidByEmail(email)
}
function profileName(){return text('profileName')||text('meName')||'usuário'}
function catalogName(){return text('catalogTitle').replace(/^Catálogo\s*(de)?\s*/i,'').trim()||profileName()}
function sendInsideChama(card,uid,i){
  const input=document.getElementById('messageInput'),form=document.getElementById('composer');
  const active=document.getElementById('activeChat');
  if(!input||!form||!active||active.classList.contains('hidden'))return alert('Abra uma conversa no Chama antes de enviar o produto.');
  const title=card.querySelector('.product-title')?.textContent?.trim()||'Produto';
  const price=card.querySelector('.product-price')?.textContent?.trim()||'';
  const link=`${BASE}?produto=${encodeURIComponent(uid+':'+i)}`;
  input.value=`🛍️ ${title}${price?'\n💰 '+price:''}\n${link}`;
  document.getElementById('catalogModal')?.classList.add('hidden');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  if(form.requestSubmit)form.requestSubmit();else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
}

function addProfileShare(){
  const actions=document.getElementById('profileActions');if(!actions||actions.querySelector('[data-share-profile]')||!visible('profileModal'))return;
  const b=btn('🔗 Compartilhar perfil',async()=>{const uid=await contextUid();if(!uid)return alert('Não consegui identificar este perfil.');await nativeShare('Perfil no Chama',`Veja o perfil de ${profileName()} no Chama`,`${BASE}?perfil=${encodeURIComponent(uid)}`)});b.dataset.shareProfile='1';actions.prepend(b)
}
function addCatalogShare(){
  const actions=document.getElementById('catalogOwnerActions');if(!actions||actions.querySelector('[data-share-catalog]')||!visible('catalogModal'))return;
  const b=btn('🔗 Compartilhar catálogo',async()=>{const uid=await contextUid();if(!uid)return alert('Não consegui identificar este catálogo.');await nativeShare('Catálogo no Chama',`Veja o catálogo de ${catalogName()} no Chama`,`${BASE}?catalogo=${encodeURIComponent(uid)}`)});b.dataset.shareCatalog='1';actions.prepend(b)
}
function addProductShares(){
  if(!visible('catalogModal'))return;
  document.querySelectorAll('#catalogGrid .product').forEach((card,i)=>{
    const body=card.querySelector('.product-body')||card;
    if(!card.querySelector('[data-share-product]')){
      const title=card.querySelector('.product-title')?.textContent?.trim()||'Produto';
      const b=btn('↗ Compartilhar produto',async()=>{const uid=await contextUid();if(!uid)return alert('Não consegui identificar este produto.');await nativeShare(title,`Veja este produto no Chama: ${title}`,`${BASE}?produto=${encodeURIComponent(uid+':'+i)}`)});b.dataset.shareProduct='1';body.appendChild(b)
    }
    if(!card.querySelector('[data-send-chama]')){
      const c=btn('💬 Enviar no Chama',async()=>{const uid=await contextUid();if(!uid)return alert('Não consegui identificar este produto.');sendInsideChama(card,uid,i)});c.dataset.sendChama='1';c.classList.add('send-chama-btn');body.appendChild(c)
    }
  })
}
function refresh(){addProfileShare();addCatalogShare();addProductShares()}
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',()=>setTimeout(refresh,50),true);
const style=document.createElement('style');style.textContent='.share-btn{font-size:13px}.product .share-btn{padding:9px 8px;margin-top:8px}.send-chama-btn{background:#e6f5ee!important;color:#0b7a53!important;border-color:#b9dfcc!important}';document.head.appendChild(style);
refresh();
