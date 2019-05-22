(function () {
    var classIndex = 1,
        NullClass = {CLASSID: 'CLASS-0'},
        classes = {'CLASS-0': {PrivateFields: [], ProtectedFields: [], FinalFields: []}},
        callStack = [[null, NullClass, {}]],
        superMethods = {};

    function setPrivate(caller, Class, caches) {
        classes[Class.CLASSID].PrivateFields.forEach(function (name) {
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
                classes[Class.CLASSID].ProtectedFields.forEach(set);
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
                classes[clazz.CLASSID].FinalFields.forEach(set);
            }
        }
    }

    function resetPrivate(caller, Class, caches) {
        classes[Class.CLASSID].PrivateFields.forEach(function (name) {
            if (Object.defineProperty) {
                if (!caller.hasOwnProperty(name)) {
                    delete caller[Class.CLASSID][name];
                }
                delete caller[name];
                if (caches.hasOwnProperty(name)) {
                    caller[name] = caches[name];
                }
            } else {
                if ('function' !== typeof classes[Class.CLASSID][name]) {
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
                if ('function' !== classes[Class.CLASSID][name]) {
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
                classes[Class.CLASSID].ProtectedFields.forEach(reset);
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
                classes[clazz.CLASSID].FinalFields.forEach(reset);
            }
        }
    }

    function onbefore(caller, Class) {
        var item = callStack[callStack.length - 1],
            caches = {};

        if (caller) {
            caches.super = window._super;
            window._super = Class.super ? Object.assign(classes[Class.super.CLASSID].Constructor.bind(caller), caller[Class.CLASSID].super) : null;
        }

        if (Class === item[1]) {
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

        if (Class === item[1]) {
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

    function checkProtected(Class) {
        var item = callStack[callStack.length - 1];
        if (item[0] !== this || !Class.isAssignableFrom(item[1])) {
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
                before.apply(this, Class);
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
     * 重新定义类的方法，动态为类增加新的方法。
     * @public
     *
     * @param {Function} Class 类对象
     * @param {string} name 方法名
     * @param {Function} method 方法函数
     */
    _class.defineMethod = function (Class, name, method) {
        Class.prototype[name] = makeProxy(Class, method);
        classes[Class.CLASSID].SuperMethods[name] = makeSuperMethod(name);
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
            this[inf.CLASSID] = Object.assign({}, classes[inf.CLASSID].InitValues);
        }

        function makeProtectedDescriptor(name) {
            if (!propertyDescriptors[name]) {
                propertyDescriptors[name] = {
                    get: function () {
                        checkProtected.call(this, newClass);
                        return this[newClass.CLASSID][name];
                    },
                    set: function (value) {
                        checkProtected.call(this, newClass);
                        this[newClass.CLASSID][name] = value;
                    }
                };
            }
            return propertyDescriptors[name];
        }

        function makeFinalDescriptor(name) {
            if (!propertyDescriptors[name]) {
                propertyDescriptors[name] = {
                    get: function () {
                        return this[newClass.CLASSID][name];
                    },
                    set: function (value) {
                        if (!this[newClass.CLASSID].hasOwnProperty(name)) {
                            this[newClass.CLASSID][name] = value;
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
                    this[clazz.CLASSID] = Object.assign({}, classes[clazz.CLASSID].InitValues);

                    // 初始化所有接口的属性域
                    classes[clazz.CLASSID].Interfaces.forEach(initInterface, this);
                }

                classes[newClass.CLASSID].Constructor.apply(this, arguments);
            },
            privateFields = [],
            protectedFields = [],
            finalFields = [],
            initValues = {},
            superMethods = superClass ? Object.assign({}, classes[superClass.CLASSID].SuperMethods) : {},
            propertyDescriptors = {},
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

        newClass.CLASSID = 'CLASS-' + classIndex++;

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
            for (var name in classes[inf.CLASSID].PublicFields) {
                if (newClass.prototype[name]) {
                    newClass.prototype[name] = addProxy(newClass.prototype[name], classes[inf.CLASSID].PublicFields[name]);
                } else {
                    newClass.prototype[name] = classes[inf.CLASSID].PublicFields[name];
                    superMethods[name] = makeSuperMethod(name);
                }
            }
        });

        classes[newClass.CLASSID] = {
            Constructor: function () {
                var args = arguments;

                if (superClass) {
                    var clazz = this[newClass.CLASSID].super = {};
                    Object.assign(clazz, classes[superClass.CLASSID].SuperMethods);
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
                            if (classes[inf.CLASSID].PublicFields.constructor) {
                                onbefore(this, inf);
                                try {
                                    classes[inf.CLASSID].PublicFields.constructor.apply(this, args);
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

        newClass._cast = function (caller) {
            return caller[newClass.CLASSID];
        };

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

        var newClass = {
                CLASSID: 'CLASS-' + classIndex++
            },
            privateFields = [],
            publicFields = {},
            initValues = {},
            data;

        superInterfaces.forEach(function (inf) {
            for (var name in classes[inf.CLASSID].PublicFields) {
                if (classes[inf.CLASSID].PublicFields.hasOwnProperty(name)) {
                    publicFields[name] = publicFields[name] ? addProxy(publicFields[name], classes[inf.CLASSID].PublicFields[name]) : classes[inf.CLASSID].PublicFields[name];
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

        classes[newClass.CLASSID] = {
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
            onbefore(null, NullClass);
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
        }
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
    }

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
    }
}());
