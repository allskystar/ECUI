/*
Decorator - 装饰器插件基类，使用inline-block附着在控件外围，在控件改变状态时，装饰器同步改变状态。控件最外层装饰器的引
            用通过访问Decorator的属性来得到，属性名为控件对象

属性
_sClass  - 装饰器样式
_eBase  - 装饰器基本Element
_oInner  - 内层装饰器或者控件对象
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        string = core.string,
        ui = core.ui,
        util = core.util,

        DOCUMENT = document,
        MATH = Math,
        REGEXP = RegExp,
        FLOOR = MATH.floor,

        USER_AGENT = navigator.userAgent,
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,
        
        addClass = dom.addClass,
        createDom = dom.create,
        getStyle = dom.getStyle,
        insertBefore = dom.insertBefore,
        insertHTML = dom.insertHTML,
        removeClass = dom.removeClass,
        removeDom = dom.remove,
        toCamelCase = string.toCamelCase,
        copy = util.copy,
        inherits = util.inherits,

        $bind = core.$bind,
        $register = core.$register,
        isFixedSize = core.isFixedSize,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化装饰器，将其附着在控件外围。
     * @public
     *
     * @param {ecui.ui.Control|ecui.ext.Decorator} control 需要装饰的控件
     * @param {string} baseClass 装饰器的基本样式
     * @param {Array} list 需要生成的区块样式名称集合
     */
    var EXT_DECORATOR =
        ext.Decorator = function (control, baseClass, list) {
            //__transform__id_i
            var id = control.getUID(),
                o = (this._oInner = EXT_DECORATOR[id] || control).getOuter();

            insertBefore(this._eBase = createDom(this._sClass = baseClass), o).appendChild(o);
            $bind(this._eBase, control);

            EXT_DECORATOR[id] = this;

            if (!EXT_DECORATOR_OLD_METHODS[id]) {
                // 给控件的方法设置代理访问
                id = EXT_DECORATOR_OLD_METHODS[id] = {};
                for (o in EXT_DECORATOR_PROXY) {
                    id[o] = control[o];
                    control[o] = EXT_DECORATOR_PROXY[o];
                }
            }

            if (list) {
                for (id = 0; o = list[id]; ) {
                    list[id++] =
                        '<div class="' + baseClass + '-' + o +
                            '" style="position:absolute;top:0px;left:0px"></div>';
                }

                insertHTML(this._eBase, 'BEFOREEND', list.join(''));
            }
        },
        EXT_DECORATOR_CLASS = EXT_DECORATOR.prototype,

        EXT_DECORATOR_PROXY = {},
        EXT_DECORATOR_OLD_METHODS = {};
