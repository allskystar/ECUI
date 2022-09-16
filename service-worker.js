(function () {
    var CACHE_NAME = location.host;

    this.addEventListener('fetch', function (event) {
        var cloneRequest = event.request.clone();

        event.respondWith(
            this.caches.match(event.request).then(function (localResponse) {
                if (event.request.url.endsWith('/index.html')) {
                    // 如果是基本链接，优先请求网络检查是否有更新
                    return this.fetch(cloneRequest).then(
                        function (netResponse) {
                            var cloneResponse = netResponse.clone();
                            if (!netResponse || netResponse.status !== 200) {
                                // 网络错误，返回本地缓存
                                return localResponse;
                            }

                            // 使用网络的文件代替本地文件
                            this.caches.open(CACHE_NAME).then(function (cache) {
                                cache.put(event.request, cloneResponse);
                            });

                            return netResponse;
                        }
                    ).catch(
                        function () {
                            // 网络错误，返回本地缓存
                            return localResponse;
                        }
                    );
                }

                if (localResponse) {
                    // 检查本地是否有缓存
                    return localResponse;
                }

                return this.fetch(cloneRequest).then(
                    function (netResponse) {
                        var cloneResponse = netResponse.clone();
                        if (!netResponse || netResponse.status !== 200 || netResponse.headers.get('Content-type').match(/image/) || netResponse.url.lastIndexOf('/') > netResponse.url.lastIndexOf('.')) {
                            // 如果网络错误或者是图片资源或者是动态请求，不进行缓存
                            return netResponse;
                        }

                        this.caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(event.request, cloneResponse);
                        });

                        return netResponse;
                    }
                );
            })
        );
    });
}());
