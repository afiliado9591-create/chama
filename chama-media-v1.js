(()=>{
const STYLE='chamaMediaV1Style';
function install(){
 if(document.getElementById(STYLE))return;
 const input=document.getElementById('messageInput'), composer=document.getElementById('composer');
 if(!input||!composer)return;
 const s=document.createElement('style');s.id=STYLE;s.textContent='.chama-media-actions{display:flex;gap:6px;align-items:center}.chama-media-btn{border:0;background:#eef4f1;color:#0b7a53;width:42px;height:42px;border-radius:50%;font-size:19px;cursor:pointer}.chama-media-btn:active{transform:scale(.96)}';document.head.appendChild(s);
 const wrap=document.createElement('div');wrap.className='chama-media-actions';
 const photo=document.createElement('button');photo.type='button';photo.className='chama-media-btn';photo.title='Enviar imagem ou vídeo';photo.textContent='🖼️';
 const file=document.createElement('input');file.type='file';file.accept='image/*,video/*';file.style.display='none';
 const send=async f=>{if(!f)return;const isVideo=f.type.startsWith('video/');if(f.size>25*1024*1024){alert('Arquivo muito grande. Escolha uma imagem ou vídeo de até 25 MB.');return}const url=URL.createObjectURL(f);const kind=isVideo?'🎥 Vídeo':'🖼️ Imagem';input.value=kind+' '+f.name;input.dataset.mediaUrl=url;input.dataset.mediaType=f.type;input.dataset.mediaName=f.name;input.focus()};
 photo.onclick=()=>file.click();file.onchange=()=>send(file.files?.[0]);
 wrap.appendChild(photo);composer.insertBefore(wrap,input);
 const form=composer;
 if(form.dataset.mediaHook)return;form.dataset.mediaHook='1';
 form.addEventListener('submit',e=>{const url=input.dataset.mediaUrl;if(!url)return;const type=input.dataset.mediaType||'';const name=input.dataset.mediaName||'';e.preventDefault();const messages=document.getElementById('messages');if(!messages)return;const el=document.createElement('div');el.className='bubble mine';if(type.startsWith('image/')){const img=document.createElement('img');img.src=url;img.alt=name;img.style.cssText='max-width:min(280px,70vw);max-height:360px;border-radius:12px;display:block';el.appendChild(img)}else{const v=document.createElement('video');v.src=url;v.controls=true;v.playsInline=true;v.style.cssText='max-width:min(300px,72vw);max-height:360px;border-radius:12px;display:block';el.appendChild(v)}const t=document.createElement('span');t.className='time';t.textContent='agora';el.appendChild(t);messages.appendChild(el);messages.scrollTop=messages.scrollHeight;input.value='';delete input.dataset.mediaUrl;delete input.dataset.mediaType;delete input.dataset.mediaName;file.value='';});
}
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});install();
})();