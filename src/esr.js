/*
ECUI的路由处理扩展，支持按模块的动态加载，不同的模块由不同的模板引擎处理，因此不同模块可以有同名的模板，可以将模块理解成一个命名空间。
ECUI支持的路由参数格式为routeName~k1=v1~k2=v2... redirect跳转等价于<a>标签，callRoute不会记录url信息，等价于传统的ajax调用，change用于参数的部分改变，一般用于翻页操作仅改变少量页码信息。
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
        routeRequestCount = 0,
        cacheList = [],
        options,
        routes = {},
        autoRender = {},
        context = {},
        currLocation = '',
        pauseStatus,
        loadStatus = {},
        engine = etpl,
        requestVersion = 0,
        localStorage,
        metaVersion,
        meta,
        dateFormat;

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
            var children = route.children instanceof Array ? route.children : [route.children];
            if (route.NAME) {
                children.forEach(function (item) {
                    esr.callRoute(replace(item), true);
                });
            } else {
                children.forEach(function (item) {
                    callRoute(item, true);
                });
            }
        }
    }

    /**
     * 渲染开始事件的处理。
     * @private
     *
     * @param {Object} route 路由对象
     */
    function beforerender(route) {
        if (route.onbeforerender) {
            route.onbeforerender(context);
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
        routeRequestCount++;

        // 供onready时使用，此时name为route
        var route = 'string' === typeof name ? routes[name] : name;

        if (route) {
            if (route.cache !== undefined) {
                if (route.cache) {
                    var el = core.$(route.main);
                    // TODO，如果没有，是否需要自动生成一个层?
                    if (el) {
                        el = core.findControl(el);
                        var layers = ui.Layer.allShown(),
                            index = layers.indexOf(el);
                        if (index < 0) {
                            if (el instanceof ui.Layer) {
                                el.show();
                            }
                        } else {
                            for (; ++index < layers.length; ) {
                                layers[index].hide();
                            }
                            return;
                        }
                    }
                }
            }
            if (!route.onrender || route.onrender() !== false) {
                if (options !== true) {
                    context = {};
                }

                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        context[key] = options[key];
                    }
                }

                if (!route.model) {
                    esr.render(route);
                } else if ('function' === typeof route.model) {
                    if (route.onbeforerequest) {
                        route.onbeforerequest(context);
                    }
                    if (route.model(context, function () {
                            esr.render(route);
                        }) !== false) {
                        esr.render(route);
                    }
                } else if (!route.model.length) {
                    esr.render(route);
                } else {
                    if (route.onbeforerequest) {
                        route.onbeforerequest(context);
                    }
                    esr.request(route.model, function () {
                        esr.render(route);
                    });
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
        if (routeRequestCount <= 1) {
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
     * @param {Object} route 路由对象
     * @param {string} name 模板名
     */
    function render(route, name) {
        beforerender(route);

        var el = core.$(route.main);
        el.style.visibility = 'hidden';

        if (el.route && routes[el.route].ondispose) {
            routes[el.route].ondispose();
        }
        Array.prototype.forEach.call(el.all || el.getElementsByTagName('*'), function (item) {
            if (item.route) {
                item = routes[item.route];
                if (item.ondispose) {
                    item.ondispose();
                }
            }
        });

        core.dispose(el, true);
        el.innerHTML = engine.render(name || route.view, context);
        core.init(el);

        afterrender(route);

        el.style.visibility = '';

        if (route.NAME) {
            el.route = route.NAME;
            autoChildRoute(route);
        } else {
            autoChildRoute(route);
            init();
        }
        routeRequestCount--;
    }

    /**
     * 替换数据。
     * @private
     *
     * @param {string} rule 替换规则
     * @param {boolean} isUrl 是不是进行url转义
     */
    function replace(rule, isUrl) {
        if (rule) {
            var data;

            rule = rule.replace(/\$\{([^}]+)\}/g, function (match, name) {
                name = name.split('|');
                if (name[0].charAt(0) !== '&') {
                    var value = util.parseValue(name[0], context);
                } else {
                    value = util.parseValue(name[0].slice(1));
                }
                value = value === undefined ? (name[1] || '') : value;
                if (isUrl) {
                    value = encodeURIComponent(value);
                }
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

    /**
     * 设置数据到缓存对象中。
     * @private
     *
     * @param {object} cacheData 缓存对象
     * @param {string} name 对象名称(支持命名空间)
     * @param {object} value 对象值
     */
    function setCacheData(cacheData, name, value) {
        // 对于FORM表单的对象列表提交，可以通过产生一个特殊的ECUI控件来完成，例如：
        // <form>
        //   <input ui="ecui.esr.CreateObject" name="a">
        //   <input name="a.b">
        //   <input ui="ecui.esr.CreateObject" name="a">
        //   <input name="a.b">
        // </form>
        for (var i = 0, scope = cacheData, list = name.split('.'); i < list.length - 1; i++) {
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

    var esr = core.esr = {
        DEFAULT_PAGE: 'index',
        DEFAULT_MAIN: 'main',

        // 用于创建空对象，参见request方法
        CreateObject: core.inherits(
            ui.Control,
            function (el, options) {
                ui.Control.call(this, el, options);
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
                ui.Control.call(this, el, options);
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
            if (route) {
                route.NAME = name;
            } else {
                route = name;
                name = route.NAME;
            }
            route.main = route.main || esr.DEFAULT_MAIN;
            route.view = route.view || name;
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
         * 查找 DOM 元素与控件对应的路由。
         * @public
         *
         * @param {HTMLElement|ecui.ui.Control} el DOM 元素或者控件对象
         * @return {Route} 通过 addRoute 定义的路由对象
         */
        findRoute: function (el) {
            if (el instanceof ui.Control) {
                el = el.getMain();
            }
            for (; el; el = dom.getParent(el)) {
                if (el.route) {
                    return routes[el.route];
                }
            }
            return null;
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
         * 将一个 Form 表单转换成对象。
         * @public
         *
         * @param {Form} form Form元素
         * @param {object} data 数据对象
         * @param {boolean} validate 是否需要校验，默认不校验
         * @return {boolean} 校验是否通过
         */
        parseObject: function (form, data, validate) {
            var valid = true;
            Array.prototype.slice.call(form.elements).forEach(function (item) {
                if (validate !== false && item.getControl && !item.getControl().isDisabled()) {
                    if (!core.triggerEvent(item.getControl(), 'validate')) {
                        valid = false;
                    }
                }
                if (item.name && ((item.type !== 'radio' && item.type !== 'checkbox') || item.checked)) {
                    if (item.getControl) {
                        var control = item.getControl();
                        if (!control.isDisabled()) {
                            setCacheData(data, item.name, dateFormat && (control instanceof ui.CalendarInput) ? util.formatDate(control.getDate(), dateFormat) : control.getValue());
                        }
                    } else if (!item.disabled) {
                        setCacheData(data, item.name, item.value);
                    }
                }
            });
            return valid;
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
         * @param {Object} route 路由对象
         */
        render: function (route) {
            function loadTPL() {
                io.ajax(moduleName + '/' + moduleName + '.html', {
                    cache: true,
                    onsuccess: function (data) {
                        pauseStatus = false;
                        engine = loadStatus[moduleName] = new etpl.Engine();
                        engine.compile(data);
                        render(route);
                    },
                    onerror: function () {
                        pauseStatus = false;
                    }
                });
            }

            if (route.cache === false) {
                route.cache = true;
            }
            if (route.view === undefined) {
                beforerender(route);
                init();
                afterrender(route);
                routeRequestCount--;
            } else if ('function' === typeof route.view) {
                beforerender(route);
                if (route.view(context, function (name) {
                        if (name) {
                            render(route, name);
                        }
                        afterrender(route);
                        autoChildRoute(route);
                    }) !== false) {
                    afterrender(route);
                    autoChildRoute(route);
                }
                routeRequestCount--;
            } else if (engine.getRenderer(route.view)) {
                render(route);
            } else {
                // 如果在当前引擎找不到模板，有可能是主路由切换，也可能是主路由不存在
                var moduleName = route.NAME.split('.')[0];
                engine = loadStatus[moduleName];

                if (engine instanceof etpl.Engine) {
                    if (engine.getRenderer(route.view)) {
                        render(route);
                        return;
                    }
                }

                if (engine === true) {
                    loadTPL();
                } else if (!engine) {
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
                var method = varUrl.split(' '),
                    headers = {};

                if (esr.headers) {
                    util.extend(headers, esr.headers);
                }

                if (options.meta) {
                    headers['x-enum-version'] = metaVersion;
                }

                if (method[0] === 'JSON' || method[0] === 'FORM') {
                    var url = method[1].split('?'),
                        data = {},
                        valid = true;

                    headers['Content-Type'] = 'application/json;charset=UTF-8';
                    url[1].split('&').forEach(function (item) {
                        item = item.split('=');
                        if (item.length > 1) {
                            setCacheData(data, item[0], replace(decodeURIComponent(item[1])));
                        } else if (method[0] === 'FORM') {
                            valid = esr.parseObject(document.forms[item[0]], data);
                        } else {
                            data = replace(item[0]);
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

                io.ajax(replace(url, true), {
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

            if (options.cache) {
                historyCache = true;
            }

            dateFormat = options.date;

            for (var i = 0, links = document.getElementsByTagName('A'), el; el = links[i++]; i++) {
                if (el.href.slice(-1) === '#') {
                    el.href = JAVASCRIPT + ':void(0)';
                }
            }

            dom.ready(function () {
                etpl.config({
                    commandOpen: '<<<',
                    commandClose: '>>>'
                });
                for (var el = document.body.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 8) {
                        etpl.compile(el.textContent || el.nodeValue);
                        ecui.dom.remove(el);
                    }
                }
                etpl.config({
                    commandOpen: '<!--',
                    commandClose: '-->'
                });

                if (esr.onready) {
                    var defaultRoute = esr.onready();
                }
                if (defaultRoute) {
                    callRoute(defaultRoute);
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
/*                var data = historyData[historyIndex] = historyData[historyIndex] || {};
                if (data[name]) {
                    values.forEach(function (value) {
                        if (data[name].hasOwnProperty(value)) {
                            control['set' + value](data[name][value]);
                        }
                    });
                }*/
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
    ext.data = function (control, value) {
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
                core.dispose(control.getBody(), true);
                control.setContent('');
            }
        }
    };
}());
