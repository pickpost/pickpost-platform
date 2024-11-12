self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        // 从缓存中获取数据
        return response;
      }
        // 从服务器获取数据
      return fetch(event.request).then(response => {
          // 将数据存入缓存
        caches.open('cache-name').then(cache => {
          cache.put(event.request, response.clone());
        });
          // 返回数据
        return response;
      });

    })
  );
});
