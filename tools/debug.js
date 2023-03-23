(function () {
    /**
     * 动态加载模块，用于测试。
     * @public
     *
     * @param {string} name 模块名
     */
    var moduleName,
        moduleCallback,
        moduleLoads,
        loc = location.href + '#',
        waits = {},
        oldLoadScriptFn = function (url, callback, options) {
            if (nginx_debug) {
                options.onsuccess = callback;
                loadScript(url + '?ECUI_MODULE=_' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_'), options);
            } else {
                options.onsuccess = function (text) {
                    eval('(function(NS){' + text + '}(ecui.ns["_' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '"]));');
                    callback();
                };
                options.onerror = function () {
                    callback();
                };
                ecui.io.ajax(url, options);
            }
        };

    loc = loc.slice(0, loc.indexOf('#'));

    if (loc.slice(0, 5) === 'file:') {
        ecui.io.ajax = function (url, options) {
            ecui.dom.ready(function () {
                if (url.slice(0, 5) !== 'file:') {
                    url = loc.slice(0, loc.lastIndexOf('/') + (url.charAt(0) === '/' ? 0 : 1)) + url;
                }

                url = url.slice(7).split('?')[0];
                if (url.slice(-5) !== '.html') {
                    url += '.html';
                }

                if (waits[url]) {
                    waits[url].push(options.onsuccess);
                } else {
                    waits[url] = [options.onsuccess];
                }

                var el = document.createElement('IFRAME');
                el.id = url;
                el.src = url;
                el.style.cssText = 'position:absolute;width:1px;height:1px;left:-10px;top:-10px';
                document.body.appendChild(el);
            });
        };

        ecui.dom.addEventListener(window, 'message', function (event) {
            var url = event.data.url;
            if (waits[url]) {
                waits[url].forEach(function (item) {
                    item(
                        event.data.text,
                        {
                            getResponseHeader: function (name) {
                                return {
                                    'Last-Modified': new Date(1970, 0, 1).toString()
                                }[name];
                            }
                        }
                    );
                });
                delete waits[url];
                ecui.dom.remove(ecui.$(url));
            }
        });
    }

    function createStyle(cssText) {
        var el = document.createElement('STYLE'),
            index = cssText.indexOf('{');
        el.setAttribute('type', 'text/less');
        el.setAttribute('module', '/' + moduleName);
        if (ecui.ie < 10) {
            var reg = ecui.ie > 6 ? new RegExp('[_' + (ecui.ie > 7 ? '\\*\\+' : '') + ']\\w+:[^;}]+[;}]', 'g') : null;
            if (reg) {
                cssText = cssText.replace(reg, function (match) {
                    return match.slice(-1) === '}' ? '}' : '';
                });
            }
            el.setAttribute('lessText', cssText);
        } else {
            el.innerHTML = cssText;
        }
        document.head.appendChild(el);
    }

    var loadScript = ecui.io.loadScript;
    ecui.io.loadScript = function (url, options, flag) {
        if (flag) {
            return loadScript(url, options);
        }

        var name = url.split('/');

        if (name.pop() === '_define_.js') {
            moduleName = name.length ? name.join('/') + '/' : '';
            moduleCallback = options.onsuccess;
            moduleLoads = [['js', '_layer_.js']];

            ecui.io.ajax(moduleName + '_define_.css', {
                cache: true,
                onsuccess: function (cssText) {
                    var moduleClasses = document.body.className,
                        newModuleClass = 'module-' +moduleName.slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_');

                    document.body.className = moduleClasses.replace(/module-[^\s]*/g, '') + ' ' + newModuleClass;
                    createStyle('.' + newModuleClass + '{' + cssText + '}');
                    ecui.io.ajax(moduleName + '_define_.html', {
                        cache: true,
                        onsuccess: function (data) {
                            ecui.esr.getEngine(moduleName).setNamespace(ecui.ns['_' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_')].data);
                            ecui.esr.getEngine(moduleName).compile(data.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'));
                            oldLoadScriptFn.call(this, url, load, options);
                        },
                        onerror: function () {
                            ecui.esr.getEngine(moduleName).setNamespace(ecui.ns['_' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_')].data);
                            oldLoadScriptFn.call(this, url, load, options);
                        }
                    });
                },
                onerror: function () {
                    oldLoadScriptFn.call(this, url, load, options);
                }
            });
        } else {
            oldLoadScriptFn.call(this, url, options.onsuccess, options);
        }
    };

    var oldAddRoute = ecui.esr.addRoute;

    function load() {
        ecui.esr.addRoute = function (name, route) {
            if (!route) {
                route = name;
                name = route.NAME;
            }

            name = filename.slice(0, index + 1) + name;
            oldAddRoute.call(this, name, route);
        };

        function loadRoute(url) {
            oldLoadScriptFn(url + '.js', loadRouteCSS, {cache: true});

            function loadRouteCSS() {
                ecui.io.ajax(url + '.css', {
                    cache: true,
                    onsuccess: function (cssText) {
                        createStyle('.' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + filename.replace(/[._]/g, '-') + '{' + cssText + '}');

                        window.less.sheets = [];
                        window.less.refresh(true, undefined, false);

                        var stop = ecui.util.timer(function () {
                            if (document.head.lastChild.getAttribute('type') !== 'text/less') {
                                stop();
                                ecui.io.ajax(url + '.html', {
                                    cache: true,
                                    onsuccess: function (data) {
                                        if (index >= 0) {
                                            data = data.replace(/<!--\s*target:\s*([^>]+)-->/g, '<!-- target: ' + filename.slice(0, index + 1) + '$1 -->');
                                        }
                                        ecui.esr.getEngine(moduleName).compile(data.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'));
                                        load();
                                    },
                                    onerror: load
                                });
                            }
                        }, -1);
                    },
                    onerror: load
                });
            }
        }

        function loadLayer(url) {
            oldLoadScriptFn(url + '.js', loadLayerHTML, {cache: true, onerror: loadLayerHTML});

            function loadLayerHTML() {
                ecui.io.ajax(url + '.html', {
                    cache: true,
                    onsuccess: function (text) {
                        if (!text) {
                            load();
                            return;
                        }
                        if (!/^\s*<header(>|\s).*?<\/header>\s*<container(>|\s).*?<\/container>\s*$/.test(text.replace(/\n/g, ''))) {
                            throw new Error(url + ' 中只允许存在<header>与<container>标签');
                        }
                        text = text.replace('<header', '<div style="display:none"');
                        text = text.replace('<container', '<div ui="type:ecui.esr.AppLayer" style="display:none" id="' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + filename.replace(/[._]/g, '-') + '"');
                        text = text.replace('</header>', '</div>');
                        text = text.replace('</container>', '</div>');
                        var el = (ecui.$('ECUI-FIXED-BODY') || document.body).firstElementChild.lastElementChild;
                        el.insertAdjacentHTML('beforeEnd', etpl.compile(text.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'))(ecui.esr.getContext()));
                        el.previousElementSibling.appendChild(el.lastElementChild.header = el.lastElementChild.previousElementSibling);
                        ecui.init(el.parentNode);

                        ecui.io.ajax(url + '.css', {
                            cache: true,
                            // eslint-disable-next-line no-shadow
                            onsuccess: function (text) {
                                createStyle('#' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + filename.replace(/[._]/g, '-') + '{' + text + '}');

                                window.less.sheets = [];
                                window.less.refresh(true, undefined, false);

                                var stop = ecui.util.timer(function () {
                                    if (document.head.lastChild.getAttribute('type') !== 'text/less') {
                                        stop();
                                        load();
                                    }
                                }, -1);
                            },
                            onerror: load
                        });
                    },
                    onerror: load
                });
            }
        }

        if (!moduleLoads.length) {
            ecui.esr.addRoute = oldAddRoute;
            moduleCallback();
            return;
        }

        var filename = moduleLoads[0][1];
        var index = filename.lastIndexOf('.');

        // eslint-disable-next-line default-case
        switch (moduleLoads[0][0]) {
        case 'js':
            oldLoadScriptFn(moduleName + filename, load, {cache: true});
            break;
        case 'class':
            oldLoadScriptFn(moduleName + 'class.' + filename + '.js', load, {cache: true});
            break;
        case 'layer':
            loadLayer(moduleName + filename.slice(0, index + 1).replace(/\./g, '/') + 'layer.' + filename.slice(index + 1));
            break;
        case 'route':
            loadRoute(moduleName + filename.slice(0, index + 1).replace(/\./g, '/') + 'route.' + filename.slice(index + 1));
            break;
        }

        moduleLoads.splice(0, 1);
    }

    ecui.esr.loadClass = function (filename) {
        moduleLoads.push(['class', filename]);
    };
    ecui.esr.loadRoute = function (filename) {
        moduleLoads.splice(1, 0, ['layer', filename]);
        moduleLoads.push(['route', filename]);
    };

    var nginx_debug;
    ecui.pause();
    ecui.io.ajax('/debug_before', {
        onsuccess: function () {
            nginx_debug = true;
            ecui.resume();
        },
        onerror: function () {
            ecui.resume();
        }
    });
    // var lastUpdate;
    // ecui.util.timer(function () {
    //     ecui.io.ajax('update.html', {
    //         onsuccess: function (data) {
    //             if (lastUpdate) {
    //                 if (lastUpdate !== data) {
    //                     location.reload();
    //                 }
    //             } else {
    //                 lastUpdate = data;
    //             }
    //         }
    //     });
    // }, -3000);
})();
