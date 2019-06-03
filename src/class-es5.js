(function () {
    var classes = [{CLASSID: 'CLASS-0'}],
        defines = {'CLASS-0': {InnerClasses: []}},
        callStack = [[null, classes[0], {}]],
        superMethods = {};

    function makeSuperMethod(name) {
        if (!superMethods[name]) {
            superMethods[name] = function () {
                return this.super[name].apply(this.this, arguments);
            };
        }
//{if 0}//
        superMethods[name].toString = function () {
            return this.super[name].toString();
        };
//{/if}//
        return superMethods[name];
    }

    function makeProxy(Class, fn, superClass, name) {
        var proxy = function () {
            if (name) {
                var item = callStack[callStack.length - 1];
                for (var clazz = Class.super, defineClass; clazz; clazz = clazz.super) {
                    if (clazz.prototype.hasOwnProperty(name)) {
                        defineClass = clazz;
                    }
                }
                if (!(defineClass ||  Class).isAssignableFrom(item[1])) {
                    throw new Error('The property is not visible.');
                }
            }
            var oldSuper = window._super;
            _super = proxy.super && this.constructor.CLASSID ? Object.assign(defines[proxy.super.CLASSID].Constructor.bind(this), this[Class.CLASSID].super) : null;
//{if 0}//
            if (proxy.super && this.constructor.CLASSID) {
                _super.toString = function () {
                    return proxy.super.toString();
                };
            }
//{/if}//
            callStack.push([proxy.super !== undefined ? this : null, Class]);
            try {
                var ret = fn.apply(this, arguments);
            } finally {
                callStack.pop();
                _super = oldSuper;
            }
            return ret;
        };
//{if 0}//
        proxy.toString = function () {
            return fn.toString();
        };
//{/if}//
        proxy.super = superClass;
        return proxy;
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
            constructor = properties.constructor,
            newClass = function () {
                var list = [],
                    args = arguments,
                    self = this;

                if (!Object.defineProperties) {
                    // ie8
                    self = document.createElement('IFRAME').document;
                    Object.defineProperty(self, 'constructor', {
                        get: function () {
                            return newClass;
                        },
                        set: new Function()
                    });
                    for (var name in newClass.prototype) {
                        self[name] = newClass.prototype[name];
                    }
                }

                self[classes[0].CLASSID] = {};
                // 初始化各层级类的属性域
                for (var clazz = newClass; clazz; clazz = clazz.super) {
                    list.push(clazz);
                    // 填充全部的初始化变量
                    self[clazz.CLASSID] = Object.assign({}, defines[clazz.CLASSID].Values);

                    // 初始化所有接口的属性域
                    defines[clazz.CLASSID].Interfaces.forEach(
                        function (inf) {
                            self[inf.CLASSID] = Object.assign({}, defines[inf.CLASSID].Values);
                        },
                        self
                    );
                }

                defines[classId].Constructor.apply(self, args);

                list.reverse().forEach(
                    function (clazz) {
                        defines[clazz.CLASSID].Interfaces.forEach(
                            function (inf) {
                                if (defines[inf.CLASSID].Methods.constructor) {
                                    defines[inf.CLASSID].Methods.constructor.apply(self, args);
                                }
                            },
                            self
                        );
                    },
                    self
                );

                return self;
            },
            symbols = {},
            values = {},
            methods = superClass ? Object.assign({}, defines[superClass.CLASSID].Methods) : {},
            innerClasses = [],
            protectedNames = [],
            classId = 'CLASS-' + classes.length,
            data,
            name;

        if (superClass) {
            var Class = new Function();

            Class.prototype = superClass.prototype;
            newClass.prototype = new Class();
            newClass.prototype.constructor = newClass;
            newClass.super = superClass;

            if (constructor === Object) {
                constructor = defines[superClass.CLASSID].Constructor;
            } else if (!/_super\s*\(/.test(constructor.toString())) {
                var oldConstructor = constructor;
                constructor = function () {
                    oldConstructor.apply(this, arguments);
                    defines[superClass.CLASSID].Constructor.apply(this, arguments);
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
                                if (!item[0]) {
                                    throw new Error('The property is not visible.');
                                }
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    // 与调用的函数生存域相同
                                    return this[item[1].CLASSID][name];
                                }
                                if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                    // 内部类与外部类之间允许相互调用
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
                                if (!item[0]) {
                                    throw new Error('The property is not visible.');
                                }
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    // 与调用的函数生存域相同
                                    this[item[1].CLASSID][name] = value;
                                } else if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                    // 内部类与外部类之间允许相互调用
                                    this[newClass.CLASSID][name] = value;
                                } else {
                                    this[classes[0].CLASSID][name] = value;
                                }
                            };
                        }(name))
                    };
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        values[name] = makeProxy(newClass, data[name], superClass);
                    } else {
                        values[name] = data[name];
                    }
                }
            }
            delete properties.private;
        }

        // 处理受保护的属性
        if (data = properties.protected) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    protectedNames.push(name);
                    if ('function' === typeof data[name]) {
                        properties[name] = data[name];
                    } else {
                        symbols[name] = {
                            get: (function (name) {
                                return function () {
                                    var item = callStack[callStack.length - 1];
                                    if (newClass.isAssignableFrom(item[1])) {
                                        // 子类
                                        return this[newClass.CLASSID][name];
                                    }
                                    if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                        // 内部类与外部类之间允许相互调用
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
                                        // 子类
                                        this[newClass.CLASSID][name] = value;
                                    } else if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                        // 内部类与外部类之间允许相互调用
                                        this[newClass.CLASSID][name] = value;
                                    } else {
                                        this[classes[0].CLASSID][name] = value;
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
            delete properties.protected;
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
                            newClass.prototype[name] = makeProxy(newClass, data[name], superClass, protectedNames.indexOf(name) >= 0 ? name : undefined);
                            methods[name] = makeSuperMethod(name);
                            continue;
                        }
                    }
                    newClass.prototype[name] = data[name];
                }
            }
        }

        delete newClass.prototype.final;
        delete newClass.prototype.static;

        // 处理static属性
        if (properties.static) {
            properties.static.forEach(function (name) {
                if (symbols.hasOwnProperty(name)) {
                    if (properties.final && properties.final.indexOf(name) >= 0) {
                        var isFinal = false;
                        for (var i = properties.final.length; i--; ) {
                            if (properties.final[i] === name) {
                                properties.final.splice(i, 1);
                            }
                        }
                    }

                    Object.defineProperty(
                        newClass,
                        name,
                        (function (isPrivate, isFinal) {
                            data = values.hasOwnProperty(name) ? {value: values[name]} : {};
                            return {
                                get: function () {
                                    var item = callStack[callStack.length - 1];
                                    if (isPrivate ? item[1] === newClass : newClass.isAssignableFrom(item[1])) {
                                        // 与调用的函数生存域相同
                                        return data.value;
                                    }
                                    if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                        // 内部类与外部类之间允许相互调用
                                        return data.value;
                                    }
                                    return undefined;
                                },

                                set: function (value) {
                                    if (isFinal && data.hasOwnProperty(name)) {
                                        return;
                                    }
                                    var item = callStack[callStack.length - 1];
                                    if (isPrivate ? item[1] === newClass : newClass.isAssignableFrom(item[1])) {
                                        // 与调用的函数生存域相同
                                        data.value = value;
                                    } else if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                        // 内部类与外部类之间允许相互调用
                                        data.value = value;
                                    }
                                }
                            };
                        }(protectedNames.indexOf(name) < 0, isFinal))
                    );

                    delete symbols[name];
                    delete values[name];
                } else if (newClass.prototype.hasOwnProperty(name)) {
                    newClass[name] = newClass.prototype[name];
                    delete newClass.prototype[name];
                    if ('function' === typeof newClass[name]) {
                        newClass[name].super = undefined;
                    }
                }
            });
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

        // 处理受保护的属性
        if (properties.final) {
            properties.final.forEach(function (name) {
                if (symbols.hasOwnProperty(name)) {
                    symbols[name].set = (function (name, fn) {
                        return function (value) {
                            if (!this[classId].hasOwnProperty(name)) {
                                fn.call(this, value);
                            }
                        };
                    }(name, symbols[name].set));
                } else if (newClass.prototype.hasOwnProperty(name)) {
                    Object.defineProperty(
                        newClass.prototype,
                        name,
                        {
                            writable: false,
                            value: newClass.prototype[name]
                        }
                    );
                } else if (newClass.hasOwnProperty(name)) {
                    Object.defineProperty(
                        newClass,
                        name,
                        {
                            writable: false,
                            value: newClass[name]
                        }
                    );
                }
            });
        }

        defines[classId] = {
            Constructor: function () {
                if (Object.defineProperties) {
                    Object.defineProperties(this, symbols);
                    interfaces.forEach(
                        function (inf) {
                            Object.defineProperties(this, defines[inf.CLASSID].Symbols);
                        },
                        this
                    );
                } else {
                    for (var name in symbols) {
                        if (symbols.hasOwnProperty(name)) {
                            Object.defineProperty(this, name, symbols[name]);
                        }
                    }
                    interfaces.forEach(
                        function (inf) {
                            for (var name in defines[inf.CLASSID].Symbols) {
                                if (defines[inf.CLASSID].Symbols.hasOwnProperty(name)) {
                                    Object.defineProperty(this, name, defines[inf.CLASSID].Symbols[name]);
                                }
                            }
                        },
                        this
                    );
                }

                if (superClass) {
                    var clazz = this[classId].super = {};
                    Object.assign(clazz, defines[superClass.CLASSID].Methods);
                    clazz.super = superClass.prototype;
                    clazz.this = this;
                }

                // 调用全部类和接口的构造函数
                if (constructor) {
                    makeProxy(newClass, constructor, superClass).apply(this, arguments);
                }
            },
            Interfaces: interfaces,
            Symbols: symbols,
            Values: values,
            Methods: methods,
            InnerClasses: innerClasses
        };

        newClass.CLASSID = classId;
        classes.push(newClass);
        newClass.isInstance = function (obj) {
            return !!(obj && obj[classId]);
        };
        newClass.isAssignableFrom = function (subClass) {
            for (; subClass; subClass = subClass.super) {
                if (subClass === newClass) {
                    return true;
                }
            }
            return false;
        };
