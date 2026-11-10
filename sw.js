// Service worker: makes the site installable (PWA), shows push notifications, always prefers the newest site files.
importScripts('config.js');
const FB=self.SQ_FB;
if(FB&&FB.apiKey){importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');firebase.initializeApp(FB);firebase.messaging();}  // notifications (with text + image) are shown automatically
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open('sq1').then(ch=>ch.put(r,c));return res}).catch(()=>caches.match(r).then(x=>x||caches.match('/index.html'))))});   // network first, cache only when offline
