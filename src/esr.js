/*
ECUI的路由处理扩展，支持按模块的动态加载，不同的模块由不同的模板引擎处理，因此不同模块可以有同名的模板，可以将模块理解成一个命名空间。
使用示例：
<body data-ecui="load:esr">
支持的参数：
esr(cache=true,meta=true)
ECUI支持的路由参数格式为routeName~k1=v1~k2=v2... redirect跳转等价于<a>标签，callRoute不会记录url信息，等价于传统的ajax调用，change用于参数的部分改变，一般用于翻页操作仅改变少量页码信息。
btw: 如果要考虑对低版本IE兼容，请第一次进入的时候请不要使用自动跳转，并带上HISTORY参数，如#/index~HISTORY=1
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ext = core.ext,
        io = core.io,
        ui = core.ui,
        util = core.util,

        JAVASCRIPT = 'javascript',

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var historyIndex = 0,
        historyData = [],
        leaveUrl,
        delegateRoutes = {},    // 路由赋值的委托，如果路由不存在，会保存在此处
        routeRequestCount = 0,  // 记录路由正在加载的数量，用于解决第一次加载时要全部加载完毕才允许init操作
        cacheList = [],
        esrOptions = {},
        routes = {},
        autoRender = {},        // 模拟MVVM双向绑定
        context = {},
        global = {},
        globalListeners = {},

        currLocation = '',
        pauseStatus,
        loadStatus = {},
        engine = etpl,
        requestVersion = 0,     // 请求的版本号，主路由切换时会更新，在多次提交时保证只有最后一次提交会触发渲染

        localStorage,
        metaVersion,
        meta,

        currLayer,
        currRouteName,
        currRouteWeight,

        unloadNames = [],

        FormatInput = core.inherits(
            ui.Control,
            'ui-hide',
            function (el, options) {
                ui.Control.call(this, el, options);
                this._sName = options.name;
            },
            {
                getName: function () {
                    return this._sName || this.getMain().name;
                },

                saveToDefault: util.blank
            }
        );

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
     * @param {object} route 路由对象
     */
    function afterrender(route) {
        routeRequestCount--;
        dom.removeClass(document.body, 'ui-loading');

        if (esrOptions.app) {
            transition(route);
            var layer = getLayer(route);
            if (layer) {
                layer.location = currLocation;
            }
        }

        if (route.onafterrender) {
            route.onafterrender(context);
        }

        if (esrOptions.cache) {
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

        if (route.NAME) {
            autoChildRoute(route);
        } else {
            autoChildRoute(route);
            init();
        }
    }

    /**
     * 自动加载子路由。
     * @private
     *
     * @param {object} route 路由对象
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
     * @param {object} route 路由对象
     */
    function beforerender(route) {
        if (route.main === 'AppCommonContainer') {
            var el = core.$('AppCommonContainer');
            if (el.route !== route.NAME) {
//{if 0}//
                core.dispose(el, true);
//{/if}//
                core.$('AppBackupContainer').id = 'AppCommonContainer';
                el.id = 'AppBackupContainer';
            }
        }
        if (route.onbeforerender) {
            route.onbeforerender(context);
        }
    }

    /**
     * 计算相对的url值。
     * @private
     *
     * @param {string} url 用于计算的url
     */
    function calcUrl(url) {
        if (url.charAt(0) === '/') {
            return url;
        }
        var baseUrl = esr.getLocation().split('~')[0].split('/');
        url = url.split('../');
        baseUrl.splice(baseUrl.length - url.length, url.length, url.pop());
        return baseUrl.join('/');
    }

    /**
     * 调用指定的路由。
     * @private
     *
     * @param {string} name 路由名称
     * @param {object} options 参数
     */
    function callRoute(name, options) {
        routeRequestCount++;

        // 供onready时使用，此时name为route
        if ('string' === typeof name) {
            name = calcUrl(name);

            var route = routes[name],
                moduleName = getModuleName(name);
//{if 1}//            var NS = core.ns['_' + moduleName.replace(/\//g, '_')];
//{else}//
            NS = core.ns['_' + moduleName.replace(/\//g, '_')];
//{/if}//
            if (options !== true) {
                context = {
                    NS: (NS || {}).data,
                    Global: Object.assign({}, global)
                };
            }
        } else {
            route = name;
        }

        if (route) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    context[key] = options[key];
                }
            }

            var layer = getLayer(route);

            if (context.DENY_CACHE !== true) {
                if (route.CACHE && layer && layer.location === currLocation) {
                    // 数据必须还在才触发缓存
                    // 模块发生变化，缓存状态下同样更换引擎
                    engine = loadStatus[getModuleName(route.NAME)] || etpl;
                    // 添加oncached事件，在路由已经cache的时候依旧执行
                    if (esrOptions.app) {
                        transition(route);
                    }
                    if (route.oncached) {
                        route.oncached(context);
                    }
                    return;
                }
            } else {
                // 解决A标签下反复修改的问题
                currLocation = esr.getLocation().replace('~DENY_CACHE', '');
                delete context.DENY_CACHE;
                util.timer(function () {
                    history.replaceState('', '', '#' + currLocation);
                }, 100);
            }

            if (route.CACHE === undefined && layer && route.main !== 'AppCommonContainer') {
                // 位于层内且不在公共层，缓存数据
                route.CACHE = true;
            }

            if (!route.onrender || route.onrender() !== false) {
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
                    }, route.onerror || esr.onerror);
                }
            }
        } else {
            pauseStatus = true;
            if (NS) {
                NS.data = NS.data || {};
                NS.ui = NS.ui || {};
            } else {
                NS = core.ns['_' + moduleName.replace(/\//g, '_')] = {
                    data: {},
                    ui: {}
                };
            }
            context.NS = NS.data;

            io.loadScript(
                moduleName + '_define_.js',
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
     * 获取路由对应的层，如果存在表示路由希望进行缓存。
     * @private
     *
     * @param {object} route 路由对象
     */
    function getLayer(route) {
//{if 0}//
        if (!route.main && route.NAME) {
            var main = route.NAME.slice(1).replace(/[._]/g, '-').replace(/\//g, '_');
            route.main = core.$(main) ? main : esr.DEFAULT_MAIN;
        }
//{/if}//
        for (var el = core.$(route.main); el; el = dom.parent(el)) {
            // 子路由不直接返回层
            if (el.route && el.route !== route.NAME) {
                break;
            }

            if (el.getControl && el.getControl() instanceof esr.AppLayer) {
                return el.getControl();
            }
        }
        return null;
    }

    /**
     * 获取模块名称。
     * @private
     *
     * @param {string} routeName 路由名称
     */
    function getModuleName(routeName) {
        return routeName.slice(1, routeName.lastIndexOf('/') + 1);
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
            } else if (window.onhashchange !== undefined) {
                dom.addEventListener(window, 'hashchange', listener);
                listener();
            } else {
                setInterval(listener, 100);
            }
        }
    }

    /**
     * 事件监听处理函数。
     * @private
     */
    function listener() {
        redirect(esr.getLocation());
    }

    /**
     * 解析地址。
     * @private
     *
     * @param {string} loc 地址
     * @return {object} 地址信息，其中''的值表示路由名称
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
     * 控制定位器转向。
     * @private
     *
     * @param {string} loc location位置
     */
    function redirect(loc) {
        if (pauseStatus) {
            if (window.onhashchange !== undefined) {
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
            }

            // 与当前location相同时不进行route
            if (currLocation !== loc) {
                if (currLocation) {
                    if (core.hasMessageBox() || leaveUrl) {
                        history.go(/~HISTORY=(\d+)/.test(loc) ? historyIndex - +RegExp.$1 : -1);
                        return;
                    }

                    if (leaveUrl === undefined) {
                        var currRoute = esr.getRoute(currLocation.split('~')[0]);
                        if (!/~ALLOW_LEAVE(~|$)/.test(currLocation) && currRoute && currRoute.onleave) {
                            if (currRoute.onleave(
                                    context,
                                    function (forward) {
                                        if (forward) {
                                            history.go(/~HISTORY=(\d+)/.test(leaveUrl) ? +RegExp.$1 - historyIndex : 1);
                                            leaveUrl = '';
                                        } else {
                                            leaveUrl = undefined;
                                        }
                                    }
                                ) === false) {
                                leaveUrl = loc;
                            }
                        }
                    }

                    if (core.hasMessageBox() || leaveUrl) {
                        history.go(/~HISTORY=(\d+)/.test(loc) ? historyIndex - +RegExp.$1 : -1);
                        return;
                    }
                }

                leaveUrl = undefined;
                unloadNames.forEach(function (name) {
                    delete loadStatus[name];
                    name = '/' + name;
                    Array.prototype.slice.call(document.getElementsByTagName('STYLE')).forEach(function (item) {
                        if (dom.getAttribute(item, 'module') === name) {
                            dom.remove(item);
                        }
                    });
                    for (var key in routes) {
                        if (routes.hasOwnProperty(key)) {
                            if (key.startsWith(name) && key.slice(name.length).indexOf('/') < 0) {
                                delete routes[key];
                            }
                        }
                    }
                });
                unloadNames = [];

                requestVersion++;
                dom.addClass(document.body, 'ui-loading');

                if (esrOptions.cache) {
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
                }

                historyIndex++;

                if (/~HISTORY=(\d+)/.test(loc)) {
                    historyIndex = +RegExp.$1;

                    // ie下使用中间iframe作为中转控制
                    // 其他浏览器直接调用控制器方法
                    if (!addIEHistory(loc)) {
                        currLocation = loc;
                        esr.callRoute(loc);
                    }
                } else {
                    if (esrOptions.cache) {
                        historyData.splice(historyIndex, historyData.length - historyIndex);
                    }
                    loc += '~HISTORY=' + historyIndex;
                    if (ieVersion < 9) {
                        pauseStatus = true;
                        if (historyIndex === 1) {
                            // IE第一次进入，不能back，否则会退出框架
                            history.back();
                        }
                        var handle = util.timer(function () {
                            if (/~HISTORY=(\d+)/.test(location.href)) {
                                esr.setLocation(loc);
                                pauseStatus = false;
                                handle();
                            }
                        }, -10);
                        return;
                    }
                    util.timer(function () {
                        history.replaceState('', '', '#' + loc);
                        // ie下使用中间iframe作为中转控制
                        // 其他浏览器直接调用控制器方法
                        if (!addIEHistory(loc)) {
                            currLocation = loc;
                            esr.callRoute(loc);
                        }
                    }, 100);
                }
            }
        }
    }

    /**
     * 渲染。
     * @private
     *
     * @param {object} route 路由对象
     * @param {string} name 模板名
     */
    function render(route, name) {
        beforerender(route);

        var el = core.$(route.main);
        el.style.visibility = 'hidden';

        if (el.route && routes[el.route].ondispose) {
            dom.removeClass(el, el.route.slice(1).replace(/[._]/g, '-').replace(/\//g, '_'));
            routes[el.route].ondispose();
            el.route = null;
        }
        Array.prototype.slice.call(el.all || el.getElementsByTagName('*')).forEach(function (item) {
            if (item.route && routes[item.route].ondispose) {
                routes[item.route].ondispose();
            }
        });

        core.dispose(el, true);
        el.innerHTML = engine.render(name || route.view, context);
        if (route.NAME) {
            el.route = route.NAME;
            dom.addClass(el, route.NAME.slice(1).replace(/[._]/g, '-').replace(/\//g, '_'));
        }
        core.init(el);

        afterrender(route);

        el.style.visibility = '';
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

    /**
     * APP 层切换动画处理。
     * @private
     *
     * @param {object} route 路由对象，新的路由
     */
    function transition(route) {
        if (route.NAME !== currRouteName) {
            var layer = getLayer(route);
            if (layer) {
                var layerEl = layer.getMain();
                // 路由权重在该项目中暂不考虑相等情况
                if (currLayer) {
                    core.$clearState(currLayer);

                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    var currLayerEl = currLayer.getMain();
                    currLayerEl.header.style.display = 'none';

                    if (currRouteWeight !== route.weight) {
                        var position = currRouteWeight < route.weight ? 1 : -1,
                            fn;

                        if (esrOptions.transition === 'cover') {
                            if (position > 0) {
                                currLayerEl.style.zIndex = 5;
                                layerEl.style.zIndex = 10;
                                fn = 'this.to.style.left=#' + (position * 100) + '->0%#';
                            } else {
                                currLayerEl.style.zIndex = 10;
                                layerEl.style.zIndex = 5;
                                fn = 'this.from.style.left=#0->' + (-position * 100) + '%#';
                            }
                            layerEl.header.style.zIndex = 10;
                            core.mask(0.5, 7);
                        } else {
                            fn = 'this.from.style.left=#0->' + (-position * 100) + '%#;this.to.style.left=#' + (position * 100) + '->0%#';
                        }

                        pauseStatus = true;

                        var className = currLayerEl.className;
                        currLayer.disable();
                        currLayerEl.className = className;
                        className = layerEl.className;
                        layer.disable();
                        layerEl.className = className;

                        effect.grade(
                            fn,
                            400,
                            {
                                $: {from: currLayerEl, to: layerEl},
                                onfinish: function () {
                                    // 在执行结束后，如果不同时common layer则隐藏from layer，并且去掉目标路由中的动画执行函数
                                    currLayer.enable();
                                    layer.enable();

                                    currLayer.hide();
                                    currLayer = layer;
                                    pauseStatus = false;
                                    if (esrOptions.transition === 'cover') {
                                        core.mask();
                                    }
                                }
                            }
                        );
                    } else {
                        // weight相等不触发动画
                        currLayer.hide();
                        currLayer = layer;
                    }
                } else {
                    currLayer = layer;
                }

                layerEl.header.style.display = '';
                layer.show();

                currRouteName = route.NAME;
                currRouteWeight = route.weight;
            }
        }
    }

    var esr = core.esr = {
        DEFAULT_PAGE: '/index',
        DEFAULT_MAIN: 'main',

        // 用于创建空对象，参见request方法
        CreateObject: core.inherits(
            FormatInput,
            {
                getFormValue: function () {
                    return {};
                }
            }
        ),

        // 用于创建空数组，参见request方法
        CreateArray: core.inherits(
            FormatInput,
            {
                getFormValue: function () {
                    return [];
                }
            }
        ),

        // 布局层，用于加载结构
        AppLayer: core.inherits(ui.Control),

        /**
         * 监听全局变量变化。
         * @public
         *
         * @param {string} name 全局变量名称
         * @param {Function} listener 监听函数
         */
        addGlobalListener: function (name, listener) {
            globalListeners[name] = globalListeners[name] || [];
            globalListeners[name].push(listener);
            if (global[name]) {
                listener(global[name]);
            }
        },

        /**
         * 添加路由信息。
         * @public
         *
         * @param {string} name 路由名称
         * @param {object} route 路由对象
         */
        addRoute: function (name, route) {
            if (!route) {
                route = name;
                name = route.NAME;
            }
//{if 0}//
            if (name.indexOf('/') >= 0) {
                throw new Error('The route\'s name can\'t contain \'/\'');
            }
//{/if}//
            route.view = route.view || name;
            name = route.NAME = '/' + getModuleName(esr.getLocation()) + name;
//{if 1}//            if (!route.main) {//{/if}//
//{if 1}//                var main = name.slice(1).replace(/[._]/g, '-').replace(/\//g, '_');//{/if}//
//{if 1}//                route.main = core.$(main) ? main : esr.DEFAULT_MAIN;//{/if}//
//{if 1}//            }//{/if}//
            routes[name] = route;

            if (esrOptions.app && route.weight === undefined) {
                route.weight = name.split(/[\/.]/).length - 2;
            }

            if (delegateRoutes[name]) {
                delegateRoutes[name].forEach(function (item) {
                    route[item.name] = item.value;
                });
                delete delegateRoutes[name];
            }
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
         * @param {object} options 需要改变的参数
         */
        change: function (name, options) {
            options = options || {};

            var oldOptions = parseLocation(currLocation),
                url = options[''] || oldOptions[''] || name;

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
         * 委托框架在指定的路由生成时赋值。
         * 使用框架式结构时，路由被操作，相关路由也许还未创建。delegate 方法提供将指定的赋值滞后到对应的路由创建后才调用的模式。
         * @public
         *
         * @param {string} routeName 被委托的路由名称
         * @param {string} name 委托的属性名称
         * @param {object} value 委托的属性值
         */
        delegate: function (routeName, name, value) {
            if (routes[routeName]) {
                routes[routeName][name] = value;
            } else {
                (delegateRoutes[routeName] = delegateRoutes[routeName] || []).push({name: name, value: value});
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
            for (; el; el = dom.parent(el)) {
                if (el.route) {
                    return routes[el.route];
                }
            }
            return null;
        },
//{if 0}//
        /**
         * 获取数据容器，仅供调试使用。
         * @public
         *
         * @return {object} 数据容器
         */
        getContext: function () {
            return context;
        },
//{/if}//
        /**
         * 获取数据。
         * @public
         *
         * @param {string} name 数据名
         * @return {object} 数据值
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
         * 获取常量数据。
         * @public
         *
         * @return {object} 常量数据
         */
        getGlobal: function () {
            return Object.assign({}, global);
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
         * @return {object} 路由信息
         */
        getRoute: function (name) {
            return routes[calcUrl(name)];
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
            var valid = true,
                elements = Array.prototype.slice.call(form.elements);

            elements.forEach(function (item) {
                if (validate !== false && item.getControl && !item.getControl().isDisabled()) {
                    if (!core.dispatchEvent(item.getControl(), 'validate')) {
                        valid = false;
                    }
                }
                if (item.name && ((item.type !== 'radio' && item.type !== 'checkbox') || item.checked)) {
                    if (item.getControl) {
                        var control = item.getControl();
                        if (control.getName && control.getFormValue && !control.isDisabled()) {
                            setCacheData(data, control.getName(), control.getFormValue());
                        }
                    } else if (!item.disabled) {
                        setCacheData(data, item.name, item.value);
                    }
                }
            });

            if (valid) {
                elements.forEach(function (item) {
                    if (item.getControl && item.name) {
                        item.getControl().saveToDefault();
                    }
                });
            }
            return valid;
        },

        /**
         * 控制定位器转向。
         * @private
         *
         * @param {string} loc location位置
         */
        redirect: function (loc) {
            location.hash = calcUrl(loc);
        },

        /**
         * 渲染。
         * @public
         *
         * @param {object} route 路由对象
         */
        render: function (route) {
            function loadTPL() {
                io.ajax(moduleName + '_define_.html', {
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

            if (route.view === undefined) {
                beforerender(route);
                afterrender(route);
            } else if ('function' === typeof route.view) {
                beforerender(route);
                if (route.view(context, function (name) {
                        if (name) {
                            render(route, name);
                        } else {
                            afterrender(route);;
                        }
                    }) !== false) {
                    afterrender(route);
                }
            } else if (engine.getRenderer(route.view)) {
                render(route);
            } else {
                // 如果在当前引擎找不到模板，有可能是主路由切换，也可能是主路由不存在
                var moduleName = getModuleName(route.NAME);
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
                    io.ajax(moduleName + '_define_.css', {
                        cache: true,
                        onsuccess: function (data) {
                            dom.createStyleSheet(data).setAttribute('module', '/' + moduleName);
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
                    Object.assign(headers, esr.headers);
                }

                if (esrOptions.meta) {
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
                            Object.assign(data, replace(item[0]));
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
                        count--;
                        try {
                            var data = JSON.parse(text),
                                key;

                            // 枚举常量管理
                            if (esrOptions.meta) {
                                if (data.meta) {
                                    metaUpdate = true;
                                }
                            }
                            context[varName ? varName + '_CODE' : 'CODE'] = data.code;
                            data = esr.onparsedata ? esr.onparsedata(url, data) : data.data;

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
                            if (requestVersion === version) {
                                onsuccess();
                            } else {
                                // 数据无效，需要恢复环境
                                onerror();
                            }
                        }
                    },
                    onerror: function (xhr) {
                        count--;
                        err.push({url: varUrl, name: varName, xhr: xhr});
                        if (!count) {
                            if (onerror(err) === false) {
                                return;
                            }
                            onsuccess();
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
                        esrOptions.meta,
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
         * 设置常量数据。
         * @public
         *
         * @param {string} name 数据名
         * @param {object} value 数据值
         */
        setGlobal: function (name, value) {
//{if 0}//
            if (global[name]) {
                console.warn('The name("' + name + '") has existed.');
            }
//{/if}//
            global[name] = value;
            if (globalListeners[name]) {
                globalListeners[name].forEach(function (item) {
                    item(value);
                });
            }
        },

        /**
         * 设置数据。
         * @public
         *
         * @param {string} name 数据名
         * @param {object} value 数据值
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
         * 显示选择框。
         * @public
         *
         * @param {ecui.ui.Control|string} content 选择框对应的控件或HTML片断
         * @param {ecui.ui.Control} onconfirm 操作成功后执行回调的函数
         * @param {string} title 选择框标题
         */
        showSelect: function (content, onconfirm, title) {
            if (esrOptions.app) {
                var container = core.$('AppSelectContainer'),
                    layer = core.findControl(container),
                    lastLocation = esr.getLocation();

                core.addEventListener(layer, 'confirm', function (event) {
                    if (onconfirm) {
                        onconfirm(event);
                    }
                    history.go(-1);
                });
                core.addEventListener(layer, 'hide', function () {
                    if (content) {
                        if (content instanceof ui.Control) {
                            content.setParent();
                        } else {
                            core.dispose(container, true);
                            container.innerHTML = '';
                        }
                        content = null;
                    }
                    core.removeControlListeners(core.findControl(container));
                });

                esr.setData('AppSelectTitle', title || '');

                if (content) {
                    if (content instanceof ui.Control) {
                        content.setParent(layer);
                    } else {
                        container.innerHTML = content;
                        core.init(container);
                    }
                }

                esr.setLocation(lastLocation.split('~')[0] + '~ALLOW_LEAVE');

                transition({
                    NAME: 'AppSelect',
                    main: 'AppSelectContainer',
                    weight: 1000
                });
            }
        },

        /**
         * 卸载一个已经加载的模块。
         * @public
         *
         * @param {string} name 模块名或路由名
         */
        unload: function (name) {
            unloadNames.push(getModuleName(name));
        },

        /**
         * 加载ESR框架。
         * @public
         */
        load: function (value) {
            function loadInit() {
                etpl.config({
                    commandOpen: '<<<',
                    commandClose: '>>>'
                });

                for (var el = body.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 8) {
                        etpl.compile(el.textContent || el.nodeValue);
                        dom.remove(el);
                    }
                }

                if (esrOptions.app) {
                    el = core.$('AppCommonContainer');
                    el.id = 'AppBackupContainer';
                    dom.insertHTML(el, 'afterEnd', dom.previous(el).outerHTML + el.outerHTML);
                    el.id = 'AppCommonContainer';
                    el = dom.last(dom.first(body));
                    var children = dom.children(el.parentNode);
                    for (var i = 1, item; item = children[i]; i += 2) {
                        item.header = children[i - 1];
                        var first = item.firstChild;
                        if (first && first === item.lastChild && first.nodeType === 8) {
                            item.innerHTML = etpl.compile(first.textContent || first.nodeValue)({NS: (core.ns['_' + item.id.slice(0, item.id.lastIndexOf('_') + 1)] || {}).data});
                        }
                        el.appendChild(item);
                    }
                    el = core.$((getModuleName(esr.getLocation().split('~')[0]) || esr.DEFAULT_PAGE.slice(1)).replace(/\//g, '_'));
                    if (el) {
                        dom.removeClass(el, 'ui-hide');
                        el.header.style.display = '';
                    }
                }

                etpl.config({
                    commandOpen: '<!--',
                    commandClose: '-->'
                });

                core.ready(function () {
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

            var body = core.getBody();
            esrOptions = JSON.parse('{' + decodeURIComponent(value.replace(/(\w+)\s*=\s*([A-Za-z0-9_]+)\s*($|,)/g, '"$1":"$2"$3')) + '}');

            if (esrOptions.meta) {
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
//{if 0}//
            var tplList = [];
            for (el = body.firstChild; el; el = el.nextSibling) {
                if (el.nodeType === 8) {
                    if (/^\s*import:\s*([A-Za-z0-9.-_]+)\s*$/.test(el.textContent || el.nodeValue)) {
                        tplList.push([el, RegExp.$1]);
                    }
                }
            }

            (function loadTpl() {
                if (tplList.length) {
                    var item = tplList.splice(0, 1)[0];
                    io.ajax(item[1], {
                        cache: true,
                        onsuccess: function (text) {
                            dom.insertBefore(
                                document.createComment(text.replace(/<!--/g, '<<<').replace(/-->/g, '>>>')),
                                item[0]
                            );
                            dom.remove(item[0]);
                            loadTpl();
                        },
                        onerror: function () {
                            console.warn('找不到文件' + item[1]);
                            loadTpl();
                        }
                    });
                } else {
                    loadApp();
                }
            }());

            function loadApp() {
                if (esrOptions.app) {
                    io.ajax('.app-container.html', {
                        cache: true,
                        onsuccess: function (text) {
                            dom.insertHTML(body, 'AFTERBEGIN', text);
                            loadInit();
                            core.init(document.body);
                        },
                        onerror: function () {
                            console.warn('找不到APP的布局文件，请确认.app-container.html文件是否存在');
                            esrOptions.app = false;
                            loadInit();
                            core.init(document.body);
                        }
                    });
                } else {
                    loadInit();
                }
            }
//{else}//            loadInit();
//{/if}//
            for (var i = 0, links = document.getElementsByTagName('A'), el; el = links[i++]; i++) {
                if (el.href.slice(-1) === '#') {
                    el.href = JAVASCRIPT + ':void(0)';
                }
            }
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
        if (esrOptions.cache) {
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
        if (value = /^([\w,]+)(\*?@)(#\w*|[\w\.]*\(\))$/.exec(value)) {
            if (value[3].charAt(0) !== '#') {
                if (value[3].length === 2) {
                    var setData = util.decodeHTML(control.getContent().trim()),
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

            value[1] = value[1].split(',');
            value[1].forEach(function (item) {
                if (autoRender[item]) {
                    autoRender[item].push([control, setData]);
                } else {
                    autoRender[item] = [[control, setData]];
                }
            });

            core.addEventListener(control, 'dispose', function () {
                value[1].forEach(function (item) {
                    for (var i = 0, data; data = autoRender[item][i]; i++) {
                        if (data[0] === this) {
                            autoRender[item].splice(i, 1);
                            break;
                        }
                    }
                }, this);
            });

            var nodata = true;
            value[1].forEach(function (item) {
                if (context[item] !== undefined) {
                    setData.call(control, context[item]);
                    nodata = false;
                }
            });
            if (nodata) {
                core.dispose(control.getBody(), true);
                control.setContent('');
            }
        }
    };

    // 模块独立的命名空间集合
    core.ns = {};

    // 向框架注入request方法
    core.request = core.request || function (url, onsuccess, onerror) {
        var sysContext = context;
        context = {};
        esr.request(
            url,
            function () {
                try {
                    if (onsuccess) {
                        onsuccess(context);
                    }
                } catch (ignore) {
                }
                context = sysContext;
            },
            function () {
                try {
                    if (onerror) {
                        onerror();
                    }
                } catch (ignore) {
                }
                context = sysContext;
            }
        );
    };
}());
