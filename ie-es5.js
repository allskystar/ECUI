/*jslint forin:true*/
(function () {
    function consoleScroll() {
        var body = document.getElementById('SimulateConsole');
        body.style.bottom = -document.body.parentElement.scrollTop + 'px';
    }

    if (!window.console) {
        window.console = {
            log: function () {
                var body = document.getElementById('SimulateConsole');
                if (!body) {
                    body = document.createElement('DIV');
                    body.id = 'SimulateConsole';
                    body.style.cssText = 'width:100%;height:100px;border-top:1px solid black;background:white;position:absolute;left:0;bottom:0';
                    document.body.appendChild(body);
                    window.attachEvent('onscroll', consoleScroll);
                }
                var text = [];
                for (var i = 0; i < arguments.length; i++) {
                    text.push(arguments[i]);
                }
                var el = document.createElement('DIV');
                el.innerHTML = text.join(' ');
                body.appendChild(el);
            }
        };
    }

    Date.now = function now() {
        return +new Date();
    };

    Function.prototype.bind = function (thisArg) {
        var args = Array.prototype.slice.call(arguments, 1),
            caller = this,
            Clazz = new Function(),
            bound = function () {
                return caller.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
            };

        Clazz.prototype = this.prototype;
        bound.prototype = new Clazz();

        return bound;
    };

    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };

    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    Array.prototype.forEach = function (callbackfn, thisArg) {
        for (var i = 0, len = this.length; i < len; i++) {
            callbackfn.call(thisArg, this[i], i, this);
        }
    };

    Array.prototype.map = function (callbackfn, thisArg) {
        var ret = [];
        for (var i = 0, len = this.length; i < len; i++) {
            ret.push(callbackfn.call(thisArg, this[i], i, this));
        }
        return ret;
    };

    Array.prototype.filter = function (callbackfn, thisArg) {
        var ret = [];
        for (var i = 0, len = this.length; i < len; i++) {
            if (callbackfn.call(thisArg, this[i], i, this)) {
                ret.push(this[i]);
            }
        }
        return ret;
    };

    Array.prototype.some = function (callbackfn, thisArg) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (callbackfn.call(thisArg, this[i], i, this)) {
                return true;
            }
        }
        return false;
    };

    Array.prototype.every = function (callbackfn, thisArg) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (!callbackfn.call(thisArg, this[i], i, this)) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.indexOf = function (searchElement, fromIndex) {
        for (var i = fromIndex ? Math.max(fromIndex, 0) : 0, len = this.length; i < len; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };

    Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
        for (var i = fromIndex !== undefined ? Math.min(fromIndex, this.length - 1) : this.length - 1; i >= 0; i--) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };

    Array.prototype.reduce = function (callbackfn, initialValue) {
        var i = 0,
            len = this.length;

        if (initialValue === undefined) {
            initialValue = this[i++];
        }

        for (; i < len; i++) {
            initialValue = callbackfn(initialValue, this[i], i, this);
        }
        return initialValue;
    };

    Array.prototype.reduceRight = function (callbackfn, initialValue) {
        var len = this.length,
            i = len;

        if (initialValue === undefined) {
            initialValue = this[--i];
        }
        for (; i--; ) {
            initialValue = callbackfn(initialValue, this[i], i, this);
        }
        return initialValue;
    };

    this.JSON = {
        parse: function (data) {
            return (new Function('return (' + data + ')'))();
        },

        stringify: (function () {
            function encodeString(source) {
                return '"' + source.replace(
                    /["\\\x00-\x1f]/g,
                    function (match) {
                        return {
                            '\b': '\\b',
                            '\t': '\\t',
                            '\n': '\\n',
                            '\f': '\\f',
                            '\r': '\\r',
                            '"' : '\\"',
                            '\\': '\\\\'
                        }[match] || ('\\u00' + Math.floor(match.charCodeAt() / 16).toString(16) + (match.charCodeAt() % 16).toString(16));
                    }
                ) + '"';
            }

            function encodeArray(source) {
                for (var i = 0, result = [], len = source.length; i < len; i++) {
                    result.push(JSON.stringify(source[i]));
                }
                return '[' + result.join(',') + ']';
            }

            return function (value) {
                var type = typeof value,
                    result = [];

                if (value === null || value === undefined || type === 'function') {
                    return 'null';
                }

                if (type === 'number') {
                    return isFinite(value) ? String(value) : 'null';
                }

                if (type === 'boolean') {
                    return String(value);
                }

                if (type === 'string') {
                    return encodeString(value);
                }

                if (value instanceof Array) {
                    return encodeArray(value);
                }

                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        result.push(encodeString(key) + ':' + JSON.stringify(value[key]));
                    }
                }
                return '{' + result.join(',') + '}';
            };
        }())
    };

    Object.keys = function (obj) {
        var enumBug = {
                'Function]bind': true,
                'String]trim': true,
                'Array]forEach': true,
                'Array]map': true,
                'Array]filter': true,
                'Array]some': true,
                'Array]every': true,
                'Array]indexOf': true,
                'Array]lastIndexOf': true,
                'Array]reduce': true,
                'Array]reduceRight': true
            },
            type = Object.prototype.toString.call(obj).slice(8),
            ret = [];

        for (var key in obj) {
            if (!enumBug[type + key]) {
                ret.push(key);
            }
        }
        return ret;
    };
}());