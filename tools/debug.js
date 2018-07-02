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

    ecui.io.loadScript = function (url, callback, options) {
        var name = url.slice(0, -3).split('/');
        if (name[0] === name[1]) {
            moduleName = name[0];
            moduleCallback = callback;
            moduleRoute = [];
            callback = ecui.util.blank;
        }
        oldLoadScriptFn.call(this, url, callback, options);
    };

    function load() {
        function createStyle(cssText) {
            var el = document.createElement('STYLE');
            el.setAttribute('type', 'text/less');
            if (ecui.ie < 10) {
                var reg = ecui.ie > 6 ? new RegExp('[_' + (ecui.ie > 7 ? '\\*\\+' : '') + ']\\w+:[^;}]+[;}]', 'g') : null;
                if (reg) {
                    cssText = cssText.replace(reg, function (match) {
                        return match.slice(-1) === '}' ? '}' : '';
                    });
                }
                el.styleSheet.cssText = cssText;
            } else {
                el.innerHTML = cssText;
            }
            document.head.appendChild(el);
        }
        function loadRouteCss() {
            ecui.io.ajax(moduleName + '/route.' + filename + '.css', {
                cache: true,
                onsuccess: function (cssText) {
                    createStyle('.' + filename.replace(/\./g, '-') + '{' + cssText + '}');

                    window.less.sheets = [];
                    window.less.refresh(true, undefined, false);

                    var stop = ecui.util.timer(function () {
                        if (document.head.lastChild.getAttribute('type') !== 'text/less') {
                            stop();
                            ecui.io.ajax(moduleName + '/route.' + filename + '.html', {
                                cache: true,
                                onsuccess: function (data) {
                                    ecui.esr.getEngine(moduleName).compile(data);
                                    moduleRoute.splice(0, 1);
                                    if (moduleRoute.length) {
                                        load();
                                    } else {
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
            ecui.io.ajax(url, {
                cache: true,
                onsuccess: function (text) {
                    text = text.replace('<header', '<div style="display:none"');
                    text = text.replace('<container', '<div ui="type:ecui.esr.AppLayer" style="display:none"');
                    text = text.replace('</header>', '</div>');
                    text = text.replace('</container>', '</div>');
                    var el = ecui.dom.last(ecui.dom.first(ecui.getBody()));
                    ecui.dom.insertHTML(el, 'beforeBegin', text);
                    ecui.init(el.parentNode);
                    var children = ecui.dom.children(el.parentNode);
                    children[children.length - 2].header = children[children.length - 3];
                    el.appendChild(children[children.length - 2]);
                    loadRouteCss();
                },
                onerror: loadRouteCss
            });
        }

        var filename = moduleRoute[0];
        oldLoadScriptFn(moduleName + '/route.' + filename + '.js', null, {cache: true});

        ecui.io.ajax(moduleName + '/' + moduleName + '.css', {
            cache: true,
            onsuccess: function (cssText) {
                createStyle(cssText);
                loadLayer(moduleName + '/layer.' + filename + '.html');
            },
            onerror: function () {
                loadLayer(moduleName + '/layer.' + filename + '.html');
            }
        });
    }

    ecui.esr.loadClass = function (filename) {
        oldLoadScriptFn(moduleName + '/class.' + filename + '.js', null, {cache: true});
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