//{if 0}//
        newClass.toString = function () {
            return oldConstructor ? oldConstructor.toString() : constructor ? constructor.toString() : null;
        };
//{//if}//
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
            methods = {constructor: null},
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
            if (!Object.defineProperties && defines[inf.CLASSID].Methods.constructor) {
                methods.constructor = methods.constructor ? addProxy(methods.constructor, defines[inf.CLASSID].Methods.constructor) : defines[inf.CLASSID].Methods[name];
            }
        });

        // 处理私有属性，代码复制自_class.extends
        if (data = properties.private) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    symbols[name] = {
                        configurable: true,

                        get: (function (name) {
                            return function () {
                                var item = callStack[callStack.length - 1];
                                if (!item[0]) {
                                    throw new Error('The property is not visible.');
                                }
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    // 与调用的函数生存域相同
                                    return this[item[1].CLASSID][name];
                                }
                                if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                    // 内部类与外部类之间允许相互调用
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
                                if (!item[0]) {
                                    throw new Error('The property is not visible.');
                                }
                                if (this[item[1].CLASSID] && this[item[1].CLASSID].hasOwnProperty(name)) {
                                    // 与调用的函数生存域相同
                                    this[item[1].CLASSID][name] = value;
                                } else if (defines[item[1].CLASSID].InnerClasses.indexOf(newClass) >= 0 || defines[newClass.CLASSID].InnerClasses.indexOf(item[1]) >= 0) {
                                    // 内部类与外部类之间允许相互调用
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

        if (!Object.defineProperties && properties.constructor) {
            methods.constructor = methods.constructor ? addProxy(methods.constructor, data.constructor) : makeProxy(newClass, data.constructor, null);
        }

        defines[newClass.CLASSID] = {
            Symbols: symbols,
            Values: values,
            Methods: methods
        };

        newClass.isInstance = function (obj) {
            return !!obj[classId];
        };
        return newClass;
    };

    window._static = function (fn) {
        return makeProxy(classes[0], fn);
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
