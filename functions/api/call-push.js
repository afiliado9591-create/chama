const enc=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const json64=o=>b64u(enc.encode(JSON.stringify(o)));

function pemBytes(pem){
  const clean=String(pem||'').replace(/\\n/g,'\n').replace(/-----BEGIN PRIVATE KEY-----/,'').replace(/-----END PRIVATE KEY-----/,'').replace(/\s+/g,'');
  const bin=atob(clean);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;
}
async function serviceToken(env){
  const now=Math.floor(Date.now()/1000),head=json64({alg:'RS256',typ:'JWT'}),body=json64({iss:env.FIREBASE_CLIENT_EMAIL,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const key=await crypto.subtle.importKey('pkcs8',pemBytes(env.FIREBASE_PRIVATE_KEY),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,enc.encode(head+'.'+body));
  const assertion=head+'.'+body+'.'+b64u(sig);
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
  if(!r.ok)throw new Error('oauth '+r.status+' '+await r.text());
  return (await r.json()).access_token;
}
function field(v){
  if(!v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;if('integerValue'in v)return Number(v.integerValue);if('arrayValue'in v)return (v.arrayValue.values||[]).map(field);return null;
}
async function firestoreGet(project,path,idToken){
  const u=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${path}`;
  const r=await fetch(u,{headers:{authorization:'Bearer '+idToken}});
  if(!r.ok)throw new Error('firestore '+r.status+' '+await r.text());
  return r.json();
}
export async function onRequestPost({request,env}){
  try{
    const auth=request.headers.get('authorization')||'';if(!auth.startsWith('Bearer '))return new Response('unauthorized',{status:401});
    const idToken=auth.slice(7),body=await request.json(),callId=String(body.callId||''),calleeId=String(body.calleeId||'');
    if(!callId||!calleeId)return new Response('bad request',{status:400});
    const project=env.FIREBASE_PROJECT_ID||'chama-cfc28';
    const call=await firestoreGet(project,'calls/'+encodeURIComponent(callId),idToken);
    const callerId=field(call.fields?.callerId),storedCallee=field(call.fields?.calleeId),status=field(call.fields?.status);
    if(!callerId||storedCallee!==calleeId||status!=='ringing')return new Response('forbidden',{status:403});
    const user=await firestoreGet(project,'users/'+encodeURIComponent(calleeId),idToken);
    const tokens=field(user.fields?.pushTokens)||[];
    if(!Array.isArray(tokens)||!tokens.length)return new Response(JSON.stringify({sent:0,reason:'no_tokens'}),{headers:{'content-type':'application/json'}});
    if(!env.FIREBASE_CLIENT_EMAIL||!env.FIREBASE_PRIVATE_KEY)return new Response('push server not configured',{status:503});
    const access=await serviceToken(env),callerName=String(body.callerName||field(call.fields?.callerName)||'Alguém').slice(0,80);
    const origin=new URL(request.url).origin;
    const link=origin+'/?call='+encodeURIComponent(callId);
    let sent=0,errors=[];
    for(const token of [...new Set(tokens)].slice(0,8)){
      const payload={message:{token,data:{type:'chama_call',callId,callerId:String(callerId),callerName},webpush:{headers:{Urgency:'high',TTL:'60'},notification:{title:'📞 Chamada no Chama',body:callerName+' está ligando para você',icon:origin+'/icon.svg',badge:origin+'/icon.svg',tag:'chama-call-'+callId,renotify:true,requireInteraction:true,vibrate:[700,250,700,250,700],data:{type:'chama_call',callId}},fcm_options:{link}}}};
      const r=await fetch(`https://fcm.googleapis.com/v1/projects/${project}/messages:send`,{method:'POST',headers:{authorization:'Bearer '+access,'content-type':'application/json'},body:JSON.stringify(payload)});
      if(r.ok)sent++;else errors.push({status:r.status,body:(await r.text()).slice(0,500)});
    }
    return new Response(JSON.stringify({sent,total:[...new Set(tokens)].slice(0,8).length,errors}),{status:sent?200:502,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
  }catch(e){console.error('call push',e);return new Response('push failed: '+(e?.message||'erro'),{status:500})}
}
