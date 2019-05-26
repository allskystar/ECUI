(function () {
    var classes = [{CLASSID: 'CLASS-0'}],
        defines = {'CLASS-0': {PrivateFields: [], ProtectedFields: [], FinalFields: []}},
        callStack = [[null, classes[0], {}]],
        superMethods = {};

    function makeSuperMethod(name) {
        if (!superMethods[name]) {
            superMethods[name] = function () {
                return this.super[name].apply(this.this, arguments);
            };
        }
        return superMethods[name];
    }

    function makeProxy(Class, fn, superClass) {
        return function () {
            var oldSuper = window._super;
            _super = superClass ? Object.assign(defines[superClass.CLASSID].Constructor.bind(this), this[Class.CLASSID].super) : null;
            callStack.push([this, Class]);
            try {
                var ret = fn.apply(this, arguments);
            } finally {
                callStack.pop();
                _super = oldSuper;
            }
            return ret;
        };
    }

    function addProxy(oldProxy, newProxy) {
        return function () {
            var ret = oldProxy.apply(this, arguments);
            newProxy.apply(this, arguments);
            return ret;
        };
    }

    window._class = function () {
        return _class.extends.apply(this, [null].concat(Array.prototype.slice.call(arguments)));
    };

    /**
     * 指定继承一个类与相关接口。
     * @public
     *
     * @param {Function} superClass 父类
     * @param {Array} properties 属性集合
     * @param {object} ... 接口集合列表
     * @return {Function} 制作完成的类
     */
    _class.extends = function (superClass) {
        var index = 1,
            properties = arguments[index] && !arguments[index].CLASSID ? arguments[index++] : {},
            interfaces = Array.prototype.slice.call(arguments, index),
            constructor = properties.constructor === Object ? superClass : properties.constructor,
            newClass = function () {
                this[classes[0].CLASSID] = {};
                // 初始化各层级类的属性域
                for (var clazz = newClass; clazz; clazz = clazz.super) {
                    // 填充全部的初始化变量
                    this[clazz.CLASSID] = Object.assign({}, defines[clazz.CLASSID].Values);

                    // 初始化所有接口的属性域
                    defines[clazz.CLASSID].Interfaces.forEach(
                        function (inf) {
                            this[inf.CLASSID] = Object.assign({}, defines[inf.CLASSID].Values);
                        },
                        this
                    );
                }

                defines[classId].Constructor.apply(this, arguments);
            },
            symbols = {},
            values = {},
            methods = superClass ? Object.assign({}, defines[superClass.CLASSID].Methods) : {},
            innerClasses = [],
            classId = 'CLASS-' + classes.length,
            data,
            name;

        if (superClass) {
            var Class = new Function();

            Class.prototype = superClass.prototype;
            newClass.prototype = new Class();
            newClass.prototype.constructor = newClass;
            newClass.super = superClass;

            if (constructor && !/_super\s*\(/.test(constructor.toString())) {
                var oldConstructor = constructor;
                constructor = function () {
                    superClass.apply(this, arguments);
                    oldConstructor.apply(this, arguments);
                };
            }
        }

        delete properties.constructor;

        // 处理私有属性
        if (data = properties.private) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    symbols[name] = {
                        configurable: true,

                        get: (function (name) {
                            return function () {
                                var item = callStack[callStack.length - 1];
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    return this[item[1].CLASSID][name];
                                }
                                if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                    return this[newClass.CLASSID][name];
                                }
                                if (this[classes[0].CLASSID].hasOwnProperty(name)) {
                                    return this[classes[0].CLASSID][name];
                                }
                                return this.constructor.prototype[name];
                            };
                        }(name)),

                        set: (function (name) {
                            return function (value) {
                                var item = callStack[callStack.length - 1];
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    this[item[1].CLASSID][name] = value;
                                } else if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                    this[newClass.CLASSID][name] = value;
                                } else {
                                    this[classes[0].CLASSID][name] = value;
                                }
                            };
                        }(name))
                    };

                    values[name] = data[name];
                }
            }
            delete properties.private;
        }

        // 处理受保护的属性
        if (data = properties.protected) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        properties[name] = data[name];
                    } else {
                        symbols[name] = {
                            get: (function (name) {
                                return function () {
                                    var item = callStack[callStack.length - 1];
                                    if (newClass.isAssignableFrom(item[1])) {
                                        return this[newClass.CLASSID][name];
                                    }
                                    if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                        return this[newClass.CLASSID][name];
                                    }
                                    if (this[classes[0].CLASSID].hasOwnProperty(name)) {
                                        return this[classes[0].CLASSID][name];
                                    }
                                    return this.constructor.prototype[name];
                                };
                            }(name)),

                            set: (function (name) {
                                return function (value) {
                                    var item = callStack[callStack.length - 1];
                                    if (newClass.isAssignableFrom(item[1])) {
                                        this[newClass.CLASSID][name] = value;
                                    } else if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                        this[newClass.CLASSID][name] = value;
                                    } else {
                                        this[classes[0].CLASSID][name] = value;
                                    }
                                };
                            }(name))
                        };
                        values[name] = data[name];
                    }
                }
            }
            delete properties.protected;
        }

        // 处理受保护的属性
        if (data = properties.final) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        properties[name] = data[name];
                    } else {
                        symbols[name] = {
                            get: (function (name) {
                                return function () {
                                    return this[newClass.CLASSID][name];
                                };
                            }(name)),

                            set: (function (name) {
                                return function (value) {
                                    if (!this[newClass.CLASSID].hasOwnProperty(name)) {
                                        this[newClass.CLASSID][name] = value;
                                    }
                                };
                            }(name))
                        };
                        if (data[name] !== undefined) {
                            values[name] = data[name];
                        }
                    }
                }
            }
            delete properties.final;
        }

        // 处理static属性
        if (data = properties.static) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name]) {
                        if (data[name].CLASSID) {
                            innerClasses.push(data[name]);
                            Array.prototype.push.apply(innerClasses, defines[data[name].CLASSID].InnerClasses);
                        } else {
                            newClass[name] = makeProxy(newClass, data[name], null);
                            continue;
                        }
                    }
                    newClass[name] = data[name];
                }
            }

            delete properties.static;
        }

        // 处理public属性
        if (data = properties) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name]) {
                        if (data[name].CLASSID) {
                            innerClasses.push(data[name]);
                            Array.prototype.push.apply(innerClasses, defines[data[name].CLASSID].InnerClasses);
                        } else {
                            newClass.prototype[name] = makeProxy(newClass, data[name], superClass);
                            methods[name] = makeSuperMethod(name);
                            continue;
                        }
                    }
                    newClass.prototype[name] = data[name];
                }
            }
        }

        // 处理接口的属性
        interfaces.forEach(function (inf) {
            for (var name in defines[inf.CLASSID].Methods) {
                if (name !== 'constructor') {
                    if (newClass.prototype[name]) {
                        newClass.prototype[name] = addProxy(newClass.prototype[name], defines[inf.CLASSID].Methods[name]);
                    } else {
                        newClass.prototype[name] = defines[inf.CLASSID].Methods[name];
                        methods[name] = makeSuperMethod(name);
                    }
                }
            }
        });

        defines[classId] = {
            Constructor: function () {
                Object.defineProperties(this, symbols);

                var args = arguments;

                if (superClass) {
                    var clazz = this[classId].super = {};
                    Object.assign(clazz, defines[superClass.CLASSID].Methods);
                    clazz.super = superClass.prototype;
                    clazz.this = this;
                }

                // 调用全部类和接口的构造函数
                makeProxy(newClass, function () {
                    if (constructor) {
                        constructor.apply(this, args);
                    }

                    interfaces.forEach(
                        function (inf) {
                            if (defines[inf.CLASSID].Methods.constructor) {
                                defines[inf.CLASSID].Methods.constructor.apply(this, args);
                            }
                        },
                        this
                    );
                }, superClass).apply(this, arguments);
            },
            Interfaces: interfaces,
            Symbols: symbols,
            Values: values,
            Methods: methods,
            InnerClasses: innerClasses
        };

        newClass.CLASSID = classId;
        classes.push(newClass);
        newClass.isAssignableFrom = function (subClass) {
            for (; subClass; subClass = subClass.super) {
                if (subClass === newClass) {
                    return true;
                }
            }
            return false;
        };
        return newClass;
    };

    window._interface = function (properties) {
        return _interface.extends([], properties);
    };

    /**
     * 制作接口。
     * @public
     *
     * @param {Array|Function} superInterfaces 接口的数组或者接口对象
     * @param {object} properties 属性集合
     * @return {Function} 制作完成的接口
     */
    _interface.extends = function (superInterfaces, properties) {
        if (!(superInterfaces instanceof Array)) {
            superInterfaces = [superInterfaces];
        }

        var newClass = {},
            symbols = {},
            values = {},
            methods = {},
            data;

        newClass.CLASSID = 'CLASS-' + classes.length;
        classes.push(newClass);

        superInterfaces.forEach(function (inf) {
            Object.assign(symbols, defines[inf.CLASSID].Symbols);
            Object.assign(values, defines[inf.CLASSID].Values);
            for (var name in defines[inf.CLASSID].Methods) {
                if (defines[inf.CLASSID].Methods.hasOwnProperty(name)) {
                    methods[name] = methods[name] ? addProxy(methods[name], defines[inf.CLASSID].Methods[name]) : defines[inf.CLASSID].Methods[name];
                }
            }
        });

        // 处理私有属性，代码复制自_class.extends
        if (data = properties.private) {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    symbols[name] = {
                        configurable: true,

                        get: (function (name) {
                            return function () {
                                var item = callStack[callStack.length - 1];
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    return this[item[1].CLASSID][name];
                                }
                                if (this[classes[0].CLASSID].hasOwnProperty(name)) {
                                    return this[classes[0].CLASSID][name];
                                }
                                return this.constructor.prototype[name];
                            };
                        }(name)),

                        set: (function (name) {
                            return function (value) {
                                var item = callStack[callStack.length - 1];
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    this[item[1].CLASSID][name] = value;
                                }
                                this[classes[0].CLASSID][name] = value;
                            };
                        })
                    };

                    values[name] = data[name];
                }
            }
            delete properties.private;
        }

        // 处理静态属性，代码复制自_class.extends
        if (data = properties.static) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        newClass[name] = makeProxy(newClass, data[name], null);
                    } else {
                        newClass[name] = data[name];
                    }
                }
            }
            delete properties.static;
        }

        // 处理public属性
        if (data = properties) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        methods[name] = methods[name] ? addProxy(methods[name], data[name]) : makeProxy(newClass, data[name], null);
                    }
                }
            }
        }

        defines[newClass.CLASSID] = {
            Symbols: symbols,
            Values: values,
            Methods: methods
        };

        return newClass;
    };

    window._static = function (fn) {
        return makeProxy(classes[0], fn, null);
    };

    if (window.requestAnimationFrame) {
        var requestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function (fn) {
            var item = callStack[callStack.length - 1];
            return item[0] ?
                    requestAnimationFrame(function () {
                        callStack.push(item);
                        fn.apply(this, arguments);
                        callStack.pop();
                    }) : requestAnimationFrame(fn);
        };
    }

    var setTimeout = window.setTimeout;
    window.setTimeout = function (fn, delay) {
        var item = callStack[callStack.length - 1];
        return item[0] ?
                setTimeout(
                    function () {
                        callStack.push(item);
                        fn.apply(this, arguments);
                        callStack.pop();
                    },
                    delay
                ) : setTimeout(fn, delay);
    };

    var setInterval = window.setInterval;
    window.setInterval = function (fn, delay) {
        var item = callStack[callStack.length - 1];
        return item[0] ?
                setInterval(
                    function () {
                        callStack.push(item);
                        fn.apply(this, arguments);
                        callStack.pop();
                    },
                    delay
                ) : setInterval(fn, delay);
    };
}());
