const CACHE = "qz-radar-v2";
const ASSETS = ["index.html", "manifest.json", "icon.svg", "data.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  // 只处理同源 GET 请求
  if (e.request.method !== "GET") return;
  if (u.origin !== self.location.origin) return;
  // 全部网络优先：每次打开都拉取最新的页面与数据；网络失败时再回退缓存（离线可用）
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || Response.error()))
  );
});
