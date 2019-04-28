/*(function () {
    var oldDisposeFn = ecui.ui.InputControl.prototype.$dispose,
        oldReadyFn = ecui.ui.InputControl.prototype.$ready;

    function setData(name, value) {
        if (localStorage[name] !== value) {
            localStorage[name] = value;
        }
    }

    ecui.ui.InputControl.prototype.$dispose = function () {
        if (this.getName()) {
            var name = ecui.esr.getLocation() + '_debug_' + this.getName();

            if (this._eInput) {
                if (this instanceof ecui.ui.Radio) {
                    if (this.isChecked()) {
                        setData(name, this.getValue());
                    }
                } else if (this instanceof ecui.ui.Checkbox) {
                    setData(name, this.isChecked() ? '1' : '');
                } else {
                    setData(name, this.getValue());
                }
            }
        }
        oldDisposeFn.call(this);
    };

    ecui.ui.InputControl.prototype.$ready = function (options) {
        var name = ecui.esr.getLocation() + '_debug_' + this.getName();

        if (localStorage[name]) {
            if (this instanceof ecui.ui.Radio) {
                if (localStorage[name] === this.getValue()) {
                    this.setChecked(true);
                }
            } else if (this instanceof ecui.ui.Checkbox) {
                this.setChecked(!!localStorage[name]);
            } else {
                this.$setValue(localStorage[name]);
            }
        }
        oldReadyFn.call(this, options);
    };
}());*/

(function () {
    /**
     * 动态加载模块，用于测试。
     * @public
     *
     * @param {string} name 模块名
     */
    var moduleName,
        moduleCallback,
        moduleRoute,
        loc = location.href + '#',
        waits = {},
        oldLoadScriptFn = ecui.io.loadScript;

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
        var el = document.createElement('STYLE');
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

    ecui.io.loadScript = function (url, callback, options) {
        var name = url.split('/');

        if (name.pop() === '_define_.js') {
            moduleName = name.length ? name.join('/') + '/' : '';
            moduleCallback = callback;
            moduleRoute = [];

            ecui.io.ajax(moduleName + '_define_.css', {
                cache: true,
                onsuccess: function (cssText) {
                    createStyle('.module-' + moduleName.slice(0, -1).replace(/[._]/g, '-').replace(/\//g, '_') + '{' + cssText + '}');
                    oldLoadScriptFn.call(this, url, null, options);
                },
                onerror: function () {
                    oldLoadScriptFn.call(this, url, null, options);
                }
            });
        } else {
            oldLoadScriptFn.call(this, url, callback, options);
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

        function loadRouteCss() {
            ecui.io.ajax(moduleName + filename.slice(0, index + 1).replace(/\./g, '/') + 'route.' + filename.slice(index + 1) + '.css', {
                cache: true,
                onsuccess: function (cssText) {
                    createStyle('.' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + filename.replace(/[._]/g, '-') + '{' + cssText + '}');

                    window.less.sheets = [];
                    window.less.refresh(true, undefined, false);

                    var stop = ecui.util.timer(function () {
                        if (document.head.lastChild.getAttribute('type') !== 'text/less') {
                            stop();
                            ecui.io.ajax(moduleName + filename.slice(0, index + 1).replace(/\./g, '/') + 'route.' + filename.slice(index + 1) + '.html', {
                                cache: true,
                                onsuccess: function (data) {
                                    if (index >= 0) {
                                        data = data.replace(/<!--\s*target:\s*([^>]+)-->/g, '<!-- target: ' + filename.slice(0, index + 1) + '$1 -->');
                                    }
                                    ecui.esr.getEngine(moduleName).compile(data.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'));
                                    moduleRoute.splice(0, 1);
                                    if (moduleRoute.length) {
                                        load();
                                    } else {
                                        ecui.esr.addRoute = oldAddRoute;
                                        moduleCallback();
                                    }
                                }
                            });
                        }
                    }, -1);
                }
            });
        }

        function loadLayer(url) {
            oldLoadScriptFn(url.replace('.html', '.js'), loadLayerHTML, {cache: true, onerror: loadLayerHTML});

            function loadLayerHTML() {
                ecui.io.ajax(url, {
                    cache: true,
                    onsuccess: function (text) {
                        if (!text) {
                            loadRouteCss();
                            return;
                        }
                        if (!/^\s*<header(>|\s).*?<\/header>\s*<container(>|\s).*?<\/container>\s*$/.test(text.replace(/\n/g, ''))) {
                            throw new Error(url + ' 中只允许存在<header>与<container>标签');
                        }
                        text = text.replace('<header', '<div style="display:none"');
                        text = text.replace('<container', '<div ui="type:ecui.esr.AppLayer" style="display:none" id="' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + filename.replace(/[._]/g, '-') + '"');
                        text = text.replace('</header>', '</div>');
                        text = text.replace('</container>', '</div>');
                        var el = ecui.dom.last(ecui.dom.first(ecui.$('ECUI-FIXED-BODY') || document.body));
                        ecui.dom.insertHTML(el, 'beforeEnd', etpl.compile(text.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'))(ecui.esr.getContext()));
                        ecui.dom.previous(el).appendChild(ecui.dom.last(el).header = ecui.dom.previous(ecui.dom.last(el)));
                        ecui.init(el.parentNode);

                        ecui.io.ajax(url.replace('.html', '.css'), {
                            cache: true,
                            onsuccess: function (text) {
                                createStyle('#' + moduleName.replace(/[._]/g, '-').replace(/\//, '_') + filename.replace(/[._]/g, '-') + '{' + text + '}');

                                window.less.sheets = [];
                                window.less.refresh(true, undefined, false);

                                var stop = ecui.util.timer(function () {
                                    if (document.head.lastChild.getAttribute('type') !== 'text/less') {
                                        stop();
                                        loadRouteCss();
                                    }
                                }, -1);
                            },
                            onerror: loadRouteCss
                        });
                    },
                    onerror: loadRouteCss
                });
            }
        }

        var filename = moduleRoute[0];
        var index = filename.lastIndexOf('.');
        oldLoadScriptFn(moduleName + filename.slice(0, index + 1).replace(/\./g, '/') + 'route.' + filename.slice(index + 1) + '.js', null, {cache: true});
        loadLayer(moduleName + filename.slice(0, index + 1).replace(/\./g, '/') + 'layer.' + filename.slice(index + 1) + '.html');
    }

    ecui.esr.loadClass = function (filename) {
        oldLoadScriptFn(moduleName + 'class.' + filename + '.js', null, {cache: true});
    };
    ecui.esr.loadRoute = function (filename) {
        moduleRoute.push(filename);
        if (moduleRoute.length === 1) {
            load();
        }
    };

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
}());