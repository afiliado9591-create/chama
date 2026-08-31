import{getApps,initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyCcAVkmLUKPcEMZ5erDswbOQ8eO493pl2I",authDomain:"chama-cfc28.firebaseapp.com",projectId:"chama-cfc28",storageBucket:"chama-cfc28.firebasestorage.app",messagingSenderId:"680045231088",appId:"1:680045231088:web:8db35684e4b56a320ebb35"};
const app=getApps()[0]||initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const qs=new URLSearchParams(location.search);
const perfil=qs.get('perfil'),catalogo=qs.get('catalogo'),produto=qs.get('produto');
const publicMode=!!(perfil||catalogo||produto);
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
const safeUrl=v=>{try{const u=new URL(String(v||''));return /^https?:$/.test(u.protocol)?u.href:''}catch{return''}};
const messagesUrl=()=>location.origin+location.pathname;

function sanitizeUser(u,uid){return{uid,nome:String(u.nome||u.name||'Usuário').slice(0,80),foto:String(u.foto||'').slice(0,400000),whatsapp:String(u.whatsapp||'').slice(0,25),site:String(u.site||'').slice(0,250),bio:String(u.bio||'').slice(0,500),catalogo:Array.isArray(u.catalogo)?u.catalogo.slice(0,30).map(p=>({plataforma:String(p.plataforma||'').slice(0,30),titulo:String(p.titulo||'').slice(0,180),preco:String(p.preco||'').slice(0,40),link:String(p.link||'').slice(0,1200),imagem:String(p.imagem||'').slice(0,1200)})):[],updatedAt:serverTimestamp()}}

onAuthStateChanged(auth,user=>{
  if(!user||publicMode)return;
  const ref=doc(db,'users',user.uid);
  onSnapshot(ref,s=>{if(!s.exists())return;setDoc(doc(db,'publicProfiles',user.uid),sanitizeUser(s.data(),user.uid),{merge:true}).catch(()=>{})});
});

function shell(){
  document.body.classList.add('public-mode');
  let root=document.getElementById('publicRoot');if(root)return root;
  root=document.createElement('main');root.id='publicRoot';root.innerHTML='<div class="public-card"><div class="public-loading">Carregando...</div></div>';document.body.appendChild(root);
  const st=document.createElement('style');st.textContent=`body.public-mode>#authView,body.public-mode>#appView,body.public-mode>#profileModal,body.public-mode>#catalogModal{display:none!important}#publicRoot{min-height:100dvh;background:#f3f5f4;padding:18px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#14221c}.public-card{max-width:720px;margin:auto;background:#fff;border-radius:22px;padding:18px;box-shadow:0 12px 40px #0001}.public-top{text-align:center}.public-avatar{width:92px;height:92px;border-radius:50%;margin:0 auto 10px;background:#dff4ea;color:#0b7a53;display:grid;place-items:center;font-size:30px;font-weight:800;overflow:hidden}.public-avatar img{width:100%;height:100%;object-fit:cover}.public-name{font-size:24px;font-weight:850}.public-bio{color:#5f6b65;margin:8px auto 14px;max-width:560px}.public-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.public-btn{display:inline-block;text-decoration:none;border:0;border-radius:12px;padding:11px 14px;background:#0b7a53;color:#fff;font-weight:800}.public-btn.messages{background:#14221c}.public-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.public-product{border:1px solid #e6e9e7;border-radius:16px;overflow:hidden}.public-img{aspect-ratio:1/1;background:#f3f5f4;display:grid;place-items:center;color:#6a756f}.public-img img{width:100%;height:100%;object-fit:cover}.public-body{padding:11px}.public-title{font-weight:800}.public-price{font-size:18px;font-weight:850;color:#0b7a53;margin:7px 0}.public-back{display:inline-block;margin-bottom:12px;color:#0b7a53;text-decoration:none;font-weight:800}.public-nav{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px}.public-nav .public-back{margin-bottom:0}.public-loading{text-align:center;padding:40px;color:#6a756f}@media(max-width:560px){.public-grid{grid-template-columns:1fr 1fr}#publicRoot{padding:10px}.public-card{padding:14px}.public-nav{align-items:stretch}.public-nav a{flex:1;text-align:center}}`;document.head.appendChild(st);return root
}
function avatarHtml(p){const img=safeUrl(p.foto);return img?`<img src="${esc(img)}" alt="Foto">`:esc((p.nome||'U').charAt(0).toUpperCase())}
function profileHeader(p){const site=safeUrl(p.site),wa=String(p.whatsapp||'').replace(/\D/g,'');return `<div class="public-top"><div class="public-avatar">${avatarHtml(p)}</div><div class="public-name">${esc(p.nome||'Usuário')}</div>${p.bio?`<div class="public-bio">${esc(p.bio)}</div>`:''}<div class="public-actions">${wa?`<a class="public-btn" href="https://wa.me/${esc(wa.startsWith('55')?wa:'55'+wa)}" target="_blank" rel="noopener">WhatsApp</a>`:''}${site?`<a class="public-btn" href="${esc(site)}" target="_blank" rel="noopener">Site</a>`:''}<a class="public-btn messages" href="${esc(messagesUrl())}">💬 Mensagens</a></div></div>`}
function productCard(p){const img=safeUrl(p.imagem),link=safeUrl(p.link);return `<article class="public-product"><div class="public-img">${img?`<img src="${esc(img)}" alt="${esc(p.titulo||'Produto')}">`:'Sem imagem'}</div><div class="public-body"><div class="public-title">${esc(p.titulo||'Produto')}</div>${p.preco?`<div class="public-price">${esc(p.preco)}</div>`:''}${link?`<a class="public-btn" style="display:block;text-align:center" href="${esc(link)}" target="_blank" rel="noopener sponsored">Ver produto</a>`:''}</div></article>`}
async function renderPublic(){
  if(!publicMode)return;const root=shell();let uid=perfil||catalogo||'';let index=null;if(produto){const pos=produto.lastIndexOf(':');if(pos<1){root.innerHTML='<div class="public-card">Link de produto inválido.</div>';return}uid=produto.slice(0,pos);index=Number(produto.slice(pos+1))}
  try{const s=await getDoc(doc(db,'publicProfiles',uid));if(!s.exists()){root.innerHTML='<div class="public-card"><p>Este perfil ainda não está disponível publicamente.</p><p>Peça ao usuário para abrir o Chama uma vez e tente novamente.</p></div>';return}const p=s.data(),items=Array.isArray(p.catalogo)?p.catalogo:[];
    if(perfil)root.innerHTML=`<div class="public-card">${profileHeader(p)}<div style="text-align:center;margin-top:16px"><a class="public-btn" href="${location.origin+location.pathname}?catalogo=${encodeURIComponent(uid)}">Ver catálogo (${items.length})</a></div></div>`;
    else if(catalogo)root.innerHTML=`<div class="public-card"><div class="public-nav"><a class="public-back" href="${location.origin+location.pathname}?perfil=${encodeURIComponent(uid)}">← Ver perfil</a><a class="public-btn messages" href="${esc(messagesUrl())}">💬 Voltar para mensagens</a></div>${profileHeader(p)}<h2>Catálogo</h2><div class="public-grid">${items.length?items.map(productCard).join(''):'<p>Nenhum produto cadastrado.</p>'}</div></div>`;
    else{const item=items[index];if(!item){root.innerHTML='<div class="public-card">Produto não encontrado.</div>';return}root.innerHTML=`<div class="public-card"><div class="public-nav"><a class="public-back" href="${location.origin+location.pathname}?catalogo=${encodeURIComponent(uid)}">← Ver catálogo</a><a class="public-btn messages" href="${esc(messagesUrl())}">💬 Voltar para mensagens</a></div>${profileHeader(p)}<div class="public-grid" style="grid-template-columns:minmax(0,360px);justify-content:center">${productCard(item)}</div></div>`}
  }catch(e){root.innerHTML='<div class="public-card">Não foi possível abrir este conteúdo agora.</div>'}
}
renderPublic();
