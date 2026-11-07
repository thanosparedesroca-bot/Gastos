const V='gastos-v2';
const LIBS=['https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js'];
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.concat(LIBS).map(u=>c.add(new Request(u,u.indexOf('http')===0?{mode:'cors'}:{}))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url),same=url.origin===location.origin;
  const lib=url.host==='cdn.jsdelivr.net'||url.host==='cdnjs.cloudflare.com'||(url.host==='www.gstatic.com'&&url.pathname.indexOf('/firebasejs/')===0);
  if(!same&&!lib)return; /* Firebase, Google y demás: sin tocar */
  if(same){ /* la app: primero red (recibe actualizaciones), si no hay internet usa lo guardado */
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else{ /* librerías: primero lo guardado */
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res;})));
  }
});
