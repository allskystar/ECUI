(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        io = core.io,
        ui = core.ui,
        util = core.util;
//{/if}//
    var status = {},
        resources = {};

    function waitToReady(clazz) {
        clazz.constructor = clazz.$Resource;
        delete clazz.$Resource;
        clazz.prototype.cache = clazz.prototype.$Resource.cache;
        clazz.prototype.getMain = clazz.prototype.$Resource.getMain;
        clazz.prototype.init = clazz.prototype.$Resource.init;
        clazz.prototype.initStructure = clazz.prototype.$Resource.initStructure;
        clazz.prototype.isCreated = clazz.prototype.$Resource.isCreated;

        var list = [];
        core.query(function (item) {
            return item.constructor === clazz;
        }).forEach(function (item) {
            var data = ui.iResource.getData(item);
            dom.removeClass(data._eEl, 'ui-resource-loading');
            clazz.constructor.call(item, data._eEl, data._oOptions);
            list.push(item);
            delete data._eEl;
            delete data._oOptions;
        });
        list.forEach(function (item) {
            item.cache();
        });
        list.forEach(function (item) {
            item.init();
        });
        core.init(document.body);
    }
//{if 0}//
    var jsWaits = [];
//{/if}//
    function request(control, url) {
//{if 0}//
        if (!url || url.endsWith('.js')) {
            if (url) {
                jsWaits.push([control, url]);
                if (jsWaits.length > 1) {
                    return;
                }
            } else if (jsWaits.length) {
                control = jsWaits[0][0];
                url = jsWaits[0][1];
            } else {
                return;
            }
            var global = window.globalThis;
            window.globalThis = {};

            io.loadScript(
                url,
                {
                    cache: true,
                    onsuccess: function () {
                        jsWaits.splice(0, 1);
                        resources[url] = control.$loadResource(window.globalThis, url);
                        window.globalThis = global;

                        var list = status[url],
                            total = [];

                        delete status[url];
                        for (var name in status) {
                            if (status.hasOwnProperty(name) && status[name] !== true) {
                                total.push.apply(total, status[name]);
                            }
                        }
                        list.forEach(function (clazz) {
                            if (total.indexOf(clazz) < 0) {
                                // 没有其他的资源在等待
                                waitToReady(clazz);
                            }
                        });
                        status[url] = true;

                        request();
                    },
                    onerror: function () {
                        request();
                    }
                },
                true
            );
        } else {
//{/if}//
            io.ajax(
                url,
                {
                    cache: true,
                    onsuccess: function (text) {
                        resources[url] = control.$loadResource(text, url);

                        var list = status[url],
                            total = [];

                        delete status[url];
                        for (var name in status) {
                            if (status.hasOwnProperty(name) && status[name] !== true) {
                                total.push.apply(total, status[name]);
                            }
                        }
                        list.forEach(function (clazz) {
                            if (total.indexOf(clazz) < 0) {
                                // 没有其他的资源在等待
                                waitToReady(clazz);
                            }
                        });
                        status[url] = true;
                    },
                    onerror: function () {
                        // 出错重试
                        request(control, url);
                    }
                }
            );
//{if 0}//
        }
//{/if}//
    }

    /**
     * 资源加载接口。s如果一开始把所有资源引入，会导致初次加载的成本过大，使用本接口能在控件需要使用时加载资源，只有资源加载成功，控件才会实际开始加载。
     * @interface
     */
    ui.iResource = core.interfaces(
        'Resource',
        {
            constructor: function (el, options) {
                this._eEl = el;
                this._oOptions = options;
            },

            /**
             * 加载资源。
             * @protected
             *
             * @param {string} text 资源的文本
             * @param {string} url 资源的url
             * @return {object} 资源对应的对象，对于css资源非必需，直接加载就可以
             */
            $loadResource: function (text, url) {
                if (url.endsWith('.js')) {
//{if 0}//
                    return text;
//{/if}//                    return new Function('var globalThis={};' + text + ';return globalThis')();
                } else if (url.endsWith('.css')) {
                    dom.createStyleSheet(text);
                } else {
                    console.warn('不能识别的资源: ' + url);
                }
            },

            /**
             * 资源没有加载成功是不会执行缓存方法。
             * @override
             */
            cache: util.blank,

            /**
             * 资源没有加载成功直接返回传入的主元素。
             * @override
             */
            getMain: function () {
                return this._eEl;
            },

            /**
             * 获取通过 $loadResource 生成的资源对象。
             * @protected
             *
             * @param {string|number} url 资源的url 或 资源的序号
             * @return {object} 资源对应的对象，由 $loadResource 生成
             */
            getResource: function (url) {
                if (typeof url === 'number') {
                    url = this.constructor.$ResourceUrls[url];
                }
                return resources[url];
            },

            /**
             * 资源没有加载成功不会进行初始化。
             * @override
             */
            init: util.blank,

            /**
             * 资源没有加载成功不会进行初始化。
             * @override
             */
            initStructure: util.blank,

            /**
             * 资源延迟加载，初始化未完成。
             * @override
             */
            isCreated: function () {
                return false;
            }
        },
        function (clazz) {
            if (ui.iResource.DATA) {
                var urls = ui.iResource.DATA.slice();
                for (var parent = clazz; (parent = parent.SUPER);) {
                    if (parent.$ResourceUrls) {
                        urls.push.apply(urls, parent.$ResourceUrls);
                    }
                }
                clazz.$ResourceUrls = urls;
                delete ui.iResource.DATA;
            }

            clazz.$Resource = clazz.constructor;
            clazz.constructor = function (el, options) {
                var list = clazz.$ResourceUrls.slice();
                for (var i = list.length; i--;) {
                    if (status[list[i]] === true) {
                        list.splice(i, 1);
                    }
                }

                if (list.length) {
                    dom.addClass(el, 'ui-resource-loading');

                    list.forEach(function (url) {
                        if (!status[url]) {
                            status[url] = [clazz];
                            request(this, url);
                        } else if (status[url].indexOf(clazz) < 0) {
                            status[url].push(clazz);
                        }
                    }, this);
                } else {
                    // 第一个实例对象检查中已经加载全部资源
                    clazz.constructor.call(this, el, options);
                    waitToReady(clazz);
                }

                el = options = null;
            };
        }
    );

    /**
     * 定义资源接口的参数，与interceptor方法配对使用。
     */
    ui.iResource.declare = function (urls) {
        ui.iResource.DATA = typeof urls === 'string' ? [urls] : urls.slice();
        return ui.iResource;
    };
})();
