/*
资源加载接口，如果一开始把所有资源引入，会导致初次加载的成本过大，使用本接口能在需要使用时加载资源，只有资源加载成功，控件才会实际开始加载。
*/
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
        if (clazz.prototype.$Resource.$createChild) {
            clazz.prototype.$createChild = clazz.prototype.$Resource.$createChild;
        } else {
            delete clazz.prototype.$createChild;
        }
        clazz.prototype.cache = clazz.prototype.$Resource.cache;
        clazz.prototype.getMain = clazz.prototype.$Resource.getMain;
        clazz.prototype.init = clazz.prototype.$Resource.init;
        clazz.prototype.initStructure = clazz.prototype.$Resource.initStructure;

        var list = core.query(function (item) {
            return item.constructor === clazz;
        });
        list.forEach(function (item) {
            dom.removeClass(item.$ResourceData.el, 'ui-resource-loading');
            clazz.constructor.call(item, item.$ResourceData.el, item.$ResourceData.options);
            delete item.$ResourceData.el;
            delete item.$ResourceData.options;
        });
        list.forEach(function (item) {
            item.cache();
        });
        list.forEach(function (item) {
            item.init();

            if (item.$ResourceData.waits) {
                var waits = item.$ResourceData.waits.map(function (entry) {
                    return core.$create(entry[0], entry[1]);
                });
                waits.forEach(function (entry) {
                    entry.cache();
                });
                waits.forEach(function (entry) {
                    entry.init();
                });
                delete item.$ResourceData.waits;
            }
        });
    }

    function request(control, url) {
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
    }

    ui.Resource = _interface(
        '$Resource',
        {
            /**
             * 阻止建立子控件。
             * @override
             */
            $createChild: function (clazz, options) {
                if (!this.$ResourceData.waits) {
                    this.$ResourceData.waits = [];
                }
                this.$ResourceData.waits.push([clazz, options]);
                return false;
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
                    return new Function('var globalThis={};' + text + ';return globalThis')();
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
                return this.$ResourceData.el;
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
                    url = this.constructor.Urls[url];
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
            initStructure: util.blank
        }
    );

    /**
     * 定义 url，在继承定义的位置使用。
     */
    ui.Resource.declare = function (urls) {
        ui.Resource.DATA = typeof urls === 'string' ? [urls] : urls.slice();
        return ui.Resource;
    };

    /**
     * 接口拦截器，接口可以在拦截器内实现对类的处理。
     */
    ui.Resource.interceptor = function (clazz) {
        if (ui.Resource.DATA) {
            for (var parent = clazz; (parent = parent['super']);) {
                if (parent.Urls) {
                    ui.Resource.DATA.push.apply(ui.Resource.DATA, parent.Urls);
                }
            }
            clazz.Urls = ui.Resource.DATA;
            delete ui.Resource.DATA;
        }

        clazz.$Resource = clazz.constructor;
        clazz.constructor = function (el, options) {
            var list = clazz.Urls.slice();
            for (var i = list.length; i--;) {
                if (status[list[i]] === true) {
                    list.splice(i, 1);
                }
            }

            if (list.length) {
                this.$ResourceData.el = el;
                this.$ResourceData.options = options;

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
    };
})();
