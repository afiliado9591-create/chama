const enc=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const json64=o=>b64u(enc.encode(JSON.stringify(o)));
function pemBytes(pem){const clean=String(pem||'').replace(/\\n/g,'\n').replace(/-----BEGIN PRIVATE KEY-----/,'').replace(/-----END PRIVATE KEY-----/,'').replace(/\s+/g,'');const bin=atob(clean);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
async function serviceToken(env){const now=Math.floor(Date.now()/1000),head=json64({alg:'RS256',typ:'JWT'}),body=json64({iss:env.FIREBASE_CLIENT_EMAIL,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});const key=await crypto.subtle.importKey('pkcs8',pemBytes(env.FIREBASE_PRIVATE_KEY),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,enc.encode(head+'.'+body));const assertion=head+'.'+body+'.'+b64u(sig);const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth-type:jwt-bearer',assertion})});if(!r.ok)throw new Error('oauth '+r.status+' '+await r.text());return(await r.json()).access_token}
function field(v){if(!v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;if('integerValue'in v)return Number(v.integerValue);if('arrayValue'in v)return(v.arrayValue.values||[]).map(field);return null}
async function firestoreGet(project,path,idToken){const u=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${path}`;const r=await fetch(u,{headers:{authorization:'Bearer '+idToken}});if(!r.ok)throw new Error('firestore '+r.status+' '+await r.text());return r.json()}
function mediaLabel(text){const s=String(text||'');if(!s.startsWith('__CHAMA_MEDIA__'))return s;try{const m=JSON.parse(s.slice('__CHAMA_MEDIA__'.length));return m.kind==='image'?'📷 Imagem':m.kind==='audio'?'🎤 Áudio':m.kind==='video'?'🎥 Vídeo':'📎 Mídia'}catch{return '📎 Mídia'}}
export async function onRequestPost({request,env}){
 try{
  const auth=request.headers.get('authorization')||'';if(!auth.startsWith('Bearer '))return new Response('unauthorized',{status:401});
  const idToken=auth.slice(7),body=await request.json(),chatId=String(body.chatId||''),messageId=String(body.messageId||'');if(!chatId||!messageId)return new Response('bad request',{status:400});
  const project=env.FIREBASE_PROJECT_ID||'chama-cfc28';
  const msg=await firestoreGet(project,'chats/'+encodeURIComponent(chatId)+'/messages/'+encodeURIComponent(messageId),idToken);
  const senderId=field(msg.fields?.senderId),receiverId=field(msg.fields?.receiverId);if(!senderId||!receiverId)return new Response('invalid message',{status:400});
  const [receiver,sender]=await Promise.all([firestoreGet(project,'users/'+encodeURIComponent(receiverId),idToken),firestoreGet(project,'users/'+encodeURIComponent(senderId),idToken)]);
  const primary=field(receiver.fields?.pushToken),list=field(receiver.fields?.pushTokens)||[];const tokens=[...new Set([primary,...(Array.isArray(list)?list:[])].filter(Boolean))].slice(0,12);
  if(!tokens.length)return new Response(JSON.stringify({sent:0,reason:'no_tokens'}),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(!env.FIREBASE_CLIENT_EMAIL||!env.FIREBASE_PRIVATE_KEY)return new Response(JSON.stringify({sent:0,reason:'server_not_configured'}),{status:503,headers:{'content-type':'application/json'}});
  const access=await serviceToken(env),senderName=String(field(sender.fields?.nome)||'Nova mensagem').slice(0,80),origin=new URL(request.url).origin,link=origin+'/?chat='+encodeURIComponent(chatId);let text=mediaLabel(field(msg.fields?.text)||'Nova mensagem');if(text.length>120)text=text.slice(0,117)+'...';let sent=0,errors=[];
  for(const token of tokens){
   const payload={message:{token,data:{type:'chama_message',chatId,messageId,senderId:String(senderId),senderName,text},webpush:{headers:{Urgency:'high',TTL:'300'},notification:{title:senderName,body:text,icon:origin+'/icon.svg',badge:origin+'/icon.svg',tag:'chama-msg-'+chatId,renotify:true,requireInteraction:false,vibrate:[250,120,250],data:{type:'chama_message',chatId}},fcm_options:{link}}}};
   const r=await fetch(`https://fcm.googleapis.com/v1/projects/${project}/messages:send`,{method:'POST',headers:{authorization:'Bearer '+access,'content-type':'application/json'},body:JSON.stringify(payload)});if(r.ok)sent++;else errors.push({status:r.status,body:(await r.text()).slice(0,300)});
  }
  return new Response(JSON.stringify({sent,total:tokens.length,errors}),{status:sent?200:502,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
 }catch(e){console.error('message push',e);return new Response(JSON.stringify({sent:0,reason:e?.message||'erro'}),{status:500,headers:{'content-type':'application/json'}})}
}
