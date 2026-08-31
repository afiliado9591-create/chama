const VAPID_KEY='BPJcD0yybKirpWxcta0t35SRx6CtRo0bFGgu1mowaFM6K21E2NfvtDmulAT7EAWwey23jeDz3kVusFcASevUDng';

export async function onRequestGet(){
  return new Response(JSON.stringify({vapidKey:VAPID_KEY}),{
    status:200,
    headers:{
      'content-type':'application/json;charset=utf-8',
      'cache-control':'no-store'
    }
  });
}
