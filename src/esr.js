/*
ECUI的路由处理扩展，支持按模块的动态加载，不同的模块由不同的模板引擎处理，因此不同模块可以有同名的模板，可以将模块理解成一个命名空间。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        io = core.io,
        ui = core.ui,
        util = core.util,

        JAVASCRIPT = 'javascript',

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var historyCache,
        historyIndex = 0,
        historyData = [],
        cacheList = [],
        options,
        routes = {},
        autoRender = {},
        context = {},
        currLocation = '',
        checkLeave = true,
        pauseStatus,
        loadStatus = {},
        engine = etpl,
        requestVersion = 0,
        localStorage,
        metaVersion,
        meta;

    /**
     * 增加IE的history信息。
     * @private
     *
     * @param {string} loc 当前地址
     * @return 如果增加了history信息返回true，否则不返回
     */
    function addIEHistory(loc) {
        if (ieVersion < 8) {
            var iframeDoc = document.getElementById('ECUI_LOCATOR').contentWindow.document;
            iframeDoc.open('text/html');
            iframeDoc.write(
                '<html><body><script type="text/javascript">' +
                    'var loc="' + loc.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"') + '";' +
                    'parent.ecui.esr.setLocation(loc);' +
                    'parent.ecui.esr.callRoute(loc);' +
                    '</script></body></html>'
            );
            iframeDoc.close();
            return true;
        }
    }

    /**
     * 渲染结束事件的处理。
     * @private
     *
     * @param {Object} route 路由对象
     */
    function afterrender(route) {
        if (route.onafterrender) {
            route.onafterrender(context);
        }

        if (historyCache) {
            // 除了这里有刷新，在控件初始化时也可以刷新回填
            var data = historyData[historyIndex] = historyData[historyIndex] || {};
            cacheList.forEach(function (item) {
                if (item.target.getMain()) {
                    var values = data[item.name];
                    if (values) {
                        item.values.forEach(function (value) {
                            if (values.hasOwnProperty(value)) {
                                item.target['set' + value](values[value]);
                            }
                        });
                    }
                }
            });
        }
    }

    /**
     * 自动加载子路由。
     * @private
     *
     * @param {Object} route 路由对象
     */
    function autoChildRoute(route) {
        if (route.children) {
            var children = 'string' === typeof route.children ? [route.children] : route.children;
            children.forEach(function (item) {
                esr.callRoute(replace(item), true);
            });
        }
    }

    /**
     * 调用指定的路由。
     * @private
     *
     * @param {string} name 路由名称
     * @param {Object} options 参数
     */
    function callRoute(name, options) {

        function checkURLChange() {
            var loc = esr.getLocation();
            if (currLocation !== loc) {
                currLocation = loc;
                pauseStatus = false;
                item();
            }
        }

        // 供onready时使用，此时name为route
        var route = options ? routes[name] : name;

        if (route) {
            if (!route.onrender || route.onrender() !== false) {
                if (checkLeave) {
                    // 检查是否允许切换到新路由
                    for (var i = 0, items = getRouteMains(route), item; item = items[i++]; ) {
                        if (item.route.onleave && item.route.onleave() === false) {
                            if (options !== true) {
                                // 如果不是子路由，需要回退一步，回滚currLocation的设置防止再次跳转
                                history.go(-1);
                                pauseStatus = true;
                                item = util.timer(checkURLChange, -100);
                                return;
                            }
                        }
                    }
                } else {
                    checkLeave = true;
                }

                if (options !== true) {
                    context = {};
                }

                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        context[key] = options[key];
                    }
                }

                if (!route.model) {
                    esr.render(name, route);
                } else if ('function' === typeof route.model) {
                    if (route.model(context, function () {
                            esr.render(name, route);
                        }) !== false) {
                        esr.render(name, route);
                    }
                } else if (!route.model.length) {
                    esr.render(name, route);
                } else {
                    if (route.onbeforerequest) {
                        route.onbeforerequest(context);
                    }
                    esr.request(route.model, function () {
                        esr.render(name, route);
                    });
                    if (route.onafterrequest) {
                        route.onafterrequest(context);
                    }
                }
            }
        } else {
            pauseStatus = true;
            var moduleName = name.split('.')[0];
            io.loadScript(
                moduleName + '/' + moduleName + '.js',
                function () {
                    pauseStatus = false;
                    callRoute(name, options);
                },
                {
                    cache: true,
                    onerror: function () {
                        // 其他浏览器失败
                        pauseStatus = false;
                    }
                }
            );
        }
    }

    /**
     * 获取所有被路由绑定的 DOM 元素。
     * @private
     *
     * @param {Object} route 路由对象
     */
    function getRouteMains(route) {
        var el = core.$(route.main || esr.DEFAULT_MAIN);

        if (el) {
            var items = el.route ? [el] : [];

            Array.prototype.forEach.call(el.all || el.getElementsByTagName('*'), function (item) {
                if (item.route) {
                    items.push(item);
                }
            });

            return items;
        }

        return [];
    }

    /**
     * 事件监听处理函数。
     * @private
     */
    function listener() {
        esr.redirect(esr.getLocation());
    }

    /**
     * 初始化。
     * @private
     */
    function init() {
        if (ieVersion < 8) {
            var iframe = document.createElement('iframe');

            iframe.id = 'ECUI_LOCATOR';
            iframe.src = 'about:blank';

            document.body.appendChild(iframe);
            setInterval(listener, 100);
        } else if (window.onhashchange === null) {
            window.onhashchange = listener;
            listener();
        } else {
            setInterval(listener, 100);
        }
    }

    /**
     * 解析地址。
     * @private
     *
     * @param {string} loc 地址
     * @return {Object} 地址信息，其中''的值表示路由名称
     */
    function parseLocation(loc) {
        var list = loc.split('~'),
            options = {'': list[0]};

        list.forEach(function (item, index) {
            if (index && item) {
                var data = item.split('=');
                if (data.length === 1) {
                    options[data[0]] = true;
                } else {
                    options[data[0]] = data[1] ? decodeURIComponent(data[1]) : '';
                }
            }
        });

        return options;
    }

    /**
     * 渲染。
     * @private
     *
     * @param {string} name 路由名称
     * @param {Object} route 路由对象
     */
    function render(name, route) {
        if (route.onbeforerender) {
            route.onbeforerender(context);
        }

        var el = core.$(route.main || esr.DEFAULT_MAIN);
        el.style.visibility = 'hidden';

        getRouteMains(route).forEach(function (item) {
            if (item.route.ondispose) {
                item.route.ondispose();
            }
        });

        core.dispose(el, true);
        el.innerHTML = engine.render(route.view || name, context);
        core.init(el);

        afterrender(route);

        el.style.visibility = '';
        el.route = route;

        if (name === route) {
            init();
        } else {
            autoChildRoute(route);
        }
    }

    /**
     * 替换数据。
     * @private
     *
     * @param {string} rule 替换规则
     */
    function replace(rule) {
        if (rule) {
            var data;

            rule = rule.replace(/\$\{([^}]+)\}/g, function (match, name) {
                name = name.split('|');
                var value = util.parseValue(name[0], context);
                value = value === undefined ? (name[1] || '') : value;
                if (match === rule) {
                    data = value;
                    return '';
                }
                return value;
            });

            return data || rule;
        }
        return '';
    }

    var esr = core.esr = {
        DEFAULT_PAGE: 'index',
        DEFAULT_MAIN: 'main',

        // 用于创建空对象，参见request方法
        CreateObject: core.inherits(
            ui.Control,
            function (el, options) {
                ui.Control.constructor.call(this, el, options);
                dom.addClass(el, 'ui-hide');
            },
            {
                getValue: function () {
                    return {};
                }
            }
        ),

        // 用于创建空数组，参见request方法
        CreateArray: core.inherits(
            ui.Control,
            function (el, options) {
                ui.Control.constructor.call(this, el, options);
                dom.addClass(el, 'ui-hide');
            },
            {
                getValue: function () {
                    return [];
                }
            }
        ),

        /**
         * 添加路由信息。
         * @public
         *
         * @param {string} name 路由名称
         * @param {Object} route 路由对象
         */
        addRoute: function (name, route) {
            routes[name] = route;
        },

        /**
         * 调用路由处理。
         * @public
         *
         * @param {string} loc 地址
         * @param {boolean} childRoute 是否为子路由，默认不是
         */
        callRoute: function (loc, childRoute) {
            loc = parseLocation(loc);
            if (childRoute) {
                for (var key in loc) {
                    if (loc.hasOwnProperty(key)) {
                        context[key] = loc[key];
                    }
                }
            }
            callRoute(loc[''], childRoute || loc);
        },

        /**
         * 改变地址，常用于局部刷新。
         * @public
         *
         * @param {string} name 路由名
         * @param {Object} options 需要改变的参数
         */
        change: function (name, options) {
            options = options || {};

            var oldOptions = parseLocation(currLocation),
                url = options[''] || oldOptions[''];

            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    if (options[key] === null) {
                        delete oldOptions[key];
                    } else {
                        oldOptions[key] = options[key];
                    }
                }
            }

            var list = [];
            delete oldOptions[''];
            for (key in oldOptions) {
                if (oldOptions.hasOwnProperty(key)) {
                    list.push(key + '=' + encodeURIComponent(oldOptions[key]));
                }
            }
            list.sort().splice(0, 0, url);
            esr.setLocation(list.join('~'));

            if (name) {
                if (!addIEHistory(currLocation)) {
                    callRoute(name, oldOptions);
                }
            }
        },

        /**
         * 获取数据。
         * @public
         *
         * @param {string} name 数据名
         * @return {Object} 数据值
         */
        getData: function (name) {
            return context[name];
        },

        /**
         * 获取模板引擎。
         * @public
         *
         * @param {string} moduleName 模块名称，如果不指定模块名称使用当前模块
         */
        getEngine: function (moduleName) {
            if (!moduleName) {
                return engine;
            }
            if (!loadStatus[moduleName]) {
                loadStatus[moduleName] = new etpl.Engine();
            }
            return loadStatus[moduleName];
        },

        /**
         * 获取当前地址。
         * @public
         *
         * @return {string} 当前地址
         */
        getLocation: function () {
            var hash;

            // firefox下location.hash会自动decode
            // 体现在：
            //   视觉上相当于decodeURI，
            //   但是读取location.hash的值相当于decodeURIComponent
            // 所以需要从location.href里取出hash值
            if (firefoxVersion) {
                if (hash = location.href.match(/#(.*)$/)) {
                    return hash[1];
                }
            } else if (hash = location.hash) {
                return hash.replace(/^#/, '');
            }
            return '';
        },

        /**
         * 获取路由信息。
         * @public
         *
         * @param {string} name 路由名
         * @return {Object} 路由信息
         */
        getRoute: function (name) {
            return routes[name];
        },

        /**
         * 用于 onleave 中需要前往的地址设置。
         * @public
         *
         * @param {string} loc 前往的地址，如果省略前往之前被阻止的地址
         */
        go: function (loc) {
            checkLeave = false;
            if (loc) {
                esr.redirect(loc);
            } else {
                history.go(1);
            }
        },

        /**
         * 控制定位器转向。
         * @public
         *
         * @param {string} loc location位置
         */
        redirect: function (loc) {
            if (pauseStatus) {
                if (window.onhashchange) {
                    setTimeout(listener, 100);
                }
            } else {
                // 增加location带起始#号的容错性
                // 可能有人直接读取location.hash，经过string处理后直接传入
                if (loc) {
                    loc = loc.replace(/^#/, '');
                }

                if (!loc) {
                    loc = esr.DEFAULT_PAGE;
                    if (historyCache) {
                        loc += '~ECUI_CACHE=' + historyIndex;
                        if (!(ieVersion < 9)) {
                            history.replaceState('', '', '#' + loc);
                            return;
                        }
                    }
                }

                // 与当前location相同时不进行route
                if (currLocation !== loc) {
                    requestVersion++;

                    esr.setLocation(loc);
                    if (historyCache) {
                        cacheList = cacheList.filter(function (item) {
                            return item.target.getMain();
                        });
                        historyData[historyIndex] = historyData[historyIndex] || {};
                        cacheList.forEach(function (item) {
                            var data = {};
                            item.values.forEach(function (value) {
                                data[value] = item.target['get' + value]();
                            });
                            historyData[historyIndex][item.name] = data;
                        });
                        historyIndex++;

                        if (/~ECUI_CACHE=(\d+)/.test(loc)) {
                            historyIndex = +RegExp.$1;
                        } else {
                            historyData.splice(historyIndex, historyData.length - historyIndex);
                            loc += '~ECUI_CACHE=' + historyIndex;
                            if (ieVersion < 9) {
                                pauseStatus = true;
                                history.back();
                                var handle = util.timer(function () {
                                    if (/~ECUI_CACHE=(\d+)/.test(location.href)) {
                                        esr.setLocation(loc);
                                        pauseStatus = false;
                                        handle();
                                    }
                                }, -10);
                                return;
                            }
                            history.replaceState('', '', '#' + loc);
                            currLocation = loc;
                        }
                    }
                    // ie下使用中间iframe作为中转控制
                    // 其他浏览器直接调用控制器方法
                    if (!addIEHistory(loc)) {
                        esr.callRoute(loc);
                    }
                }
            }
        },

        /**
         * 渲染。
         * @public
         *
         * @param {string} name 路由名
         * @param {Object} route 路由对象
         */
        render: function (name, route) {
            function loadTPL() {
                io.ajax(moduleName + '/' + moduleName + '.html', {
                    cache: true,
                    onsuccess: function (data) {
                        pauseStatus = false;
                        engine = loadStatus[moduleName] = new etpl.Engine();
                        engine.compile(data);
                        render(name, route);
                    },
                    onerror: function () {
                        pauseStatus = false;
                    }
                });
            }

            if ('function' === typeof route.view) {
                if (route.onbeforerender) {
                    route.onbeforerender(context);
                }
                route.view(context);
                afterrender(route);
                autoChildRoute(route);
            } else if (engine.getRenderer(route.view || name)) {
                render(name, route);
            } else {
                // 如果在当前引擎找不到模板，有可能是主路由切换，也可能是主路由不存在
                var moduleName = name.split('.')[0];
                engine = loadStatus[moduleName];

                if (engine instanceof etpl.Engine) {
                    if (engine.getRenderer(route.view || name)) {
                        render(name, route);
                        return;
                    }
                }

                if (engine === true) {
                    loadTPL();
                } else {
                    pauseStatus = true;
                    io.ajax(moduleName + '/' + moduleName + '.css', {
                        cache: true,
                        onsuccess: function (data) {
                            dom.createStyleSheet(data);
                            loadStatus[moduleName] = true;
                            loadTPL();
                        },
                        onerror: function () {
                            pauseStatus = false;
                        }
                    });
                }
            }
        },

        /**
         * 请求数据。
         * @public
         *
         * @param {Array} urls url列表，支持name@url的写法，表示结果数据写入name的变量中
         * @param {Function} onsuccess 全部请求成功时调用的函数
         * @param {Function} onerror 至少一个请求失败时调用的函数，会传入一个参数Array说明是哪些url失败
         */
        request: function (urls, onsuccess, onerror) {
            function request(varUrl, varName) {
                // 对于FORM表单的对象列表提交，可以通过产生一个特殊的ECUI控件来完成，例如：
                // <form>
                //   <input ui="ecui.esr.CreateObject" name="a">
                //   <input name="a.b">
                //   <input ui="ecui.esr.CreateObject" name="a">
                //   <input name="a.b">
                // </form>
                function setData(name, value) {
                    for (var i = 0, scope = data, list = name.split('.'); i < list.length - 1; i++) {
                        scope = scope[list[i]] = scope[list[i]] || {};
                        if (scope instanceof Array && scope.length) {
                            scope = scope[scope.length - 1];
                        }
                    }
                    if (scope.hasOwnProperty(list[i])) {
                        if (!(scope[list[i]] instanceof Array)) {
                            scope[list[i]] = [scope[list[i]]];
                        }
                        scope[list[i]].push(value);
                    } else {
                        scope[list[i]] = value;
                    }
                }

                var method = varUrl.split(' '),
                    headers = options.meta ? {'x-enum-version': metaVersion} : {};

                if (method[0] === 'JSON' || method[0] === 'FORM') {
                    var url = method[1].split('?'),
                        data = {},
                        valid = true;

                    headers['Content-Type'] = 'application/json;charset=UTF-8';
                    url[1].split('&').forEach(function (item) {
                        item = item.split('=');
                        if (item.length > 1) {
                            setData(item[0], replace(item[1]));
                        } else if (method[0] === 'FORM') {
                            Array.prototype.slice.call(document.forms[item[0]].elements).forEach(function (item) {
                                if (item.name && ((item.type !== 'radio' && item.type !== 'checkbox') || item.checked)) {
                                    if (item.getControl) {
                                        if (!core.triggerEvent(item.getControl(), 'validate')) {
                                            valid = false;
                                        }
                                    }
                                    setData(item.name, item.getControl ? item.getControl().getValue() : item.value);
                                }
                            });
                        } else {
                            item = replace(item[1]);
                            if ('object' === typeof item) {
                                util.extend(data, item);
                            }
                        }
                    });

                    if (!valid) {
                        if (count === 1) {
                            onerror();
                        } else {
                            count--;
                            err.push({url: varUrl, name: varName});
                        }
                        return;
                    }

                    method = 'POST';
                    url = url[0];
                    data = JSON.stringify(data);
                } else if (method[0] === 'POST') {
                    url = method[1].split('?');
                    method = 'POST';
                    data = replace(url[1]);
                    url = url[0];
                } else {
                    url = replace(method[method.length === 1 ? 0 : 1]);
                    method = 'GET';
                }

                io.ajax(replace(url), {
                    method: method,
                    headers: headers,
                    data: data,
                    onsuccess: function (text) {
                        if (requestVersion === version) {
                            count--;
                            try {
                                var data = JSON.parse(text),
                                    key;

                                // 枚举常量管理
                                if (options.meta) {
                                    if (data.meta) {
                                        metaUpdate = true;
                                    }
                                }

                                if (esr.onparsedata) {
                                    data = esr.onparsedata(url, data);
                                } else {
                                    data = data.data;
                                }

                                if (varName) {
                                    esr.setData(varName, data);
                                } else {
                                    for (key in data) {
                                        if (data.hasOwnProperty(key)) {
                                            esr.setData(key, data[key]);
                                        }
                                    }
                                }
                            } catch (e) {
                                err.push({handle: e, url: varUrl, name: varName});
                            }

                            if (!count) {
                                if (err.length > 0) {
                                    if (onerror(err) === false) {
                                        return;
                                    }
                                }
                                onsuccess();
                            }
                        }
                    },
                    onerror: function () {
                        if (requestVersion === version) {
                            count--;
                            err.push({url: varUrl, name: varName});
                            if (!count) {
                                if (onerror(err) === false) {
                                    return;
                                }
                                onsuccess();
                            }
                        }
                    }
                });
            }

            if ('string' === typeof urls) {
                urls = [urls];
            }

            requestVersion++;

            var err = [],
                count = urls.length,
                metaUpdate,
                handle = onsuccess || util.blank,
                version = requestVersion;

            onsuccess = function () {
                if (metaUpdate) {
                    // 枚举常量管理
                    io.ajax(
                        options.meta,
                        {
                            headers: {'x-enum-version': metaVersion},
                            onsuccess: function (text) {
                                var data = JSON.parse(text);
                                for (var key in data.meta.record) {
                                    if (data.meta.record.hasOwnProperty(key)) {
                                        meta[key] = meta[key] || {};
                                        for (var i = 0, items = data.meta.record[key], item; item = items[i++]; ) {
                                            meta[key][item.id] = item;
                                        }
                                    }
                                }
                                if (data.meta.version) {
                                    metaVersion = data.meta.version;
                                }
                                localStorage.setItem('esr_meta', JSON.stringify(meta));
                                localStorage.setItem('esr_meta_version', metaVersion);
                                handle();
                            },
                            onerror: function () {
                                if (onerror(err) === false) {
                                    return;
                                }
                                handle();
                            }
                        }
                    );
                } else {
                    handle();
                }
            };
            onerror = onerror || esr.onrequesterror || util.blank;

            if (count) {
                urls.forEach(function (item) {
                    var url = item.split('@');
                    if (url[1]) {
                        request(url[1], url[0]);
                    } else {
                        request(url[0]);
                    }
                });
            } else {
                onsuccess();
            }
        },

        /**
         * 设置数据。
         * @public
         *
         * @param {string} name 数据名
         * @param {Object} value 数据值
         */
        setData: function (name, value) {
            context[name] = value;
            if (autoRender[name]) {
                autoRender[name].forEach(function (item) {
                    item[1].call(item[0], context[name]);
                });
            }
        },

        /**
         * 设置hash，不会进行真正的跳转。
         * @public
         *
         * @param {string} loc hash名
         */
        setLocation: function (loc) {
            if (loc) {
                loc = loc.replace(/^#/, '');
            }

            // 存储当前信息
            // opera下，相同的hash重复写入会在历史堆栈中重复记录
            // 所以需要ESR_GET_LOCATION来判断
            if (esr.getLocation() !== loc) {
                location.hash = loc;
            }
            currLocation = loc;
        },

        /**
         * 加载ESR框架。
         * @public
         */
        load: function (value) {
            options = JSON.parse('{' + decodeURIComponent(value.replace(/(\w+)\s*=\s*([^\s]+)\s*($|,)/g, '"$1":"$2"')) + '}');

            if (options.meta) {
                if (window.localStorage) {
                    localStorage = window.localStorage;
                } else {
                    localStorage = dom.setInput(null, null, 'hidden');
                    localStorage.addBehavior('#default#userData');
                    document.body.appendChild(localStorage);
                    localStorage.getItem = function (key) {
                        localStorage.load('ecui');
                        return localStorage.getAttribute(key);
                    };
                    localStorage.setItem = function (key, value) {
                        localStorage.setAttribute(key, value);
                        localStorage.save('ecui');
                    };
                }

                metaVersion = localStorage.getItem('esr_meta_version') || '0';
                meta = JSON.parse(localStorage.getItem('esr_meta')) || {};
            }

            if (FeatureFlags.CACHE_1 && options.cache) {
                historyCache = true;
            }

            for (var i = 0, links = document.getElementsByTagName('A'), el; el = links[i++]; i++) {
                if (el.href.slice(-1) === '#') {
                    el.href = JAVASCRIPT + ':void(0)';
                }
            }

            dom.ready(function () {
                if (esr.onready) {
                    callRoute(esr.onready());
                } else {
                    init();
                }
            });
        }
    };

    /**
     * esr数据缓存插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数，格式为 缓存名[属性名1,属性名2,...]
     */
    ext.cache = function (control, value) {
        if (historyCache) {
            if (value = /^(\w+)\[([\w,]+)\]$/.exec(value)) {
                var name = value[1],
                    values = value[2].split(',').map(function (item) {
                        return item.charAt(0).toUpperCase() + util.toCamelCase(item.slice(1));
                    });
                cacheList.push({
                    target: control,
                    name: name,
                    values: values
                });

                // 除去这里做回填，渲染结束时也会自动回填，是为了处理路由没有刷新的组件
                var data = historyData[historyIndex] = historyData[historyIndex] || {};
                if (data[name]) {
                    values.forEach(function (value) {
                        if (data[name].hasOwnProperty(value)) {
                            control['set' + value](data[name][value]);
                        }
                    });
                }
            }
        }
    };

    /**
     * esr数据名跟踪插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数，格式为 变量名@#模板名 或 变量名@js函数名 ，表示指定的变量变化时，需要刷新控件内部HTML
     */
    ext.esr = function (control, value) {
        if (value = /^(\w+)(\*?@)(#\w*|[\w\.]*\(\))$/.exec(value)) {
            if (value[3].charAt(0) !== '#') {
                if (value[3].length === 2) {
                    var setData = control.getContent().trim(),
                        renderer = new Function('$', setData.charAt(0) === '=' ? 'this.setContent(' + setData.slice(1) + ')' : setData);
                } else {
                    renderer = util.parseValue(value[3].slice(0, -2));
                }
                setData = function (data) {
                    renderer.call(this, value[2].length > 1 ? context : data);
                };
            } else {
                renderer = value[3].length < 2 ? engine.compile(control.getContent().replace(/\$([\w.]+)/g, '${$1}')) : engine.getRenderer(value[3].slice(1));
                setData = function (data) {
                    core.dispose(this.getBody(), true);
                    this.setContent(renderer(value[2].length > 1 ? context : data));
                    core.init(this.getBody());
                };
            }

            if (autoRender[value[1]]) {
                autoRender[value[1]].push([control, setData]);
            } else {
                autoRender[value[1]] = [[control, setData]];
            }

            core.addEventListener(control, 'dispose', function () {
                for (var i = 0, item; item = autoRender[value[1]][i]; i++) {
                    if (item[0] === this) {
                        autoRender[value[1]].splice(i, 1);
                        break;
                    }
                }
            });

            if (context[value[1]] !== undefined) {
                setData.call(control, context[value[1]]);
            } else {
                control.setContent('');
            }
        }
    };
}());
