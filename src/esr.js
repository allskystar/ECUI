//{if $css}//
ecui.__ControlStyle__('\
#ECUI_LOCATOR {\
    position: absolute !important;\
    visibility: hidden !important;\
}\
\
.ui-transition {\
    img {\
        display: none;\
    }\
}\
');
//{/if}//
/*
ECUI的路由处理扩展，支持按模块的动态加载，不同的模块由不同的模板引擎处理，因此不同模块可以有同名的模板，可以将模块理解成一个命名空间。
使用示例：
<body data-ecui="load:esr">
支持的参数：
esr(cache=500,meta=[url],history=false)
cache参数可以用于页面数据缓存区的大小，默认为1000

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
/*ignore*/
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
/*end*/
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var hasReady = false,
        historyIndex = 0,
        leaveUrl,
        delegateRoutes = {},    // 路由赋值的委托，如果路由不存在，会保存在此处
        routeRequestCount = 0,  // 记录路由正在加载的数量，用于解决第一次加载时要全部加载完毕才允许init操作
        esrOptions = {},
        routes = {},
        autoRender = {},        // 模拟MVVM双向绑定
        context = {},

        currLocation = '',
        pauseStatus,
        loadStatus = {},
        engine = etpl,
        requestVersion = 0,     // 请求的版本号，主路由切换时会更新，在多次提交时保证只有最后一次提交会触发渲染

        metaVersion,
        meta,

        currLayer,
        currRouteName,
        currRouteWeight,
        currHistory,

        unloadNames = [],
        waitRender,
        waitDeleteModule = [],

        historyOffset = 0,
        historyCache = [];
