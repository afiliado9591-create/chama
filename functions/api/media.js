const FIREBASE_API_KEY="AIzaSyCcAVkmLUKPcEMZ5erDswbOQ8eO493pl2I";
const MAX={image:5*1024*1024,audio:10*1024*1024,video:25*1024*1024};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function safeKey(key=""){return typeof key==="string"&&key.length>2&&key.length<500&&!key.includes("..")&&!key.startsWith("/")}
function kindFromType(type=""){if(type.startsWith("image/"))return"image";if(type.startsWith("audio/"))return"audio";if(type.startsWith("video/"))return"video";return""}
function extFromType(type=""){const map={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","audio/webm":"webm","audio/mpeg":"mp3","audio/mp4":"m4a","audio/ogg":"ogg","video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov"};return map[type]||"bin"}
async function verifyFirebase(request){
  const h=request.headers.get("authorization")||"";
  const token=h.startsWith("Bearer ")?h.slice(7).trim():"";
  if(!token)return null;
  try{
    const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken:token})});
    if(!r.ok)return null;
    const d=await r.json();
    const u=d.users?.[0];
    return u?.localId?{uid:u.localId,email:u.email||""}:null;
  }catch{return null}
}

export async function onRequest(context){
  const {request,env}=context;
  if(!env.MEDIA)return json({error:"R2 binding MEDIA não configurado."},500);
  const url=new URL(request.url);

  if(request.method==="GET"||request.method==="HEAD"){
    const key=url.searchParams.get("key")||"";
    if(!safeKey(key))return json({error:"Arquivo inválido."},400);
    const obj=await env.MEDIA.get(key);
    if(!obj)return json({error:"Arquivo não encontrado."},404);
    const headers=new Headers();
    obj.writeHttpMetadata(headers);
    headers.set("etag",obj.httpEtag);
    headers.set("cache-control","public, max-age=31536000, immutable");
    headers.set("x-content-type-options","nosniff");
    return new Response(request.method==="HEAD"?null:obj.body,{headers});
  }

  if(request.method!=="POST")return json({error:"Método não permitido."},405);
  const user=await verifyFirebase(request);
  if(!user)return json({error:"Faça login novamente para enviar mídia."},401);

  const type=(request.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();
  const kind=kindFromType(type);
  if(!kind)return json({error:"Formato não permitido. Envie imagem, áudio ou vídeo."},415);
  const declared=Number(request.headers.get("content-length")||0);
  if(declared&&declared>MAX[kind])return json({error:`Arquivo muito grande. Limite: ${MAX[kind]/1024/1024} MB.`},413);

  const data=await request.arrayBuffer();
  if(!data.byteLength)return json({error:"Arquivo vazio."},400);
  if(data.byteLength>MAX[kind])return json({error:`Arquivo muito grande. Limite: ${MAX[kind]/1024/1024} MB.`},413);

  const ext=extFromType(type);
  const key=`${user.uid}/${kind}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const original=(request.headers.get("x-file-name")||"").slice(0,180);
  await env.MEDIA.put(key,data,{httpMetadata:{contentType:type},customMetadata:{uid:user.uid,kind,original}});
  return json({ok:true,key,kind,url:`/api/media?key=${encodeURIComponent(key)}`});
}
