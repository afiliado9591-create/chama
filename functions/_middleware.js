export async function onRequest(context){
  const response=await context.next();
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  const html=await response.text();
  const tag='<script src="/media-fix.js?v=1" defer></script>';
  if(html.includes('/media-fix.js'))return new Response(html,{status:response.status,headers:response.headers});
  const out=html.replace('</body>',tag+'</body>');
  const headers=new Headers(response.headers);headers.delete('content-length');headers.set('content-type','text/html; charset=utf-8');
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}