/*ignore*/
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
/*end*/
    /**
     * 渲染结束事件的处理。
     * @private
     *
     * @param {object} route 路由对象
     */
    function afterrender(route) {
        //移动端局部刷新不触发动画，主路由切换在路由渲染完成后触发动画
        if (esrOptions.app) {
            if (!context.CHILD) {
                transition(route);
            }
        }

        var layer = getLayer(route);
        if (layer) {
            layer.location = currLocation;
        }

        if (route.CACHE === undefined) {
            // 位于层内且不在公共层，缓存数据
            route.CACHE = true;
        }

        if (esr.onafterrender) {
            esr.onafterrender(context);
        }

        if (route.onafterrender) {
            try {
                route.onafterrender(context);
            } catch (e) {
                if (esr.onexception) {
                    esr.onexception(e);
                }
            }
        }

        autoChildRoute(route);
        if (!route.NAME) {
            // 缺省路由
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
            (route.children instanceof Array ? route.children : [route.children]).forEach(function (item) {
                if (typeof item === 'string') {
                    esr.callRoute(replace(item), true);
                } else {
                    callRoute(item, true);
                }
            });
        }

        callRouteComplete();
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
                // 避免id重名警告
                core.dispose(el, true);
//{/if}//
                core.$('AppBackupContainer').id = 'AppCommonContainer';
                el.id = 'AppBackupContainer';
            }
        }

        if (esr.onbeforerender) {
            esr.onbeforerender(context);
        }

        if (route.onbeforerender) {
            try {
                route.onbeforerender(context);
            } catch (e) {
                if (esr.onexception) {
                    esr.onexception(e);
                }
            }
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
        // 供onready时使用，此时name为route
        if (typeof name === 'string') {
            name = calcUrl(name);

            var route = routes[name],
                moduleName = getModuleName(name);
            if (options !== true) {
                context = {};
            }
        } else {
            route = name;
        }

        if (route) {
            if (options !== true) {
                Object.assign(context, options);
                // 主路由进入页面时，添加请求头里面添加 x-enter-page-sign 字段，提供给后端做防止连点作弊操作。
                if (!esr.headers) {
                    esr.headers = {};
                }
                esr.headers['x-enter-page-sign'] = Date.now() + '' + Math.round(Math.random() * 10000);
            }

            var layer = getLayer(route);
            if (context.DENY_CACHE !== true) {
                if (isCached(route) && layer && layer.location === currLocation) {
                    // 临时处理一下，等build改了之后需删除
                    waitDeleteModule.forEach(function (module) {
                        dom.removeClass(document.body, 'module-' + module.slice(0, -1));
                    });
                    waitDeleteModule = [];
                    // 使用getModuleName,保证增加的是最新的模块样式
                    dom.addClass(document.body, 'module-' + getModuleName(currLocation).slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_'));
                    // 数据必须还在才触发缓存
                    // 模块发生变化，缓存状态下同样更换引擎
                    engine = loadStatus[getModuleName(route.NAME)] || etpl;
                    // 添加oncached事件，在路由已经cache的时候依旧执行
                    if (esrOptions.app) {
                        if (!context.CHILD) {
                            transition(route);
                        }
                    }
                    if (route.oncached) {
                        try {
                            route.oncached(context);
                        } catch (e) {
                            if (esr.onexception) {
                                esr.onexception(e);
                            }
                        }
                    }
                    //当骨架屏缓存，骨架屏的所有子路由也会被缓存
                    if (route.TYPE === 'frame' && route.children.oncached) {
                        try {
                            route.children.oncached(context);
                        } catch (e) {
                            if (esr.onexception) {
                                esr.onexception(e);
                            }
                        }
                    }
                    return;
                }
            } else {
                // 解决A标签下反复修改的问题
                var loc = esr.getLocation().replace('~DENY_CACHE', '');
/*ignore*/
                if (ieVersion < 7) {
                    if (historyIndex > 1) {
                        // IE第一次进入，不能back，否则会退出框架
                        pauseStatus = true;
                        history.back();
                        var handle = util.timer(
                            function () {
                                if (!/~DENY_CACHE/.test(location.href)) {
                                    esr.setLocation(loc);
                                    pauseStatus = false;
                                    handle();
                                }
                            },
                            -10
                        );
                    } else {
                        esr.setLocation(loc);
                    }
                } else {
/*end*/
                    pauseStatus = true;
                    setLocation(loc);
                    util.timer(
                        function () {
                            location.replace('#' + loc);
                            pauseStatus = false;
                        },
                        100
                    );
/*ignore*/
                }
/*end*/
                route.CACHE = undefined;
            }

            if (!routeRequestCount && context.DENY_LOADING !== true) {
                dom.addClass(document.body, 'ui-loading');
            }
            routeRequestCount++;

            if (!route.onrender || route.onrender() !== false) {
                if (!route.model) {
                    esr.render(route);
                } else if (typeof route.model === 'function') {
                    if (route.onbeforerequest) {
                        try {
                            route.onbeforerequest(context);
                        } catch (e) {
                            if (esr.onexception) {
                                esr.onexception(e);
                            }
                        }
                    }
                    if (
                        route.model(
                            context,
                            function () {
                                esr.render(route);
                            }
                        ) !== false
                    ) {
                        esr.render(route);
                    }
                } else if (!route.model.length) {
                    esr.render(route);
                } else {
                    if (route.onbeforerequest) {
                        try {
                            route.onbeforerequest(context);
                        } catch (e) {
                            if (esr.onexception) {
                                esr.onexception(e);
                            }
                        }
                    }
                    esr.request(
                        route.model,
                        function () {
                            esr.render(route);
                        },
                        function (err) {
                            err = (route.onerror || esr.onrequesterror || util.blank)(err);

                            // 出错需要清除缓存
                            if (route.CACHE !== false) {
                                route.CACHE = undefined;
                            }

                            if (err === false) {
                                // err 为 false 阻止后续的渲染操作
                                callRouteComplete();
                            }

                            return err;
                        }
                    );
                }
            }
        } else {
            var namespace = '_' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_');
            if (core.ns[namespace]) {
                if (!core.ns[namespace].ui) {
                    core.ns[namespace].ui = {};
                }
                if (!core.ns[namespace].data) {
                    core.ns[namespace].data = {};
                }
            } else {
                core.ns[namespace] = {ui: {}, data: {}};
            }

            pauseStatus = true;
            io.loadScript(
                moduleName + '_define_.js',
                {
                    cache: true,
                    onsuccess: function () {
                        pauseStatus = false;
//{if 0}//
                        if (!routes[name]) {
                            throw new Error('The route(' + name + ') is not defined.');
                        }
//{/if}//
                        callRoute(name, options);
                    },
                    onerror: function () {
                        // 其他浏览器失败
                        pauseStatus = false;
                    }
                }
            );
        }
    }

    /**
     * 路由请求完成。
     * @private
     */
    function callRouteComplete() {
        routeRequestCount--;
        if (!routeRequestCount) {
            dom.removeClass(document.body, 'ui-loading');
            delete context.DENY_CACHE;
        }
    }

    /**
     * 使用指定的数据回填form表单。
     * @private
     *
     * @param {HTMLForm} form 表单元素
     * @param {object} data 用于回填的数据
     * @param {string} prefix 数据项前缀
     */
    function fillForm(form, data, prefix) {
        function fillCheckedByArray(item) {
            item = item.getControl();
            if (value.indexOf(item.getFormValue()) >= 0) {
                item.setChecked(true);
                item.saveToDefault();
            }
        }

        function fillValueByArray(item, index) {
            var control = item.getControl();
            control.setValue(value[index] || '');
            control.saveToDefault();
        }

        function fillCheckedElByArray(item) {
            if (value.indexOf(item.value) >= 0) {
                item.defaultChecked = item.checked = true;
            }
        }

        function fillValueElByArray(item, index) {
            item.defaultValue = item.value = value[index] || '';
        }

        function fillCheckedByValue(item) {
            item = item.getControl();
            if (item.getFormValue() === value) {
                item.setChecked(true);
                item.saveToDefault();
            }
        }

        function fillCheckedElByValue(item) {
            if (item.value === value) {
                item.defaultChecked = item.checked = true;
            }
        }

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key],
                    elements = form[prefix + key],
                    el,
                    control = null;

                if (elements) {
                    if (elements.length) {
                        elements = dom.toArray(elements);
                        el = elements[0];
                    } else {
                        el = elements;
                        elements = [el];
                    }

                    if (el.getControl) {
                        control = el.getControl();
                    }
                } else {
                    elements = [];
                    el = {};
                }

                if (value instanceof Array) {
                    if (control) {
                        if (control.isFormChecked) {
                            elements.forEach(fillCheckedByArray);
                        } else {
                            // eslint-disable-next-line no-lonely-if
                            if (elements.length === 1 && control.getFormValue() instanceof Array) {
                                control.setValue(value);
                            } else {
                                elements.forEach(fillValueByArray);
                            }
                        }
                    } else {
                        // eslint-disable-next-line no-lonely-if
                        if (el.type === 'radio' || el.type === 'checkbox') {
                            elements.forEach(fillCheckedElByArray);
                        } else {
                            elements.forEach(fillValueElByArray);
                        }
                    }
                } else if (value instanceof Object) {
                    if (control) {
                        control.setValue(value);
                    } else {
                        fillForm(form, value, key + '.');
                    }
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (control) {
                        if (control.isFormChecked) {
                            if (elements && elements.length > 0) {
                                elements.forEach(fillCheckedByValue);
                            }
                        } else {
                            // eslint-disable-next-line no-lonely-if
                            if (control.setValue) {
                                control.setValue(String(value));
                            }
                        }
                    } else {
                        // eslint-disable-next-line no-lonely-if
                        if (el.type === 'radio' || el.type === 'checkbox') {
                            elements.forEach(fillCheckedElByValue);
                        } else {
                            el.defaultValue = el.value = value;
                        }
                    }
                }
            }
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
        for (var el = core.$(route.main); el; el = el.parentElement) {
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
        if (!routeRequestCount) {
            if (ieVersion < 8) {
                var iframe = document.createElement('iframe');

                iframe.id = 'ECUI_LOCATOR';
                iframe.src = 'about:blank';

                document.body.appendChild(iframe);
                setInterval(listener, 100);
            } else {
                // eslint-disable-next-line no-lonely-if
                if (window.onhashchange !== undefined) {
                    dom.addEventListener(window, 'hashchange', listener);
                    listener();
                } else {
                    setInterval(listener, 100);
                }
            }

            hasReady = true;
        }
    }

    /**
     * 判断路由是否被缓存。
     * @private
     *
     * @param {object} route 路由对象
     */
    function isCached(route) {
        if (route.TYPE === 'frame') {
            if (route.CACHE !== null) {
                route.children.CACHE = route.CACHE;
                route.CACHE = null;
            }

            return route.children.CACHE;
        }

        return route.CACHE;
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
        // 软键盘弹出的时候，阻止直接渲染路由，避免h5页面出现gpu计算导致页面滚动到指定位置，有部分白页的问题
        if (pauseStatus || (core.getKeyboardHeight && core.getKeyboardHeight() > 0)) {
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
                document.activeElement.blur();

                if (currLocation) {
                    if (!/~ALLOW_LEAVE(~|$)/.test(loc)) {
                        if (leaveUrl) {
                            history.go(/~HISTORY=(\d+)/.test(loc) ? historyIndex - +RegExp.$1 : -1);
                            return;
                        }

                        if (leaveUrl === undefined) {
                            var currRoute = esr.getRoute(currLocation.split('~')[0]),
                                ret;
                            // 需要判断是不是showSelect中返回的
                            if (!/~ALLOW_LEAVE(~|$)/.test(currLocation) && currRoute && currRoute.onleave) {
                                ret = currRoute.onleave(
                                    context,
                                    function (forward) {
                                        if (forward) {
                                            history.go(/~HISTORY=(\d+)/.test(leaveUrl) ? +RegExp.$1 - historyIndex : 1);
                                            leaveUrl = '';
                                        } else {
                                            leaveUrl = undefined;
                                        }
                                    }
                                );

                                if (typeof ret === 'boolean') {
                                    if (!ret) {
                                        leaveUrl = loc;
                                    }
                                    history.go(/~HISTORY=(\d+)/.test(loc) ? historyIndex - +RegExp.$1 : -1);
                                    return;
                                }
                            }
                        }
                    }
                }

                if (document.body.classList.contains('ui-loading')) {
                    if (currLocation.replace(/~(HISTORY=(\d+))/, '') === loc.replace(/~(ALLOW_LEAVE|DENY_CACHE|HISTORY=(\d+))/g, '')) {
                        history.back();
                        return;
                    }
                }

                if (core.hasMessageBox()) {
                    core.closeMessageBox();
                }

                leaveUrl = undefined;
                unloadNames.forEach(function (name) {
                    delete loadStatus[name];
                    name = '/' + name;
                    dom.toArray(document.getElementsByTagName('STYLE')).forEach(function (item) {
                        if (item.getAttribute('module') === name) {
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
                historyIndex++;

                if (!esrOptions.history) {
                    setLocation(loc);
                    location.replace('#' + loc);
                    esr.callRoute(loc);
                } else if (/~HISTORY=(\d+)/.test(loc)) {
                    historyIndex = +RegExp.$1;
/*ignore*/
                    // ie下使用中间iframe作为中转控制
                    // 其他浏览器直接调用控制器方法
                    if (!addIEHistory(loc)) {
/*end*/
                        setLocation(loc);
                        esr.callRoute(loc);
/*ignore*/
                    }
/*end*/
                } else {
                    historyCache = historyCache.slice(0, historyIndex - historyOffset - 1);
                    loc += '~HISTORY=' + historyIndex;
/*ignore*/
                    if (ieVersion < 7) {
                        if (historyIndex > 1) {
                            // IE第一次进入，不能back，否则会退出框架
                            pauseStatus = true;
                            history.back();
                            var handle = util.timer(
                                function () {
                                    if (/~HISTORY=(\d+)/.test(location.href)) {
                                        esr.setLocation(loc);
                                        esr.callRoute(loc);
                                        pauseStatus = false;
                                        handle();
                                    }
                                },
                                -10
                            );
                        } else {
                            esr.setLocation(loc);
                            esr.callRoute(loc);
                        }
                        return;
                    }
/*end*/
                    pauseStatus = true;
                    util.timer(
                        function () {
                            location.replace('#' + loc);
                            pauseStatus = false;
/*ignore*/
                            // ie下使用中间iframe作为中转控制
                            // 其他浏览器直接调用控制器方法
                            if (!addIEHistory(loc)) {
/*end*/
                                setLocation(loc);
                                esr.callRoute(loc);
/*ignore*/
                            }
/*end*/
                        },
                        100
                    );
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
        if (waitRender) {
            waitRender.push(function () {
                render(route, name);
            });
            return;
        }
        beforerender(route);

        var el = core.$(route.main);

        el.style.visibility = 'hidden';
        waitDeleteModule.forEach(function (module) {
            dom.removeClass(document.body, 'module-' + module.slice(0, -1));
        });
        waitDeleteModule = [];
        // 使用getModuleName,保证增加的是最新的模块样式
        var className = 'module-' + getModuleName(currLocation).slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_');
        if (!document.body.classList.contains(className)) {
            dom.addClass(document.body, className);
        }
        if (el.route) {
            var elRoute = routes[el.route];
            dom.removeClass(el, elRoute.NAME.slice(1).replace(/[._]/g, '-').replace(/\//g, '_'));

            var index = el.history - historyOffset - 1;
            if (isCached(elRoute)) {
                if (index >= esrOptions.cache) {
                    historyCache = historyCache.slice(index + 1 - esrOptions.cache);
                    historyOffset += index + 1 - esrOptions.cache;
                } else if (index < 0) {
                    var list = [];
                    list[-index - 1] = undefined;
                    historyCache = list.concat(historyCache.slice(0, esrOptions.cache + index));
                    historyOffset += index;
                }
                var data = historyCache[el.history - historyOffset - 1] = {NAME: elRoute.NAME};
                if (elRoute.form) {
                    (elRoute.form instanceof Array ? elRoute.form : [elRoute.form]).forEach(function (item) {
                        esr.parseObject(document.forms[item], data[item] = {});
                    });
                }
            } else {
                // eslint-disable-next-line no-lonely-if
                if (index >= 0 && index < historyCache.length) {
                    historyCache[index] = {};
                }
            }

            if (elRoute.ondispose) {
                elRoute.ondispose();
            }
            el.route = null;
        }
        dom.toArray(el.all || el.getElementsByTagName('*')).forEach(function (item) {
            if (item.route && routes[item.route].ondispose) {
                routes[item.route].ondispose();
            }
        });

        core.dispose(el, true);

//{if 1}//        el.innerHTML = engine.render(name || route.view, context).replace(/([^A-Za-z0-9_])NS\./g, '$1ecui.ns._' + getModuleName(currLocation).replace(/[._]/g, '-').replace(/\//g, '_') + '.');
//{else}//
        el.innerHTML = engine.render(name || route.view, context);
//{/if}//
        if (route.NAME) {
            el.route = route.NAME;
            el.history = historyIndex;
            dom.addClass(el, route.NAME.slice(1).replace(/[._]/g, '-').replace(/\//g, '_'));

            core.init(el);

            if (route.form && context.DENY_CACHE !== true) {
                index = historyIndex - historyOffset - 1;
                if (index >= 0) {
                    data = historyCache[index];
                    if (!data) {
                        historyCache.forEach(function (item) {
                            if (item.NAME === route.NAME) {
                                data = item;
                            }
                        });
                    }
                    if (data) {
                        (route.form instanceof Array ? route.form : [route.form]).forEach(function (item) {
                            fillForm(document.forms[item], data[item] || {}, '');
                        });
                    }
                }
            }
        } else {
            core.init(el);
        }

        el.style.visibility = '';
        afterrender(route);
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

            rule = rule.replace(
                /\$\{([^}]+)\}/g,
                function (match, name) {
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
                }
            );

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
            if (value instanceof Array) {
                Array.prototype.push.apply(scope[list[i]], value);
            } else {
                scope[list[i]].push(value);
            }
        } else {
            scope[list[i]] = value;
        }
    }

    /**
     * 设置当前的 location。
     * @private
     *
     * @param {string} loc 当前的loc
     */
    function setLocation(loc) {
        var oldModule = getModuleName(currLocation),
            newModule = getModuleName(loc);
        if (!currLocation || oldModule !== newModule) {
            // 在切换时候可能会出现样式冲突,PC临时解决方案，后续理一下，移动端和pc统一方案解决
            if (!esrOptions.app && loadStatus[newModule]) {
                waitDeleteModule = [];
                dom.removeClass(document.body, 'module-' + oldModule.slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_'));
               // dom.addClass(document.body, 'module-' + newModule.slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_'));
            } else {
                waitDeleteModule.push(oldModule);
            }
        }
        currLocation = loc;
    }

    /**
     * APP 层切换动画处理。
     * @private
     *
     * @param {object} route 路由对象，新的路由
     */
    function transition(route) {
        if (route.recursion && currRouteName === route.NAME) {
            var recursionEl = currLayer.getMain();
            recursionEl.insertAdjacentHTML('beforeBegin', recursionEl.outerHTML);
            recursionEl = recursionEl.previousSibling;
            [recursionEl].concat(dom.toArray(recursionEl.getElementsByTagName('*'))).forEach(function (item) {
                item.id = '';
            });
            currRouteName = '';
        }

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

                    var currLayerEl = recursionEl || currLayer.getMain(),
                        nextWeight = route.weight;

                    if (currLayerEl.header) {
                        currLayerEl.header.style.display = 'none';
                    }


                    if (currRouteWeight === nextWeight) {
                        currRouteWeight = currHistory;
                        nextWeight = historyIndex;
                    }

                    var position = currRouteWeight < nextWeight ? 1 : -1,
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

                    core.disable();
                    util.timer(function () {
                        core.enable();
                    }, 400);

                    if (!route.CACHE) {
                        dom.addClass(layerEl, 'ui-transition');
                    }

                    // 在动画过程中，恢复上一模块公共样式
                    // AppCommonContainer、AppBackupContainer、AppCommonContainer 等公共路由的挂载 dom 没有 route 属性
                    var moduleName = '',
                        currModuleName = '';
                    if (currLayerEl.route && layerEl.route) {
                        currModuleName = 'module-' + getModuleName(currLayerEl.route).slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_');
                        moduleName = 'module-' + getModuleName(layerEl.route).slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_');
                        dom.addClass(currLayerEl, currModuleName);
                    }
                    if (currModuleName !== moduleName) {
                        dom.removeClass(document.body, currModuleName);
                    }
                    effect.grade(
                        fn,
                        200,
                        {
                            from: currLayerEl,
                            to: layerEl
                        },
                        {
                            onstep: recursionEl ? util.blank : undefined,
                            onfinish: function () {
                                if (recursionEl) {
                                    dom.remove(recursionEl);
                                } else {
                                    currLayer.hide();
                                    currLayerEl.style.left = '';
                                }
                                if (currLayerEl.route) {
                                    dom.removeClass(currLayerEl, currModuleName);
                                }
                                currLayer = layer;
                                pauseStatus = false;
                                if (esrOptions.transition === 'cover') {
                                    core.mask();
                                }

                                // 在执行结束后，如果不同时common layer则隐藏from layer，并且去掉目标路由中的动画执行函数
                                dom.removeClass(layerEl, 'ui-transition');

                                var renders = waitRender;
                                waitRender = null;
                                renders.forEach(function (item) {
                                    item();
                                });

                                if (route.ontransited) {
                                    route.ontransited();
                                }
                            }
                        }
                    );

                    // 动画过程中不进行渲染
                    waitRender = [];
                } else {
                    currLayer = layer;
                    if (route.ontransited) {
                        route.ontransited();
                    }
                }

                layerEl.header.style.display = '';
                layer.show();

                currRouteName = route.NAME;
                currRouteWeight = route.weight;
                currHistory = historyIndex;
            }
        }
    }

    var esr = core.esr = {
        DEFAULT_PAGE: '/index',
        DEFAULT_MAIN: 'main',

        // 用于创建空对象，参见request方法
        CreateObject: core.inherits(
            ui.FormInput,
            'ui-hide',
            {
                getFormValue: function () {
                    return {};
                }
            }
        ),

        // 用于创建空数组，参见request方法
        CreateArray: core.inherits(
            ui.FormInput,
            'ui-hide',
            {
                getFormValue: function () {
                    return [];
                }
            }
        ),

        // 用于创建空数组(复选框)，参见request方法
        CreateCheckedArray: core.inherits(
            ui.FormInput,
            'ui-hide',
            {
                getFormValue: function () {
                    return [];
                },
                isFormChecked: function () {
                    return true;
                }
            }
        ),

        // 布局层，用于加载结构
        AppLayer: core.inherits(ui.Control),

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

            route.view = route.view || name;
            if (name.charCodeAt(0) !== 47) { // '/'字符
                name = '/' + (hasReady ? getModuleName(esr.getLocation()) : '') + name;
            }
//{if 1}//            if (!route.main) {//{/if}//
//{if 1}//                var main = name.slice(1).replace(/[._]/g, '-').replace(/\//g, '_');//{/if}//
//{if 1}//                route.main = core.$(main) ? main : esr.DEFAULT_MAIN;//{/if}//
//{if 1}//            }//{/if}//
            if (route.alias) {
                route.NAME = calcUrl(route.alias);
                route.alias = name;
            } else {
                route.NAME = name;
            }

            if (esrOptions.app && route.weight === undefined) {
                route.weight = name.split(/[\/.]/).length - 2;
            }

            if (delegateRoutes[name]) {
                delegateRoutes[name].forEach(function (item) {
                    route[item.name] = item.value;
                });
                delete delegateRoutes[name];
            }

            if (route.frame) {
                routes[name] = {
                    NAME: route.NAME,
                    TYPE: 'frame',
                    recursion: route.recursion,
                    weight: route.weight,
                    main: route.main,
                    view: route.view,
                    children: route,
                    CACHE: null
                };
                delete route.recursion;
            } else {
                routes[name] = route;
            }
        },

        /**
         * 允许在 messagebox 处理的时候前进后退。
         * @public
         */
        allowLeave: function () {
            leaveUrl = undefined;
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
                context.CHILD = true;
            } else {
                routeRequestCount = 0;
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
                    context[key] = oldOptions[key];
                }
            }
            list.sort().splice(0, 0, url);
            esr.setLocation(list.join('~'));

            if (name) {
/*ignore*/
                if (!addIEHistory(currLocation)) {
/*end*/
                    // change以子路由的方式调用
                    callRoute(name, true);
/*ignore*/
                }
/*end*/
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
         * 使用指定的数据回填form表单。
         * @public
         *
         * @param {HTMLForm} form 表单元素
         * @param {object} data 用于回填的数据
         */
        fillForm: function (form, data) {
            fillForm(form, data, '');
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
            for (; el; el = el.parentElement) {
                if (el.route) {
                    var route = routes[el.route];
                    return route.TYPE === 'frame' ? route.children : route;
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
            if (moduleName === undefined) {
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
                // eslint-disable-next-line no-cond-assign
                if (hash = location.href.match(/#(.*)$/)) {
                    return hash[1];
                }
            // eslint-disable-next-line no-cond-assign
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
            var route = routes[calcUrl(name)];
            return route.TYPE === 'frame' ? route.children : route;
        },
//{if 0}//
        /**
         * 获取全部的路由信息，仅在DEV阶段有效。
         * @public
         *
         * @return {object} 全部路由信息
         */
        getRoutes: function () {
            return routes;
        },
//{/if}//
        /**
         * 跳转到指定的历史索引。
         * @public
         *
         * @param {number} index 历史索引号
         */
        go: function (index) {
            /~HISTORY=(\d+)/.test(currLocation);
            history.go(index - +RegExp.$1);
        },

        /**
         * 将一个 Form 表单转换成对象。
         * @public
         *
         * @param {Form} form Form元素
         * @param {object} data 数据对象
         * @param {boolean} validate 是否需要校验，默认校验
         * @param {boolean} useDefault 是否读取默认值而不是当前值，默认读取当前值
         * @return {boolean} 校验是否通过
         */
        parseObject: function (form, data, validate, useDefault) {
            var elements = dom.toArray(form.elements),
                firstUnvalid;

            elements.forEach(function (item) {
                if (item.getControl) {
                    var control = item.getControl();
                }
                if (validate !== false && item.name && control && !control.isDisabled()) {
                    if (control.validate && !control.validate()) {
                        if (!firstUnvalid) {
                            firstUnvalid = item;
                        }
                    }
                }
                if (item.name) {
                    if (control) {
                        if (control.getFormName && control.getFormValue && !control.isDisabled() && (!control.isFormChecked || control.isFormChecked(useDefault))) {
                            var formName = control.getFormName(),
                                formValue = control.getFormValue(useDefault);

                            if (formName) {
                                setCacheData(data, formName, formValue);
                            } else if (formName !== undefined) {
                                for (var key in formValue) {
                                    if (formValue.hasOwnProperty(key)) {
                                        setCacheData(data, key, formValue[key]);
                                    }
                                }
                            }
                        }
                    } else if (item.type === 'file') {
                        setCacheData(data, item.name, item.files);
                    } else if (!item.disabled && ((item.type !== 'radio' && item.type !== 'checkbox') || (useDefault ? item.defaultChecked : item.checked))) {
                        setCacheData(data, item.name, useDefault ? item.defaultValue : item.value);
                    }
                }
            });

            if (firstUnvalid) {
                dom.scrollIntoViewIfNeeded(firstUnvalid.getControl().getMain());
                return false;
            }
            if (!useDefault && validate !== false) {
                ui.abstractInput.saveToDefault(elements);
            }
            return true;
        },

        /**
         * 控制定位器转向。
         * @private
         *
         * @param {string} loc location位置
         * @param {boolean} denyHistory 清除缓存重定向
         */
        redirect: function (loc, denyHistory) {
            if (esrOptions.history && !denyHistory) {
                location.hash = calcUrl(loc);
            } else {
                location.replace('#' + calcUrl(loc));
            }
        },

        /**
         * 重新加载当前链接，逻辑上等价于location.reload()，但不会重新加载整个框架资源。
         * @public
         */
        reload: function () {
            esr.callRoute(currLocation);
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
                        engine.setNamespace(core.ns['_' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_')].data);
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
            } else if (typeof route.view === 'function') {
                beforerender(route);
                if (
                    route.view(
                        context,
                        function (name) {
                            if (name) {
                                render(route, name);
                            } else {
                                afterrender(route);
                            }
                        }
                    ) !== false
                ) {
                    afterrender(route);
                }
            } else if (etpl.getRenderer(route.view)) {
                render(route);
            } else {
                var moduleName = getModuleName(route.NAME);
                engine = loadStatus[moduleName];
                if (engine instanceof etpl.Engine && engine.getRenderer(route.view)) {
                    // 如果在当前引擎找不到模板，有可能是主路由切换，也可能是主路由不存在
                    render(route);
                } else {
                    // eslint-disable-next-line no-lonely-if
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
            function getFormDataForArray(formData, name, array) {
                array.forEach(function (item) {
                    if (item instanceof File) {
                        formData.append(name, item);
                    } else if (typeof item === 'object') {
                        getFormData(formData, item, name + '.');
                    } else {
                        formData.append(name, item);
                    }
                });
            }

            function getFormData(formData, scope, prefix) {
                for (var name in scope) {
                    if (scope.hasOwnProperty(name)) {
                        var item = scope[name];
                        if (item instanceof Array) {
                            getFormDataForArray(formData, prefix + name, item);
                        } else if (item instanceof FileList) {
                            getFormDataForArray(formData, prefix + name, Array.prototype.slice.call(item));
                        } else if (typeof item === 'object') {
                            getFormData(formData, item, prefix + name + '.');
                        } else {
                            formData.append(prefix + name, item);
                        }
                    }
                }
            }

            function setMeta() {
//{if 1}//                util.setLocalStorage('esr_meta', meta, function () {//{/if}//
//{if 1}//                    util.setLocalStorage('esr_meta_version', metaVersion);//{/if}//
//{if 1}//                });//{/if}//
                esr.setData('META', meta);
            }

            function request(varUrl, varName) {
                var method = varUrl.split(' '),
                    headers = {},
                    xhrFields = {};

                if (esr.headers) {
                    Object.assign(headers, esr.headers);
                }
                if (esr.xhrFields) {
                    Object.assign(xhrFields, esr.xhrFields);
                }

                if (esrOptions.meta && metaVersion) {
                    headers['x-meta-tag'] = metaVersion;
                }

                var isFormDefault = method[0] === 'FORM:DEFAULT' ? true : (method[0] === 'FORM' || method[0] === 'FORM:GET') ? false : undefined;
                if (method[0] === 'JSON' || isFormDefault !== undefined) {
                    var url = method[1].split('?'),
                        data = {},
                        valid = true,
                        isApplicationJson = true;

                    url[1].split('&').forEach(function (item) {
                        item = item.split('=');
                        if (item.length > 1) {
                            setCacheData(data, item[0], replace(decodeURIComponent(item[1])));
                        } else if (method[0].indexOf('FORM') === 0) {
                            var form = document.forms[item[0]];
                            if (form) {
                                if (form.getAttribute('enctype') === 'multipart/form-data') {
                                    isApplicationJson = false;
                                }
                                valid = esr.parseObject(form, data, true, isFormDefault) && valid;
                            }
                        } else {
                            Object.assign(data, replace(item[0]));
                        }
                    });

                    if (isApplicationJson) {
                        headers['Content-Type'] = 'application/json;charset=UTF-8';
                    }
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
                    if (isApplicationJson) {
                        data = JSON.stringify(data);
                    } else {
                        var formData = new FormData();
                        getFormData(formData, data, '');
                        data = formData;
                    }
                } else if (method[0] === 'POST') {
                    url = method[1].split('?');
                    method = 'POST';
                    data = replace(url[1]);
                    url = url[0];
                } else {
                    url = replace(method[method.length === 1 ? 0 : 1]);
                    method = 'GET';
                }
                if (esr.getBodyData) {
                    esr.getBodyData(data, headers, url);
                }
                io.ajax(replace(url, true), {
                    method: method,
                    headers: headers,
                    xhrFields: xhrFields,
                    timeout: esr.timeout,
                    data: data,
                    onsuccess: function (text, xhr) {
                        function deepAssign(data, obj) {
                            for (var key in obj) {
                                if (obj.hasOwnProperty(key)) {
                                    if (obj[key] === null) {
                                        // 空指针数据表示需要删除
                                        delete data[key];
                                    } else if (Array.isArray(obj[key])) {
                                        // 如果是数组因为序号无法对齐需要直接复制
                                        data[key] = obj[key];
                                    } else if (typeof obj[key] === 'object') {
                                        data[key] = data[key] || {};
                                        deepAssign(data[key], obj[key]);
                                    } else {
                                        data[key] = obj[key];
                                    }
                                }
                            }
                            return data;
                        }

                        count--;
                        try {
                            // eslint-disable-next-line no-shadow
                            var data = JSON.parse(text),
                                header = xhr.getResponseHeader('x-meta-tag'),
                                key;

                            // 元数据管理
                            if (esrOptions.meta) {
                                if (header === 'unknown') {
                                    metaUpdate = true;
                                } else if (data.meta) {
                                    if (header) {
                                        metaVersion = header;
                                    }
                                    deepAssign(meta, data.meta);
                                    setMeta();
                                } else {
                                    context.META = meta;
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
                                    onafterrequest();
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
                                onafterrequest();
                                return;
                            }
                            onsuccess();
                        }
                    }
                });
            }

            if (typeof urls === 'string') {
                urls = [urls];
            }

            var count = urls.length;
            if (count) {
                var err = [],
                    metaUpdate,
                    callback = onsuccess || util.blank,
                    errorCallback = onerror || util.blank,
                    onafterrequest = function () {
                        if (requestVersion === version && esr.onafterrequest) {
                            esr.onafterrequest(context);
                        }
                    },
                    handle = function () {
                        callback();
                        onafterrequest();
                    },
                    version = requestVersion;

                onsuccess = function () {
                    if (metaUpdate) {
                        metaUpdate = false;
                        // 元数据管理
                        io.ajax(
                            esrOptions.meta,
                            {
                                onsuccess: function (text, xhr) {
                                    metaVersion = xhr.getResponseHeader('x-meta-tag');
                                    meta = JSON.parse(text);
                                    setMeta();
                                    handle();
                                },
                                onerror: function () {
                                    if (onerror(err) === false) {
                                        onafterrequest();
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

                onerror = function (err) {
                    var res = errorCallback(err);
                    if (esr.onrequesterror) {
                        esr.onrequesterror(err);
                    }
                    return res;
                };

                if (esr.onbeforerequest) {
                    esr.onbeforerequest(context);
                }

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
                if (esrOptions.history) {
                    location.hash = loc;
                } else {
                    location.replace('#' + loc);
                }
            }
            setLocation(loc);
        },

        /**
         * 显示选择框。
         * @public
         *
         * @param {ecui.ui.Control|string} content 选择框对应的控件或HTML片断
         * @param {ecui.ui.Control} onconfirm 操作成功后执行回调的函数
         * @param {object|string} options 选择框参数，如果是字符串表示选择框标题
         */
        showSelect: function (content, onconfirm, options) {
            if (esrOptions.app) {
                if (typeof options === 'string') {
                    options = {
                        title: options
                    };
                } else if (!options) {
                    options = {};
                }

                var container = core.$('AppSelectContainer'),
                    layer = core.findControl(container),
                    lastLocation = esr.getLocation(),
                    parentElement,
                    nextSibling;

                core.addEventListener(
                    layer,
                    'confirm',
                    function (event) {
                        if (onconfirm) {
                            onconfirm(event);
                        }
                        history.back();
                    }
                );
                core.addEventListener(
                    layer,
                    'hide',
                    function () {
                        if (content) {
                            if (content instanceof ui.Control) {
                                content.setParent();
                            } else if (typeof content === 'string') {
                                core.dispose(container, true);
                                container.innerHTML = '';
                            } else {
                                // eslint-disable-next-line no-lonely-if
                                if (parentElement) {
                                    parentElement.insertBefore(content, nextSibling);
                                }
                            }
                            content = null;
                        }
                        core.removeControlListeners(core.findControl(container));
                    }
                );

                esr.setData('AppSelectTitle', options.title || '');

                if (content) {
                    if (content instanceof ui.Control) {
                        content.setParent(layer);
                    } else if (typeof content === 'string') {
                        container.innerHTML = content;
                        core.init(container);
                    } else {
                        parentElement = content.parentElement;
                        nextSibling = content.nextSibling;
                        container.appendChild(content);
                    }
                }

                var route = {
                    NAME: 'AppSelect',
                    main: 'AppSelectContainer'
                };
                if (options.route !== false) {
                    esr.setLocation(lastLocation.split('~')[0] + '~ALLOW_LEAVE');
                    route.weight = 10000;
                    transition(route);
                } else {
                    // 关闭路由模式需要禁止动画直接切换
                    route.weight = currRouteWeight;
                    if (waitRender) {
                        waitRender.push(function () {
                            transition(route);
                        });
                    } else {
                        transition(route);
                    }
                }
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
            function loadInit(body) {
                if (esrOptions.app) {
                    var el = core.$('AppCommonContainer');
                    el.id = 'AppBackupContainer';
                    el.insertAdjacentHTML('afterEnd', el.previousElementSibling.outerHTML + el.outerHTML);
                    el.id = 'AppCommonContainer';
                    var content = body.firstElementChild.lastElementChild,
                        header = content.previousElementSibling,
                        children = dom.children(el.parentNode).slice(0, -2);
                    for (var i = 1, item; (item = children[i]); i += 2) {
                        header.appendChild(item.header = children[i - 1]);
                        content.appendChild(item);
                        var first = item.firstChild;
                        if (first && first === item.lastChild && first.nodeType === 8) {
                            var moduleName = '_' + item.id.slice(0, item.id.lastIndexOf('_') + 1);
                            item.innerHTML = etpl.compile(first.textContent || first.nodeValue)({NS: (core.ns[moduleName] || {}).data}).replace(/([^A-Za-z0-9_])NS\./g, '$1ecui.ns.' + moduleName + '.');
                        }
                    }

                    el = core.$((esr.getLocation().split('~')[0].slice(1) || esr.DEFAULT_PAGE.slice(1)).replace(/[._]/g, '-').replace(/\//g, '_'));
                    if (el) {
                        dom.removeClass(el, 'ui-hide');
                        el.header.style.display = '';
                    }
                }

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

            esrOptions = JSON.parse('{' + decodeURIComponent(value.replace(/(\w+)\s*=\s*([^,]+)\s*($|,)/g, '"$1":"$2$3"')) + '}');

            esrOptions.history =/*ignore*/ ieVersion < 7 ||/*end*/ esrOptions.history !== 'false';
            esrOptions.cache = +esrOptions.cache || 1000;

            if (esrOptions.meta) {
                core.pause();
                core.pause();
                util.getLocalStorage('esr_meta_version', function (value) {
                    metaVersion = value || '';
                    core.resume();
                });
                util.getLocalStorage('esr_meta', function (value) {
                    meta = value || {};
                    core.resume();
                });
            }
//{if 0}//
            etpl.ready(function () {
                if (esrOptions.app) {
                    io.ajax('.app-container.html', {
                        cache: true,
                        onsuccess: function (text) {
                            var body = core.$('ECUI-FIXED-BODY') || document.body;
                            body.insertAdjacentHTML('afterBegin', text);
                            loadInit(body);
                            core.init(document.body);
                        },
                        onerror: function () {
                            console.warn('No such file for APP\'s layout: .app-container.html');
                            esrOptions.app = false;
                            loadInit(core.$('ECUI-FIXED-BODY') || document.body);
                            core.init(document.body);
                        }
                    });
                } else {
//{/if}//
                    loadInit(core.$('ECUI-FIXED-BODY') || document.body);
//{if 0}//
                }
            });
//{/if}//
            for (var i = 0, links = document.getElementsByTagName('A'), el; (el = links[i++]); i++) {
                if (el.href.slice(-1) === '#') {
                    el.href = JAVASCRIPT + ':void(0)';
                }
            }
        }
    };

    ext.data = {
        /**
         * esr数据名跟踪插件初始化。
         * @public
         *
         * @param {string} value 插件的参数，格式为 变量名@#模板名 或 变量名@js函数名 ，表示指定的变量变化时，需要刷新控件内部HTML
         * @param {object} options 初始化参数
         */
        constructor: function (value, options) {
            // eslint-disable-next-line no-cond-assign
            if (value = /^([\w,]+)((\*?@)(#[\w\.]*|[\w\.]*\(\)))?$/.exec(value)) {
                if (value[2]) {
                    if (value[4].charAt(0) !== '#') {
                        if (value[4].length === 2) {
                            var setData = util.decodeHTML(this.getContent().trim()),
                                renderer = new Function('$', setData.charAt(0) === '=' ? 'this.setContent(' + setData.slice(1) + ')' : setData);
                            this.setContent('');
                        } else {
                            renderer = util.parseValue(value[4].slice(0, -2));
                        }
                        setData = function (data) {
                            renderer.call(this, value[3].length > 1 ? context : data);
                        };
                    } else {
                        renderer = value[4].length < 2 ? engine.compile(this.getContent().replace(/\$([\w.]+)/g, '${$1}')) : engine.getRenderer(value[4].slice(1));
                        this.setContent('');
                        setData = function (data) {
//{if 0}//
                            this.setContent(renderer(value[3].length > 1 ? context : data).replace(/([^A-Za-z0-9_])NS\./g, '$1NS.ui.'));
//{else}//                            this.setContent(renderer(value[3].length > 1 ? context : data));
//{/if}//
                        };
                    }
                } else {
                    for (var i = 0, o; (o = ext.data.Custom[i++]);) {
                        if (this instanceof o.Class) {
                            renderer = o.init.call(this, options);
                            // eslint-disable-next-line no-loop-func
                            setData = function (data) {
                                o.setData.call(this, data, renderer);
                            };
                            break;
                        }
                    }
                }

                value[1] = value[1].split(',');
                value[1].forEach(
                    function (item) {
                        if (autoRender[item]) {
                            autoRender[item].push([this, setData]);
                        } else {
                            autoRender[item] = [[this, setData]];
                        }
                        if (context[item] !== undefined) {
                            setData.call(this, context[item]);
                        }
                    },
                    this
                );

                options = null;
            }
        },

        Events: {
            dispose: function () {
                for (var key in autoRender) {
                    if (autoRender.hasOwnProperty(key)) {
                        for (var i = 0, data; (data = autoRender[key][i]); i++) {
                            if (data[0] === this) {
                                autoRender[key].splice(i, 1);
                                break;
                            }
                        }
                    }
                }
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
            'DATA@GET ' + url,
            function () {
                try {
                    if (onsuccess) {
                        onsuccess(context.DATA);
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


    /**
     * 清空/重置 表单数据
     * @param {form}    form         表单元素
     */
    function resetFormValue(form) {
        var elements = form.elements;
        for (var i = 0, item; (item = elements[i++]);) {
            var name = item.name;
            if (name) {
                var _control = item.getControl && item.getControl();
                if (_control) {
                    if (_control instanceof ecui.ui.Radio) {
                        _control.setChecked(false);
                    } else if (_control instanceof ecui.ui.Checkbox) {
                        _control.setChecked(false);
                    } else if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                        // 如果是ecui.esr.CreateArray 和 ecui.esr.CreateObject元素，不做任何处理
                    } else {
                        _control.setValue('');
                    }
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (!ecui.item.classList.contains('ui-hide')) {
                        item.value = '';
                    }
                }
            }
        }
    }

    /**
     * 读取表单数据，补充 searchParam 中的参数，context、search 中没有的的字段，默认给空字符串
     * @param {form}    form         表单元素
     * @param {object} searchParam   路由的搜索数据
     * @param {object}  context      路由的上下文数据
     *
     */
    // eslint-disable-next-line no-shadow, no-unused-vars
    function replenishSearchCode(form, searchParam, context) {
        var data = {};
        ecui.esr.parseObject(form, data, false);
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (context[key] !== undefined) {
                    searchParam[key] = context[key];
                } else if (searchParam[key] === undefined) {
                    searchParam[key] = '';
                }
            }
        }
    }
    /**
     * 列表路由对象。
     * @public
     *
     * @param {object} route 路由对象
     */
    esr.TableListRoute = function (route) {
        var name = (route.NAME || route.name),
            model = route.model || [],
            url = route.url;

        name = name.slice(name.indexOf('/') === 0 ? 1 : 0);

        if (route.EXTDATA) {
            route._sPageUrl = name + '@FORM ' + url;
            route.view = function () {};
            route.main = route.main;
        } else {
            route._sPageUrl = name.slice(0, -5) + '@FORM ' + url;
            route.view = route.view || name;
            route.main = name.slice(0, -9) + '_table';
        }

        // eslint-disable-next-line no-shadow
        route.model = function (context, callback) {
            var _model = [].concat(model),
                _url = this._sPageUrl;
            if (context.FORMDEFAULT) {
                _url = _url.replace('@FORM', '@FORM:DEFAULT');
                delete context.FORMDEFAULT;
            }
            _url += (_url.indexOf('?') ? '' : '?') + '&pageNo=${pageNo}&pageSize=${pageSize}';
            // 添加在最前面，让后面的接口使用 FORM:DEFAULT 方式提交可以获取分页列表的查询参数
            _model.unshift(_url);
            ecui.esr.request(_model, callback);
            delete context.pageNo;
            delete context.pageSize;
            return false;
        };
        Object.assign(this, route);
    };

    esr.TableListRoute.prototype.pageNo = 1;
    esr.TableListRoute.prototype.pageSize = 10;
    // eslint-disable-next-line no-shadow
    esr.TableListRoute.prototype.onbeforerequest = function (context) {
        this.searchParam.pageNo = context.pageNo = +context.pageNo || this.searchParam.pageNo;
        this.searchParam.pageSize = context.pageSize = +context.pageSize || this.searchParam.pageSize;
    };
    esr.TableListRoute.prototype.getSearchForms = function () {
        var forms = this._sPageUrl.split('?')[1].split('&'),
            res = [];
        for (var i = 0, form, item; (item = forms[i++]);) {
            form = document.forms[item.split('=')[0]];
            if (item.split('=').length === 1 && form) {
                res.push(form);
            }
        }
        return res;
    };
    // eslint-disable-next-line no-shadow
    esr.TableListRoute.prototype.setSearchParams = function () {
        var forms = this._sPageUrl.split('?')[1].split('&'),
            searchParam = {
                pageNo: this.searchParam.pageNo,
                pageSize: this.searchParam.pageSize
            };
        for (var i = 0, form, item; (item = forms[i++]);) {
            form = document.forms[item.split('=')[0]];
            if (item.split('=').length === 1 && form) {
                esr.parseObject(form, searchParam, false, true);
            }
        }
        this.searchParam = searchParam;
    };
    // eslint-disable-next-line no-shadow
    esr.TableListRoute.prototype.onbeforerender = function (context) {
        var name = this._sPageUrl.split('@')[0];
        var data = util.parseValue(name, context);
        if (data.data) {
            data = data.data;
        }
        context[name + 'Page'] = util.formatString('{0},{1},{2},{3}', data.offset, data.total, data.pageSize, data.totalPage);
        this.setSearchParams();
        context.searchParam = this.searchParam;


        if (this.EXTDATA) {
            ecui.esr.setData(name + '_ext', data.record);
            ecui.esr.setData(name + 'Page_ext', Object.assign(data, { record: undefined }));
        }

    };
    esr.TableListRoute.prototype.resetFormValue = resetFormValue;

    /**
     * 列表查询按钮。
     * @public
     *
     * @param {object} route 路由对象
     */
    ui.QueryButton = core.inherits(
        ui.Button,
        'ui-query-button',
        function (el, options) {
            _super(el, options);
            this._sRoute = options.route;
        },
        {
            /**
             * 输入提交事件。
             * @event
             */
            $submit: function (event) {
                event.preventDefault();
            },
            $click: function (event) {
                _super.$click(event);
                var route = ecui.esr.findRoute(this),
                    routeName = this._sRoute || route.children || route.NAME,
                    children = ecui.esr.getRoute(routeName);
                children.searchParam = {};
                ecui.esr.parseObject(this.getForm(), children.searchParam);
                ecui.esr.callRoute(routeName + '~pageNo=1', true);
            }
        }
    );

})();
