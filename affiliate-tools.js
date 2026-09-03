(()=>{
  const STYLE_ID='chamaAffiliateToolsStyleV1';
  let generated=null;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .chama-aff-tools-entry{margin:10px 12px 8px;border:1px solid #dfe8e3;border-radius:18px;background:linear-gradient(135deg,#f7fbf9,#eef8f3);padding:13px;display:flex;align-items:center;gap:11px;box-shadow:0 4px 14px #14221c0a}
      .chama-aff-tools-icon{width:42px;height:42px;border-radius:14px;background:#17372b;color:#fff;display:grid;place-items:center;font-size:21px;flex:0 0 42px}
      .chama-aff-tools-copy{flex:1;min-width:0}.chama-aff-tools-copy strong{display:block;font-size:14px;color:#20372d}.chama-aff-tools-copy small{display:block;color:#68756e;font-size:11px;margin-top:2px}
      .chama-aff-tools-open{border:0;background:#0b7a53;color:#fff;border-radius:11px;padding:9px 11px;font-weight:900;cursor:pointer}
      .chama-aff-tools-backdrop{position:fixed;inset:0;background:#0008;z-index:3600;display:grid;place-items:center;padding:14px}
      .chama-aff-tools-modal{width:min(520px,100%);max-height:94dvh;overflow:auto;background:#f6f8f7;border-radius:24px;box-shadow:0 24px 70px #0005}
      .chama-aff-tools-head{position:sticky;top:0;z-index:2;background:#fff;border-bottom:1px solid #e3e9e6;padding:15px 16px;display:flex;align-items:center;gap:10px}
      .chama-aff-tools-head b{flex:1;font-size:18px;color:#183429}.chama-aff-tools-close{border:0;background:#eef4f1;color:#0b7a53;width:40px;height:40px;border-radius:12px;font-size:20px;cursor:pointer}
      .chama-aff-tools-body{padding:14px}.chama-aff-tools-card{background:#fff;border:1px solid #e0e7e3;border-radius:18px;padding:14px;margin-bottom:12px}
      .chama-aff-tools-card h3{margin:0 0 4px;font-size:16px}.chama-aff-tools-muted{font-size:12px;color:#738078;line-height:1.4;margin-bottom:12px}
      .chama-aff-tools-grid{display:grid;gap:9px}.chama-aff-tools-grid label{font-size:12px;font-weight:850;color:#52615a}.chama-aff-tools-grid input,.chama-aff-tools-grid select{width:100%;border:1px solid #cfd8d3;border-radius:12px;padding:11px 12px;font:inherit;outline:none;background:#fff}.chama-aff-tools-grid input:focus,.chama-aff-tools-grid select:focus{border-color:#0b7a53}
      .chama-aff-tools-two{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .chama-aff-tools-generate{width:100%;border:0;background:#17372b;color:#fff;border-radius:13px;padding:12px 14px;font-weight:900;cursor:pointer;margin-top:12px}
      .chama-aff-tools-result[hidden]{display:none!important}.chama-aff-tools-preview{border:1px solid #dfe7e3;border-radius:16px;overflow:hidden;background:#fff}.chama-aff-tools-preview-img{width:100%;height:190px;object-fit:cover;background:#edf1ef;display:block}.chama-aff-tools-preview-body{padding:13px}.chama-aff-tools-preview-store{font-size:10px;font-weight:900;color:#8c5800}.chama-aff-tools-preview-title{font-size:17px;font-weight:900;color:#22362c;margin:4px 0 7px}.chama-aff-tools-price-old{font-size:12px;color:#7a8580;text-decoration:line-through}.chama-aff-tools-price{font-size:25px;font-weight:950;color:#0b7a53}.chama-aff-tools-coupon{display:inline-block;margin-top:7px;background:#fff4dc;color:#8a5600;border-radius:9px;padding:5px 8px;font-size:11px;font-weight:900}
      .chama-aff-tools-text{width:100%;min-height:155px;border:1px solid #cfd8d3;border-radius:12px;padding:11px 12px;font:inherit;resize:vertical;background:#fafcfb;margin-top:10px}
      .chama-aff-tools-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.chama-aff-tools-actions button{border:0;border-radius:11px;padding:10px 9px;font-weight:900;cursor:pointer}.chama-aff-copy{background:#eef7f2;color:#0b7a53}.chama-aff-share{background:#eaf1ff;color:#2350a1}.chama-aff-download{background:#fff3dc;color:#8c5800;grid-column:1/-1}.chama-aff-tools-note{font-size:11px;color:#7a8580;line-height:1.4;margin-top:8px}
      @media(max-width:380px){.chama-aff-tools-two{grid-template-columns:1fr}.chama-aff-tools-actions{grid-template-columns:1fr}.chama-aff-download{grid-column:auto}.chama-aff-tools-entry{margin-left:9px;margin-right:9px}}
    `;document.head.appendChild(s);
  }

  function clean(v,max=500){return String(v||'').trim().replace(/\s+/g,' ').slice(0,max)}
  function safeHttps(v){let x=clean(v,900);if(!x)return '';if(!/^https?:\/\//i.test(x))x='https://'+x;try{const u=new URL(x);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function money(v){const x=clean(v,30);if(!x)return '';return /^r\$/i.test(x)?x:`R$ ${x}`}
  function storeLabel(v){return ({shopee:'Shopee',mercadolivre:'Mercado Livre',shein:'Shein',outra:'Oferta'})[v]||'Oferta'}

  function ensureEntry(){
    if(document.getElementById('chamaAffiliateToolsEntry'))return;
    const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
    const box=document.createElement('section');box.id='chamaAffiliateToolsEntry';box.className='chama-aff-tools-entry';
    box.innerHTML='<div class="chama-aff-tools-icon">🧰</div><div class="chama-aff-tools-copy"><strong>Ferramentas do Afiliado</strong><small>Crie oferta, texto e banner no celular</small></div><button class="chama-aff-tools-open" type="button">Abrir</button>';
    const me=sidebar.querySelector(':scope > .me');if(me)me.insertAdjacentElement('beforebegin',box);else sidebar.insertBefore(box,sidebar.firstChild);
    box.querySelector('button').onclick=openModal;
  }

  function openModal(){
    document.getElementById('chamaAffiliateToolsModal')?.remove();
    const back=document.createElement('div');back.id='chamaAffiliateToolsModal';back.className='chama-aff-tools-backdrop';
    back.innerHTML=`<section class="chama-aff-tools-modal"><header class="chama-aff-tools-head"><b>🧰 Ferramentas do Afiliado</b><button class="chama-aff-tools-close" type="button">✕</button></header><div class="chama-aff-tools-body"><div class="chama-aff-tools-card"><h3>Criador de Oferta</h3><div class="chama-aff-tools-muted">Preencha os dados. Tudo é gerado no seu navegador e não é salvo automaticamente no Firebase.</div><div class="chama-aff-tools-grid"><label>Loja<select id="chamaAffStore"><option value="shopee">Shopee</option><option value="mercadolivre">Mercado Livre</option><option value="shein">Shein</option><option value="outra">Outra</option></select></label><label>Link da imagem<input id="chamaAffImage" inputmode="url" placeholder="https://...imagem.jpg"></label><label>Nome do produto<input id="chamaAffTitle" maxlength="100" placeholder="Ex.: Tênis feminino confortável"></label><div class="chama-aff-tools-two"><label>Preço anterior (opcional)<input id="chamaAffOldPrice" maxlength="30" placeholder="149,90"></label><label>Preço atual<input id="chamaAffPrice" maxlength="30" placeholder="99,90"></label></div><label>Cupom (opcional)<input id="chamaAffCoupon" maxlength="50" placeholder="Ex.: CUPOM10"></label><label>Link de afiliado<input id="chamaAffLink" inputmode="url" placeholder="https://seu-link-de-afiliado..."></label></div><button id="chamaAffGenerate" class="chama-aff-tools-generate" type="button">✨ Gerar oferta</button></div><div id="chamaAffResult" class="chama-aff-tools-card chama-aff-tools-result" hidden><h3>Oferta pronta</h3><div id="chamaAffPreview" class="chama-aff-tools-preview"></div><textarea id="chamaAffText" class="chama-aff-tools-text" readonly></textarea><div class="chama-aff-tools-actions"><button id="chamaAffCopy" class="chama-aff-copy" type="button">📋 Copiar texto</button><button id="chamaAffShare" class="chama-aff-share" type="button">📤 Compartilhar</button><button id="chamaAffDownload" class="chama-aff-download" type="button">⬇️ Baixar banner</button></div><div class="chama-aff-tools-note">Alguns sites bloqueiam o uso da imagem em arquivos baixados. Se isso acontecer, o Chama gera o banner sem a foto, mas mantém produto, preço e loja.</div></div></div></section>`;
    document.body.appendChild(back);
    back.querySelector('.chama-aff-tools-close').onclick=()=>back.remove();back.addEventListener('click',e=>{if(e.target===back)back.remove()});
    back.querySelector('#chamaAffGenerate').onclick=generate;
    back.querySelector('#chamaAffCopy').onclick=copyText;
    back.querySelector('#chamaAffShare').onclick=shareOffer;
    back.querySelector('#chamaAffDownload').onclick=downloadBanner;
  }

  function generate(){
    const store=document.getElementById('chamaAffStore')?.value||'outra';
    const title=clean(document.getElementById('chamaAffTitle')?.value,100);
    const price=money(document.getElementById('chamaAffPrice')?.value);
    const oldPrice=money(document.getElementById('chamaAffOldPrice')?.value);
    const coupon=clean(document.getElementById('chamaAffCoupon')?.value,50);
    const rawImage=clean(document.getElementById('chamaAffImage')?.value,900),imageUrl=safeHttps(rawImage);
    const rawLink=clean(document.getElementById('chamaAffLink')?.value,900),affiliateUrl=safeHttps(rawLink);
    if(!title)return alert('Digite o nome do produto.');if(!price)return alert('Digite o preço atual.');if(!affiliateUrl)return alert('Informe um link de afiliado seguro começando com https://');if(rawImage&&!imageUrl)return alert('O link da imagem precisa começar com https://');
    const label=storeLabel(store);
    const lines=[`🔥 OFERTA ${label.toUpperCase()}`,title];if(oldPrice)lines.push(`De: ${oldPrice}`);lines.push(`Por: ${price}`);if(coupon)lines.push(`🎟️ Cupom: ${coupon}`);lines.push('',`👉 Compre aqui: ${affiliateUrl}`);
    generated={store,label,title,price,oldPrice,coupon,imageUrl,affiliateUrl,text:lines.join('\n')};
    const result=document.getElementById('chamaAffResult'),preview=document.getElementById('chamaAffPreview'),text=document.getElementById('chamaAffText');if(!result||!preview||!text)return;
    preview.innerHTML='';if(imageUrl){const img=document.createElement('img');img.className='chama-aff-tools-preview-img';img.src=imageUrl;img.alt='Imagem do produto';img.loading='lazy';img.onerror=()=>img.remove();preview.appendChild(img)}
    const body=document.createElement('div');body.className='chama-aff-tools-preview-body';body.innerHTML=`<div class="chama-aff-tools-preview-store">🔥 ${label.toUpperCase()}</div><div class="chama-aff-tools-preview-title"></div>${oldPrice?'<div class="chama-aff-tools-price-old"></div>':''}<div class="chama-aff-tools-price"></div>${coupon?'<div class="chama-aff-tools-coupon"></div>':''}`;body.querySelector('.chama-aff-tools-preview-title').textContent=title;if(oldPrice)body.querySelector('.chama-aff-tools-price-old').textContent=oldPrice;body.querySelector('.chama-aff-tools-price').textContent=price;if(coupon)body.querySelector('.chama-aff-tools-coupon').textContent='🎟️ '+coupon;preview.appendChild(body);
    text.value=generated.text;result.hidden=false;result.scrollIntoView({behavior:'smooth',block:'start'});
  }

  async function copyText(){if(!generated)return alert('Gere uma oferta primeiro.');try{await navigator.clipboard.writeText(generated.text);alert('Texto copiado ✓')}catch{const t=document.getElementById('chamaAffText');t?.select();document.execCommand('copy');alert('Texto copiado ✓')}}

  function wrap(ctx,text,x,y,maxWidth,lineHeight,maxLines=4){
    const words=String(text||'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines-1)break}else line=test}if(line&&lines.length<maxLines)lines.push(line);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));return y+lines.length*lineHeight;
  }
  async function loadImage(url){return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=url})}
  async function makeCanvas(){
    if(!generated)throw new Error('Gere uma oferta primeiro.');const c=document.createElement('canvas');c.width=1080;c.height=1080;const ctx=c.getContext('2d');
    ctx.fillStyle='#f6f8f7';ctx.fillRect(0,0,1080,1080);ctx.fillStyle='#17372b';ctx.fillRect(0,0,1080,135);ctx.fillStyle='#fff';ctx.font='900 42px system-ui';ctx.fillText('🔥 OFERTA '+generated.label.toUpperCase(),58,84);
    let imageDrawn=false;if(generated.imageUrl){try{const img=await loadImage(generated.imageUrl);const box={x:58,y:180,w:964,h:430};const r=Math.max(box.w/img.width,box.h/img.height),w=img.width*r,h=img.height*r;ctx.save();ctx.beginPath();ctx.roundRect(box.x,box.y,box.w,box.h,28);ctx.clip();ctx.drawImage(img,box.x+(box.w-w)/2,box.y+(box.h-h)/2,w,h);ctx.restore();imageDrawn=true}catch(_){}}
    if(!imageDrawn){ctx.fillStyle='#e8eeeb';ctx.roundRect(58,180,964,430,28);ctx.fill();ctx.fillStyle='#718079';ctx.font='700 28px system-ui';ctx.textAlign='center';ctx.fillText('Imagem não disponível para exportação',540,405);ctx.textAlign='left'}
    ctx.fillStyle='#20372d';ctx.font='900 44px system-ui';let y=675;y=wrap(ctx,generated.title,58,y,964,54,3)+8;
    if(generated.oldPrice){ctx.fillStyle='#7a8580';ctx.font='500 27px system-ui';ctx.fillText('De '+generated.oldPrice,58,y);y+=45}
    ctx.fillStyle='#0b7a53';ctx.font='950 62px system-ui';ctx.fillText(generated.price,58,y);y+=70;
    if(generated.coupon){ctx.fillStyle='#fff0cb';ctx.roundRect(58,y,Math.min(700,ctx.measureText('Cupom: '+generated.coupon).width+54),58,14);ctx.fill();ctx.fillStyle='#845300';ctx.font='800 25px system-ui';ctx.fillText('🎟 Cupom: '+generated.coupon,82,y+38)}
    ctx.fillStyle='#66736d';ctx.font='700 22px system-ui';ctx.fillText('Chama • Ferramentas do Afiliado',58,1035);return c;
  }
  function canvasBlob(c){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Falha ao gerar imagem')),'image/png',.92))}

  async function downloadBanner(){if(!generated)return alert('Gere uma oferta primeiro.');const btn=document.getElementById('chamaAffDownload');if(btn){btn.disabled=true;btn.textContent='Gerando...'}try{const c=await makeCanvas(),blob=await canvasBlob(c),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='oferta-'+generated.store+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}catch(e){alert(e.message||'Não foi possível gerar o banner.')}finally{if(btn){btn.disabled=false;btn.textContent='⬇️ Baixar banner'}}}

  async function shareOffer(){
    if(!generated)return alert('Gere uma oferta primeiro.');
    if(!navigator.share){await copyText();return}
    try{
      let data={title:generated.title,text:generated.text,url:generated.affiliateUrl};
      try{const c=await makeCanvas(),blob=await canvasBlob(c),file=new File([blob],'oferta.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))data={title:generated.title,text:generated.text,files:[file]}}catch(_){ }
      await navigator.share(data);
    }catch(e){if(e?.name!=='AbortError')alert('Não foi possível compartilhar agora.')}
  }

  function start(){addStyle();ensureEntry();setTimeout(ensureEntry,400);setTimeout(ensureEntry,1200)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();