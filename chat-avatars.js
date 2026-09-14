(()=>{
  const STYLE='chamaUniversalAvatarStyle';
  const loaded=new Set();
  const $=id=>document.getElementById(id);
  function css(){if($(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent='.chama-user-photo{width:44px;height:44px;border-radius:50%;object-fit:cover;display:block}.chama-chat-photo{width:44px;height:44px;border-radius:50%;object-fit:cover;display:block}.chama-photo-wrap{width:44px;height:44px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:#dff4ea;color:#0b7a53;font-weight:800;flex:0 0 44px}';document.head.appendChild(s)}
  async function fs(){const [a,f]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);const app=a.getApps()[0];return{db:f.getFirestore(app),doc:f.doc,getDoc:f.getDoc}}
  function safe(url){const v=String(url||'').trim();if(!v)return '';try{const u=new URL(v,location.origin);return u.origin===location.origin&&u.pathname==='/api/media'&&u.searchParams.get('key')?u.href:''}catch{return ''}}
  async function photo(uid){if(!uid)return '';if(loaded.has(uid))return loaded.get(uid)||'';loaded.add(uid);try{const x=await fs(),s=await x.getDoc(x.doc(x.db,'publicProfiles',uid));const u=s.exists()?safe(s.data()?.photoUrl):'';loaded.add(uid+'::'+u);return u}catch(e){console.warn('avatar',e);return ''}}
  function put(el,url,letter){if(!el)return;const safeUrl=safe(url);el.innerHTML='';if(safeUrl){const img=document.createElement('img');img.className=el.id==='chatAvatar'?'chama-chat-photo':'chama-user-photo';img.alt='Foto de perfil';img.src=safeUrl;img.onerror=()=>{el.textContent=letter||'👤'};el.appendChild(img)}else el.textContent=letter||'👤'}
  async function applyRow(row){const uid=row.dataset.uid;if(!uid)return;const avatar=row.querySelector('.avatar');if(!avatar)return;const url=await photo(uid);put(avatar,url,(row.querySelector('.user-name')?.textContent||'U').slice(0,1).toUpperCase())}
  async function scan(){for(const row of document.querySelectorAll('#usersList .user'))await applyRow(row);const u=window.__chamaActiveUser;if(u){const url=await photo(u.id);put($('chatAvatar'),url,String(u.nome||'U').slice(0,1).toUpperCase())}}
  function install(){css();scan();new MutationObserver(()=>scan()).observe($('usersList')||document.body,{childList:true,subtree:true});setInterval(scan,3000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();