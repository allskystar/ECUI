(function () {
    var classes = [{CLASSID: 'CLASS-0'}],
        defines = {'CLASS-0': {PrivateFields: [], ProtectedFields: [], FinalFields: []}},
        callStack = [[null, classes[0], {}]],
        superMethods = {};

    function setPrivate(caller, Class, caches) {
        defines[Class.CLASSID].PrivateFields.forEach(function (name) {
            if (caller.hasOwnProperty(name)) {
                caches[name] = caller[name];
            }
            if (Object.defineProperty) {
                Object.defineProperty(
                    caller,
                    name,
                    {
                        configurable: true,
                        get: function () {
                            return caller[Class.CLASSID][name];
                        },
                        set: function (value) {
                            if ('function' !== caller[Class.CLASSID[name]]) {
                                caller[Class.CLASSID][name] = value;
                            }
                        }
                    }
                );
            } else {
                caller[name] = caller[Class.CLASSID][name];
            }
        });
    }

    function setProtected(caller, Class, caches) {
        function set(name) {
            if (names.indexOf(name) < 0) {
                if (caller.hasOwnProperty(name)) {
                    caches[name] = caller[name];
                }
                caller[name] = caller[Class.CLASSID][name];
                names.push(name);
            }
        }

        if (caller) {
            for (var names = []; Class; Class = Class.super) {
                defines[Class.CLASSID].ProtectedFields.forEach(set);
            }
        }
    }

    function setFinal(caller) {
        function set(name) {
            if (caller[clazz.CLASSID].hasOwnProperty(name)) {
                caller[name] = caller[clazz.CLASSID][name];
            }
        }

        if (caller) {
            for (var clazz = caller.constructor; clazz; clazz = clazz.super) {
                defines[clazz.CLASSID].FinalFields.forEach(set);
            }
        }
    }

    function resetPrivate(caller, Class, caches) {
        defines[Class.CLASSID].PrivateFields.forEach(function (name) {
            if (Object.defineProperty) {
                if (!caller.hasOwnProperty(name)) {
                    delete caller[Class.CLASSID][name];
                }
                delete caller[name];
                if (caches.hasOwnProperty(name)) {
                    caller[name] = caches[name];
                }
            } else {
                if ('function' !== typeof defines[Class.CLASSID][name]) {
                    // 函数不允许回写
                    if (caller.hasOwnProperty(name)) {
                        caller[Class.CLASSID][name] = caller[name];
                    } else {
                        delete caller[Class.CLASSID][name];
                    }
                }
                if (caches.hasOwnProperty(name)) {
                    caller[name] = caches[name];
                } else {
                    delete caller[name];
                }
            }
        });
    }

    function resetProtected(caller, Class, caches) {
        function reset(name) {
            if (names.indexOf(name) < 0) {
                if ('function' !== defines[Class.CLASSID][name]) {
                    // 函数不允许回写
                    if (caller.hasOwnProperty(name)) {
                        caller[Class.CLASSID][name] = caller[name];
                    } else {
                        delete caller[Class.CLASSID][name];
                    }
                }
                if (caches.hasOwnProperty(name)) {
                    caller[name] = caches[name];
                } else {
                    delete caller[name];
                }
                names.push(name);
            }
        }

        if (caller) {
            for (var names = []; Class; Class = Class.super) {
                defines[Class.CLASSID].ProtectedFields.forEach(reset);
            }
        }
    }

    function resetFinal(caller) {
        function reset(name) {
            if (caller.hasOwnProperty(name) && !caller[clazz.CLASSID].hasOwnProperty(name)) {
                caller[clazz.CLASSID][name] = caller[name];
            }
        }

        if (caller) {
            for (var clazz = caller.constructor; clazz; clazz = clazz.super) {
                defines[clazz.CLASSID].FinalFields.forEach(reset);
            }
        }
    }

    function onbefore(caller, Class) {
        if (!Object.defineProperty) {
            Class.CLASSID = 'CLASS-' + classes.indexOf(Class);
        }

        var item = callStack[callStack.length - 1],
            caches = {};

        if (caller) {
            caches.super = window._super;
            window._super = Class.super ? Object.assign(defines[Class.super.CLASSID].Constructor.bind(caller), caller[Class.CLASSID].super) : null;
        }

        if (caller === item[0] && Class === item[1]) {
            callStack.push([caller, Class, caches]);
            return;
        }

        resetPrivate.apply(null, item);
        setPrivate(caller, Class, caches);

        if (!Object.defineProperty) {
            resetFinal(caller);
            resetProtected.apply(null, item);
            setProtected(caller, Class, caches);
            setFinal(caller);
        }

        callStack.push([caller, Class, caches]);
    }

    function onafter() {
        var args = callStack.pop(),
            item = callStack[callStack.length - 1],
            caller = args[0],
            Class = args[1];

        if (caller) {
            window._super = args[2].super;
        }

        if (caller === item[0] && Class === item[1]) {
            return;
        }

        resetPrivate.apply(null, args);
        setPrivate.apply(null, item);

        if (!Object.defineProperty) {
            resetFinal(caller);
            resetProtected.apply(null, args);
            setProtected.apply(null, item);
            setFinal(caller);
        }
    }

    function checkProtected(Class, isField) {
        var item = callStack[callStack.length - 1];
        if (item[0] !== this || (isField && !Class.isAssignableFrom(item[1]))) {
            throw new Error('The property is not visible.');
        }
    }

    function makeSuperMethod(name) {
        if (!superMethods[name]) {
            superMethods[name] = function () {
                return this.super[name].apply(this.this, arguments);
            };
        }
        return superMethods[name];
    }

    function makeProxy(Class, fn, before) {
        return function () {
            if (before) {
                before.call(this, Class);
            }
            onbefore(this, Class);
            try {
                var ret = fn.apply(this, arguments);
            } finally {
                onafter();
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
        function initInterface(inf) {
            // 填充全部的初始化变量
            this[inf.CLASSID] = Object.assign({}, defines[inf.CLASSID].InitValues);
        }

        function makeProtectedDescriptor(name) {
            if (!propertyDescriptors[name]) {
                propertyDescriptors[name] = {
                    get: function () {
                        checkProtected.call(this, newClass, true);
                        return this[classId][name];
                    },
                    set: function (value) {
                        checkProtected.call(this, newClass, true);
                        this[classId][name] = value;
                    }
                };
            }
            return propertyDescriptors[name];
        }

        function makeFinalDescriptor(name) {
            if (!propertyDescriptors[name]) {
                propertyDescriptors[name] = {
                    get: function () {
                        return this[classId][name];
                    },
                    set: function (value) {
                        if (!this[classId].hasOwnProperty(name)) {
                            this[classId][name] = value;
                        }
                    }
                };
            }
            return propertyDescriptors[name];
        }

        var index = 1,
            properties = arguments[index] && !arguments[index].CLASSID ? arguments[index++] : {},
            interfaces = Array.prototype.slice.call(arguments, index),
            constructor = properties.constructor === Object ? superClass : properties.constructor,
            newClass = function () {
                // 初始化各层级类的属性域
                for (var clazz = newClass; clazz; clazz = clazz.super) {
                    // 填充全部的初始化变量
                    this[clazz.CLASSID] = Object.assign({}, defines[clazz.CLASSID].InitValues);

                    // 初始化所有接口的属性域
                    defines[clazz.CLASSID].Interfaces.forEach(initInterface, this);
                }

                defines[classId].Constructor.apply(this, arguments);
            },
            privateFields = [],
            protectedFields = [],
            finalFields = [],
            initValues = {},
            superMethods = superClass ? Object.assign({}, defines[superClass.CLASSID].SuperMethods) : {},
            propertyDescriptors = {},
            classId = 'CLASS-' + classes.length,
            data,
            name;

        if (superClass) {
            var Class = new Function();

            Class.prototype = superClass.prototype;
            newClass.prototype = new Class();
            newClass.prototype.constructor = newClass;
            newClass.super = superClass;
        }

        delete properties.constructor;

        if (Object.defineProperty) {
            Object.defineProperty(newClass, 'CLASSID', {value: classId});
        } else {
            newClass.CLASSID = classId;
        }
        classes.push(newClass);

        // 处理私有属性
        if (data = properties.private) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if (data[name] !== undefined) {
                        initValues[name] = data[name];
                    }
                    privateFields.push(name);
                }
            }
            delete properties.private;
        }

        // 处理保护属性
        if (data = properties.protected) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        newClass.prototype[name] = makeProxy(newClass, data[name], checkProtected);
                        superMethods[name] = makeSuperMethod(name);
                    } else {
                        if (data[name] !== undefined) {
                            initValues[name] = data[name];
                        }
                        protectedFields.push(name);
                    }
                }
            }
            delete properties.protected;
        }

        // 处理唯一赋值属性
        if (data = properties.final) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if (data[name] !== undefined) {
                        initValues[name] = data[name];
                    }
                    finalFields.push(name);
                }
            }
            delete properties.final;
        }

        // 处理静态属性
        if (data = properties.static) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    newClass[name] = 'function' === typeof data[name] && !data[name].CLASSID ? _static(data[name]) : data[name];
                }
            }
            delete properties.static;
        }

        // 处理public属性
        if (data = properties.public || properties) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        newClass.prototype[name] = makeProxy(newClass, data[name]);
                        superMethods[name] = makeSuperMethod(name);
                    } else {
                        newClass.prototype[name] = data[name];
                    }
                }
            }
        }

        // 处理接口的属性
        interfaces.forEach(function (inf) {
            for (var name in defines[inf.CLASSID].PublicFields) {
                if (name !== 'constructor') {
                    if (newClass.prototype[name]) {
                        newClass.prototype[name] = addProxy(newClass.prototype[name], defines[inf.CLASSID].PublicFields[name]);
                    } else {
                        newClass.prototype[name] = defines[inf.CLASSID].PublicFields[name];
                        superMethods[name] = makeSuperMethod(name);
                    }
                }
            }
        });

        defines[classId] = {
            Constructor: function () {
                var args = arguments;

                if (superClass) {
                    var clazz = this[classId].super = {};
                    Object.assign(clazz, defines[superClass.CLASSID].SuperMethods);
                    clazz.super = superClass.prototype;
                    clazz.this = this;
                }

                if (Object.defineProperty) {
                    protectedFields.forEach(
                        function (name) {
                            Object.defineProperty(this, name, makeProtectedDescriptor(name));
                        },
                        this
                    );

                    finalFields.forEach(
                        function (name) {
                            Object.defineProperty(this, name, makeFinalDescriptor(name));
                        },
                        this
                    );
                }

                // 调用全部类和接口的构造函数
                onbefore(this, newClass);
                try {
                    if (constructor) {
                        constructor.apply(this, args);
//{if 0}//
                        if (superClass && superClass.super && !this[superClass.CLASSID].super) {
                            console.warn('父类没有初始化');
                        }
//{/if}//
                    }

                    interfaces.forEach(
                        function (inf) {
                            if (defines[inf.CLASSID].PublicFields.constructor) {
                                onbefore(this, inf);
                                try {
                                    defines[inf.CLASSID].PublicFields.constructor.apply(this, args);
                                } finally {
                                    onafter();
                                }
                            }
                        },
                        this
                    );
                } finally {
                    onafter();
                }
            },
            Interfaces: interfaces,
            PrivateFields: privateFields,
            ProtectedFields: protectedFields,
            FinalFields: finalFields,
            SuperMethods: superMethods,
            InitValues: initValues
        };

        properties = null;

        /**
         * 类型转换。
         * @public
         *
         * @param {object} caller 需要转换类型的变量
         * @param {Function} fn 转换后需要调用的函数
         */
        newClass._cast = function (caller, fn) {
            if (fn) {
                onbefore(caller, newClass);
                fn.apply(caller);
                onafter();
            } else {
                return caller[classId];
            }
        };

        /**
         * 重新定义类的方法，动态为类增加新的方法。
         * @public
         *
         * @param {string} name 方法名
         * @param {Function} method 方法函数
         */
        newClass.defineMethod = function (name, method) {
            newClass.prototype[name] = makeProxy(newClass, method);
            defines[classId].SuperMethods[name] = makeSuperMethod(name);
        };

        /**
         * 检查类是不是当前类的子类。
         * @public
         *
         * @param {Function} subClass 需要检查的类
         * @return {boolean} subClass是否为当前类的子类
         */
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
            privateFields = [],
            publicFields = {},
            initValues = {},
            data;

        if (Object.defineProperty) {
            Object.defineProperty(newClass, 'CLASSID', {value: 'CLASS-' + classes.length});
        } else {
            newClass.CLASSID = 'CLASS-' + classes.length;
        }
        classes.push(newClass);

        superInterfaces.forEach(function (inf) {
            for (var name in defines[inf.CLASSID].PublicFields) {
                if (defines[inf.CLASSID].PublicFields.hasOwnProperty(name)) {
                    publicFields[name] = publicFields[name] ? addProxy(publicFields[name], defines[inf.CLASSID].PublicFields[name]) : defines[inf.CLASSID].PublicFields[name];
                }
            }
        });

        // 处理私有属性，代码复制自_class.extends
        if (data = properties.private) {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    if (data[name] !== undefined) {
                        initValues[name] = data[name];
                    }
                    privateFields.push(name);
                }
            }
            delete properties.private;
        }

        // 处理静态属性，代码复制自_class.extends
        if (data = properties.static) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    newClass[name] = 'function' === typeof data[name] && !data[name].CLASSID ? _static(data[name]) : data[name];
                }
            }
            delete properties.static;
        }

        // 处理public属性
        if (data = properties.public || properties) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        publicFields[name] = publicFields[name] ? addProxy(publicFields[name], data[name]) : makeProxy(newClass, data[name]);
                    }
                }
            }
        }

        defines[newClass.CLASSID] = {
            PrivateFields: privateFields,
            ProtectedFields: [],
            FinalFields: [],
            PublicFields: publicFields,
            InitValues: initValues
        };

        return newClass;
    };

    window._static = function (fn) {
        return function () {
            onbefore(null, classes[0]);
            try {
                var ret = fn.apply(this, arguments);
            } finally {
                onafter();
            }
            return ret;
        };
    };

    if (window.requestAnimationFrame) {
        var requestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function (fn) {
            var item = callStack[callStack.length - 1];
            return item[0] ?
                    requestAnimationFrame(function () {
                        setPrivate.apply(null, item);
                        setProtected.apply(null, item);
                        setFinal.apply(null, item);
                        callStack.push(item);
                        fn.apply(this, arguments);
                        callStack.pop();
                        resetPrivate.apply(null, item);
                        resetProtected.apply(null, item);
                        resetFinal.apply(null, item);
                    }) : requestAnimationFrame(fn);
        };
    }

    var setTimeout = window.setTimeout;
    window.setTimeout = function (fn, delay) {
        var item = callStack[callStack.length - 1];
        return item[0] ?
                setTimeout(
                    function () {
                        setPrivate.apply(null, item);
                        setProtected.apply(null, item);
                        setFinal.apply(null, item);
                        callStack.push(item);
                        fn.apply(this, arguments);
                        callStack.pop();
                        resetPrivate.apply(null, item);
                        resetProtected.apply(null, item);
                        resetFinal.apply(null, item);
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
                        setPrivate.apply(null, item);
                        setProtected.apply(null, item);
                        setFinal.apply(null, item);
                        callStack.push(item);
                        fn.apply(this, arguments);
                        callStack.pop();
                        resetPrivate.apply(null, item);
                        resetProtected.apply(null, item);
                        resetFinal.apply(null, item);
                    },
                    delay
                ) : setInterval(fn, delay);
    };

    __interface = function (properties) {
        return __interface.extends([], properties);
    };

    __interface.extends = function (superInterfaces, properties) {
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
                        newClass[name] = (function (fn) {
                            return function () {
                                callStack.push([null, newClass]);
                                var ret = fn.apply(this, arguments);
                                callStack.pop();
                                return ret;
                            };
                        }(data[name]));
                        methods[name] = makeSuperMethod(name);
                    } else {
                        symbols[name] = {
                            get: (function (name) {
                                return function () {
                                    return this[newClass.CLASSID][name];
                                };
                            }(name)),

                            set: (function (name) {
                                return function (value) {
                                    this[newClass.CLASSID][name] = value;
                                };
                            })
                        };

                        values[name] = data[name];
                    }
                }
            }
            delete properties.static;
        }

        // 处理public属性
        if (data = properties.public || properties) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        methods[name] = methods[name] ? addProxy(methods[name], data[name]) : data[name];
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

    __class = function () {
        return __class.extends.apply(this, [null].concat(Array.prototype.slice.call(arguments)));
    };

    __class.extends = function (superClass) {
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
                            this[inf.CLASSID] = Object.assign({}, defines[inf.CLASSID].InitValues);
                        },
                        this
                    );
                }

                defines[classId].Constructor.apply(this, arguments);
            },
            symbols = {},
            values = {},
            methods = superClass ? Object.assign({}, defines[superClass.CLASSID].Methods) : {},
            classId = 'CLASS-' + classes.length,
            data,
            name;

        if (superClass) {
            var Class = new Function();

            Class.prototype = superClass.prototype;
            newClass.prototype = new Class();
            newClass.prototype.constructor = newClass;
            newClass.super = superClass;
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
                                    }
                                    this[classes[0].CLASSID][name] = value;
                                };
                            })
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
                            })
                        };
                        if (data[name] !== undefined) {
                            values[name] = data[name];
                        }
                    }
                }
            }
            delete properties.final;
        }

        // 处理public属性
        if (data = properties.static) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if ('function' === typeof data[name] && !data[name].CLASSID) {
                        newClass[name] = (function (fn) {
                            return function () {
                                callStack.push([null, newClass]);
                                var ret = fn.apply(this, arguments);
                                callStack.pop();
                                return ret;
                            };
                        }(data[name]));
                        methods[name] = makeSuperMethod(name);
                    } else {
                        symbols[name] = {
                            get: (function (name) {
                                return function () {
                                    return this[newClass.CLASSID][name];
                                };
                            }(name)),

                            set: (function (name) {
                                return function (value) {
                                    this[newClass.CLASSID][name] = value;
                                };
                            })
                        };

                        values[name] = data[name];
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
                        newClass.prototype[name] = (function (fn) {
                            return function () {
                                callStack.push([this, newClass]);
                                var ret = fn.apply(this, arguments);
                                callStack.pop();
                                return ret;
                            };
                        }(data[name]));
                    } else {
                        newClass.prototype[name] = data[name];
                    }
                }
            }
        }

        defines[classId] = {
            Constructor: function () {
                Object.defineProperties(this, symbols);

                var args = arguments;

                if (superClass) {
                    var clazz = this[classId].super = {};
                    Object.assign(clazz, defines[superClass.CLASSID].SuperMethods);
                    clazz.super = superClass.prototype;
                    clazz.this = this;
                }

                // 调用全部类和接口的构造函数
                callStack.push([this, newClass]);
                try {
                    if (constructor) {
                        constructor.apply(this, args);
//{if 0}//
                        if (superClass && superClass.super && !this[superClass.CLASSID].super) {
                            console.warn('父类没有初始化');
                        }
//{/if}//
                    }

                    interfaces.forEach(
                        function (inf) {
                            if (defines[inf.CLASSID].PublicFields.constructor) {
                                callStack.push([this, inf]);
                                try {
                                    defines[inf.CLASSID].PublicFields.constructor.apply(this, args);
                                } finally {
                                    callStack.pop();
                                }
                            }
                        },
                        this
                    );
                } finally {
                    callStack.pop();
                }
            },
            Symbols: symbols,
            Values: values,
            Methods: methods
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
}());
