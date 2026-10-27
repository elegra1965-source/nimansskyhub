const CACHE='nms-hub-v7.1';
const CORE=['./','./index.html','./manifest.webmanifest','./assets/favicon-32.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.hostname.indexOf('nomanssky.com')>-1)return; // live API -> always network
  if(u.hostname.indexOf('fandom.com')>-1)return; // NMS Wiki (codex.js) -> always network
  if(u.pathname.endsWith('.mp4')||u.pathname.endsWith('.zip'))return; // don't cache videos or the creator pack
  // HTML/JS/CSS: network-first so a fresh deploy shows immediately, cache is only an offline fallback
  e.respondWith(
    fetch(e.request).then(resp=>{
      if(resp&&resp.status===200&&u.origin===location.origin){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
      return resp;
    }).catch(()=> caches.match(e.request).then(r=> r || caches.match('./index.html')))
  );
});

// 2026-10-09: RETIRED_HOST — on the old *.netlify.app address this worker cleans up after itself:
// drops any push sign-up (so alerts don't arrive twice once the app is reinstalled from
// https://nomansskyhub.app), clears its caches, unregisters and sends open windows to the new address.
if (/\.netlify\.app$/.test(self.location.hostname)) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', e => e.waitUntil((async () => {
    try {
      const s = self.registration.pushManager && await self.registration.pushManager.getSubscription();
      if (s) {
        await fetch('/api/push-subscribe', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint: s.endpoint }) }).catch(() => {});
        await s.unsubscribe();
      }
    } catch (err) {}
    try { for (const k of await caches.keys()) await caches.delete(k); } catch (err) {}
    await self.registration.unregister();
    const wins = await self.clients.matchAll({ type: 'window' });
    wins.forEach(c => { const u = new URL(c.url); c.navigate('https://nomansskyhub.app' + u.pathname + u.search).catch(() => {}); });
  })()));
}

// --- Push alerts (2026-10-23): sent by the Weather station's alert server, signed up via nms-push.js ---
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: '◈ No Man\'s Sky Hub', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(data.title || '◈ No Man\'s Sky Hub', {
    body: data.body || '', icon: data.icon || 'assets/icon-192.png', badge: 'badge-96.png', tag: data.tag || 'nms-alert', data: data.url || './'
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const abs = new URL(event.notification.data || './', self.registration.scope);
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.split('#')[0] === abs.href && 'focus' in c) return c.focus(); }
    return clients.openWindow ? clients.openWindow(abs.href) : null;
  }));
});
