export async function onRequestGet({env}){
  const vapidKey=String(env.FCM_VAPID_PUBLIC_KEY||'').trim();
  return new Response(JSON.stringify({vapidKey}),{status:vapidKey?200:503,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
}