//{else}//
    /**
     * 清除所有的装饰器效果，同时清除所有的代理函数
     * @public
     */
    EXT_DECORATOR.clear = function (control) {
        var id = control.getUID(),
            o;

        // 清除所有的代理函数
        for (o in EXT_DECORATOR_PROXY) {
            delete control[o];

            // 方法不在原型链上需要额外恢复
            if (control[o] != EXT_DECORATOR_OLD_METHODS[id][o]) {
                control[o] = EXT_DECORATOR_OLD_METHODS[id][o];
            }
        }

        o = EXT_DECORATOR[id];

        insertBefore(control.getOuter(), o._eBase);
        removeDom(o._eBase);
        for (; o != control; o = o._oInner) {
            o.$dispose();
        }
        delete EXT_DECORATOR[id];
        delete EXT_DECORATOR_OLD_METHODS[id];
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    EXT_DECORATOR_CLASS.$cache = function (style, cacheSize) {
        this._oInner.$cache(style, cacheSize, true);
        UI_CONTROL_CLASS.$cache.call(this, getStyle(this._eBase), false);
        this._oInner.$cache$position = 'relative';
        this.$cache$position = style.position == 'absolute' ? 'absolute' : 'relative';
        this.$cache$layout =
            ';top:' + style.top + ';left:' + style.left + ';display:' + style.display +
                (ieVersion ? ';zoom:' + style.zoom : '');
    };

    /**
     * 销毁装饰器的默认处理。
     * @protected
     */
    EXT_DECORATOR_CLASS.$dispose = function () {
        this._eBase = null;
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * @protected
     */
    EXT_DECORATOR_CLASS.$init = function () {
        this._eBase.style.cssText = 'position:' + this.$cache$position + this.$cache$layout;
        this._oInner.getOuter(true).style.cssText += ';position:relative;top:auto;left:auto;display:block';
        this._oInner.$init(true);
    };

    /**
     * 控件大小发生变化的默认处理。
     * @protected
     */
    EXT_DECORATOR_CLASS.$resize = function () {
        //__gzip_original__style
        var style = this._eBase.style;

        style.width = '';
        if (!ieVersion) {
            style.height = '';
        }
        this._oInner.$resize(true);
    };

    /**
     * 设置装饰器区域的大小
     * @protected
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    EXT_DECORATOR_CLASS.$setSize = function (width, height) {
        //__gzip_original__style
        //__gzip_original__inner
        var style = this._eBase.style,
            inner = this._oInner,
            invalidWidth = UI_CONTROL_CLASS.$getInvalidWidth.call(this),
            invalidHeight = UI_CONTROL_CLASS.$getInvalidHeight.call(this),
            fixedSize = isFixedSize();

        inner.$setSize(width && width - invalidWidth, height && height - invalidHeight, true);

        style.width = inner.getWidth(true) + (fixedSize ? 0 : invalidWidth) + 'px';
        style.height = inner.getHeight(true) + (fixedSize ? 0 : invalidHeight) + 'px';
    };

    /**
     * 为装饰器增加/删除一个扩展样式。
     * @protected
     *
     * @param {string} className 扩展样式的尾缀
     * @param {boolean} isRemoved 为 true 时删除样式，否则新增样式
     */
    EXT_DECORATOR_CLASS.alterClass = function (className, remove) {
        (remove ? removeClass : addClass)(this._eBase, this._sClass + '-' + className);
        this._oInner.alterClass(className, remove, true);
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @public
     *
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     * @param {boolean} force 是否需要强制刷新缓存，相当于执行了 clearCache 方法，默认不强制刷新
     */
    EXT_DECORATOR_CLASS.cache = function (cacheSize, force) {
        this._oInner.cache(cacheSize, force, true);
    };

    /**
     * 获取装饰器的基本样式名称
     * @public
     *
     * @return {string} 装饰器的基本样式名称
     */
    EXT_DECORATOR_CLASS.getClass = function () {
        return this._sClass;
    };

    /**
     * 获取装饰器区域的高度
     * @public
     *
     * @return {number} 装饰器区域的高度
     */
    EXT_DECORATOR_CLASS.getHeight = function () {
        return this._oInner.getHeight(true) + UI_CONTROL_CLASS.$getInvalidHeight.call(this);
    };

    /**
     * 获取装饰器内外区域的高度差
     * @public
     *
     * @return {number} 装饰器内外区域的高度差
     */
    EXT_DECORATOR_CLASS.getInvalidHeight = function () {
        return this._oInner.getInvalidHeight(true) + UI_CONTROL_CLASS.$getInvalidHeight.call(this);
    };

    /**
     * 获取装饰器内外区域的宽度差
     * @public
     *
     * @return {number} 装饰器内外区域的宽度差
     */
    EXT_DECORATOR_CLASS.getInvalidWidth = function () {
        return this._oInner.getInvalidWidth(true) + UI_CONTROL_CLASS.$getInvalidWidth.call(this);
    };

    /**
     * 获取装饰器的外框Element
     * @public
     *
     * @return {Element} 外框Element
     */
    EXT_DECORATOR_CLASS.getOuter = function () {
        return this._eBase;
    };

    /**
     * 获取装饰器区域的宽度
     * @public
     *
     * @return {number} 装饰器区域的宽度
     */
    EXT_DECORATOR_CLASS.getWidth = function () {
        return this._oInner.getWidth(true) + UI_CONTROL_CLASS.$getInvalidWidth.call(this);
    };

    /**
     * 释放对象时需要先释放装饰器
     * @protected
     */
    EXT_DECORATOR_PROXY.$dispose = function () {
        EXT_DECORATOR.clear(this);
        this.$dispose();
    };

    (function () {
        function build(name, index) {
            EXT_DECORATOR_PROXY[name] = function () {
                var id = this.getUID(),
                    o = EXT_DECORATOR[id],
                    args = arguments;

                return args[index] ? EXT_DECORATOR_OLD_METHODS[id][name].apply(this, args) : o[name].apply(o, args);
            };
        }

        // 这里批量生成函数代理
        for (
            var i = 0, names = [
                ['$cache', 2], ['$init', 0], ['$resize', 0], ['$setSize', 2],
                ['alterClass', 2], ['cache', 2], ['getHeight', 0],
                ['getInvalidHeight', 0], ['getInvalidWidth', 0],
                ['getOuter', 0], ['getWidth', 0]
            ];
            i < 11;
        ) {
            // 如果是代理进入的，会多出来一个参数作为标志位
            build(names[i][0], names[i++][1]);
        }
    })();

    $register('decorate', function (control, param) {
        param.replace(/([A-Za-z0-9\-]+)\s*\(\s*([^)]+)\)/g, function ($0, $1, $2) {
            // 获取装饰器函数
            $1 = ext[toCamelCase($1.charAt(0).toUpperCase() + $1.slice(1))];

            // 获取需要调用的装饰器列表
            $2 = $2.split(/\s+/);
            // 以下使用 el 计数
            for (var i = 0; $0 = $2[i++]; ) {
                new $1(control, $0);
            }
        });
    });
//{/if}//
/*
LRDecorator - 左右扩展装饰器，将区域分为"左-控件-右"三部分，使用paddingLeft与paddingRight作为左右区域的宽度
*/
//{if $phase == "define"}//
    /**
     * 初始化左右扩展装饰器，将其附着在控件外围。
     * @public
     *
     * @param {Control} control 需要装饰的控件
     * @param {string} baseClass 装饰器的基本样式
     */
    var EXT_LR_DECORATOR =
        ext.LRDecorator = function (control, baseClass) {
            EXT_DECORATOR.call(this, control, baseClass, ['left', 'right']);
        };
//{else}//
    /**
     * 设置装饰器区域的大小
     * @public
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    inherits(EXT_LR_DECORATOR, EXT_DECORATOR).$setSize = function (width, height) {
        EXT_DECORATOR_CLASS.$setSize.call(this, width, height);

        var o = this._eBase.lastChild,
            text = ';top:' + this.$cache$paddingTop + 'px;height:' + this._oInner.getHeight(true) + 'px;width:';

        o.style.cssText +=
            text + this.$cache$paddingRight + 'px;left:' +
                (this.$cache$paddingLeft + this._oInner.getWidth(true)) + 'px';
        o.previousSibling.style.cssText += text + this.$cache$paddingLeft + 'px';
    };
//{/if}//
/*
TBDecorator - 上下扩展装饰器，将区域分为"上-控件-下"三部分，使用paddingTop与paddingBottom作为上下区域的高度
*/
//{if $phase == "define"}//
        /**
         * 初始化上下扩展装饰器，将其附着在控件外围。
         * @public
         *
         * @param {Control} control 需要装饰的控件
         * @param {string} baseClass 装饰器的基本样式
         */
    var EXT_TB_DECORATOR =
        ext.TBDecorator = function (control, baseClass) {
            EXT_DECORATOR.call(this, control, baseClass, ['top', 'bottom']);
        };
//{else}//
    /**
     * 设置装饰器区域的大小
     * @public
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    inherits(EXT_TB_DECORATOR, EXT_DECORATOR).$setSize = function (width, height) {
        EXT_DECORATOR_CLASS.$setSize.call(this, width, height);

        var o = this._eBase.lastChild,
            text = ';left:' + this.$cache$paddingLeft + 'px;width:' + this._oInner.getWidth(true) + 'px;height:';

        o.style.cssText +=
            text + this.$cache$paddingBottom + 'px;top:' +
                (this.$cache$paddingTop + this._oInner.getHeight(true)) + 'px';
        o.previousSibling.style.cssText += text + this.$cache$paddingTop + 'px';
    };
//{/if}//
/*
MagicDecorator - 九宫格扩展装饰器，将区域分为"左上-上-右上-左-控件-右-左下-下-右下"九部分，使用padding定义宽度与高度
*/
//{if $phase == "define"}//
    /**
     * 初始化九宫格扩展装饰器，将其附着在控件外围。
     * @public
     *
     * @param {Control} control 需要装饰的控件
     * @param {string} baseClass 装饰器的基本样式
     */
    var EXT_MAGIC_DECORATOR =
        ext.MagicDecorator = function (control, baseClass) {
            EXT_DECORATOR.call(
                this,
                control,
                baseClass,
                ['widget0', 'widget1', 'widget2', 'widget3', 'widget5', 'widget6', 'widget7', 'widget8']
            );
        };
//{else}//
    /**
     * 设置装饰器区域的大小
     * @public
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    inherits(EXT_MAGIC_DECORATOR, EXT_DECORATOR).$setSize = function (width, height) {
        EXT_DECORATOR_CLASS.$setSize.call(this, width, height);

        var o = this._eBase.lastChild,
            i = 9,
            paddingTop = this.$cache$paddingTop,
            paddingLeft = this.$cache$paddingLeft,
            widthList = this._oInner.getWidth(true),
            heightList = this._oInner.getHeight(true),
            topList = [0, paddingTop, paddingTop + heightList],
            leftList = [0, paddingLeft, paddingLeft + widthList];

        widthList = [paddingLeft, widthList, this.$cache$paddingRight];
        heightList = [paddingTop, heightList, this.$cache$paddingBottom];

        for (; i--; ) {
            if (i != 4) {
                o.style.cssText +=
                    ';top:' + topList[FLOOR(i / 3)] + 'px;left:' + leftList[i % 3] + 'px;width:' + widthList[i % 3] +
                        'px;height:' + heightList[FLOOR(i / 3)] + 'px';
                o = o.previousSibling;
            }
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//
