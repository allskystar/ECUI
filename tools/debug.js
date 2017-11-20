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
    function doLoad() {
        var el = ecui.$('LESS-FILE-PROTOCOL');
        if (!el) {
            el = document.createElement('IFRAME');
            el.id = 'LESS-FILE-PROTOCOL';
            el.style.cssText = 'position:absolute;width:1px;height:1px;left:-10px;top:-10px';
            document.body.appendChild(el);
        }

        var path = waits[0][0],
            callback = waits[0][1];

        location.hash = '';
        path = path.split('?');
        if (path[0].slice(-5) !== '.html') {
            path[0] += '.html';
        }
        if (path[1]) {
            path.push('url=' + encodeURIComponent(loc));
        } else {
            path[1] = 'url=' + encodeURIComponent(loc);
        }
        el.src = path[0] + '?' + path.slice(1).join('&');
        var stop = ecui.util.timer(function () {
            if (location.hash && location.hash !== '#') {
                stop();
                callback(
                    decodeURIComponent(location.hash.slice(1)),
                    {
                        getResponseHeader: function (name) {
                            return {
                                'Last-Modified': new Date(1970, 0, 1).toString()
                            }[name];
                        }
                    }
                );
                waits.splice(0, 1);
                if (waits.length) {
                    doLoad();
                } else {
                    location.hash = oldLocation;
                    ecui.esr.redirect = oldRedirectFn;
                    ecui.resume();
                }
            }
        }, -100);
    }

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
        waits = [],
        oldRedirectFn = ecui.esr.redirect,
        oldLoadScriptFn = ecui.io.loadScript,
        oldLocation;

    loc = loc.slice(0, loc.indexOf('#'));

    if (loc.slice(0, 5) === 'file:') {
        ecui.io.ajax = function (url, options) {
            ecui.dom.ready(function () {
                if (url.slice(0, 5) === 'file:') {
                    url = url.slice(loc.lastIndexOf('/') + 1);
                } else if (url.charAt(0) === '/') {
                    url = url.slice(1);
                }
                waits.push([url, options.onsuccess]);
                if (waits.length === 1) {
                    ecui.pause();
                    oldLocation = location.hash;
                    ecui.esr.redirect = ecui.util.blank;
                    doLoad();
                }
            });
        };
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
        var filename = moduleRoute[0];
        oldLoadScriptFn(moduleName + '/route.' + filename + '.js');

        ecui.io.ajax(moduleName + '/route.' + filename + '.css', {
            onsuccess: function (cssText) {
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

                window.less.sheets = [];
                window.less.refresh(true, undefined, false);

                var stop = ecui.util.timer(function () {
                    if (document.head.lastChild.getAttribute('type') !== 'text/less') {
                        stop();
                        ecui.io.ajax(moduleName + '/route.' + filename + '.html', {
                            onsuccess: function (data) {
                                etpl.compile(data);
                                moduleRoute.splice(0, 1);
                                if (moduleRoute.length) {
                                    load();
                                } else {
                                    moduleCallback();
                                }
                            }
                        });
                    }
                }, -50);
            }
        });
    }

    ecui.esr.loadClass = function (filename) {
        oldLoadScriptFn(moduleName + '/class.' + filename + '.js');
    };
    ecui.esr.loadRoute = function (filename) {
        moduleRoute.push(filename);
        if (moduleRoute.length === 1) {
            load();
        }
    };
}());