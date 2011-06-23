//{if 0}//
(function () {
    var core = ecui,
        array = core.array,
        dom = core.dom,
        string = core.string,
        util = core.util,
        ui = core.ui,

        undefined,
        WINDOW = window,
        DOCUMENT = document,
        MATH = Math,
        REGEXP = RegExp,
        ABS = MATH.abs,
        MAX = MATH.max,
        MIN = MATH.min,
        ISNAN = isNaN,

        USER_AGENT = navigator.userAgent,
        isStrict = DOCUMENT.compatMode == 'CSS1Compat',
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(USER_AGENT) ? REGEXP.$1 - 0 : undefined,

        remove = array.remove,
        addClass = dom.addClass,
        contain = dom.contain,
        createDom = dom.create,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        getStyle = dom.getStyle,
        insertHTML = dom.insertHTML,
        ready = dom.ready,
        removeDom = dom.remove,
        removeClass = dom.removeClass,
        setStyle = dom.setStyle,
        toCamelCase = string.toCamelCase,
        attachEvent = util.attachEvent,
        blank = util.blank,
        copy = util.copy,
        detachEvent = util.detachEvent,
        getView = util.getView,
        timer = util.timer,
        toNumber = util.toNumber;
//{/if}//
//{if $phase == "define"}//
    var NORMAL = core.NORMAL = 0,
        INIT = core.INIT = 1,
        PAINT = core.PAINT = 2;

//__gzip_unitize__event
    var $bind,
        $connect,
        $create,
        $fastCreate,
        $register,
        calcHeightRevise,
        calcLeftRevise,
        calcTopRevise,
        calcWidthRevise,
        createControl,
        disposeControl,
        drag,

        /**
         * 从指定的 DOM 节点开始，依次向它的父节点查找绑定的 ECUI 控件。
         * findControl 方法，会返回从当前 DOM 节点开始，依次向它的父节点查找到的第一个绑定(参见 $bind 方法)的 ECUI 控件。findControl 方法一般在控件创建时使用，用于查找父控件对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {ecui.ui.Control} ECUI 控件对象，如果不能找到，返回 null
         */
        findControl = core.findControl = function (el) {
            for (; el; el = getParent(el)) {
                if (el.getControl) {
                    return el.getControl();
                }
            }

            return null;
        },

        getAttributeName,
        getFocused,
        getKey,
        getMouseX,
        getMouseY,
        getParameters,
        getPressed,
        getScrollNarrow,
        getStatus,
        intercept,
        isFixedSize,
        loseFocus,
        mask,
        query,
        restore,
        setFocused,
        standardEvent,

        eventNames = [
            'mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup',
            'pressstart', 'pressover', 'pressmove', 'pressout', 'pressend',
            'click', 'focus', 'blur', 'keydown', 'keypress', 'keyup', 'mousewheel',
            'change', 'resize', 'create', 'init'
        ];
//{else}//
    (function () {
        var ecuiName = 'ecui',        // Element 中用于自动渲染的 ecui 属性名称
            isGlobalId,               // 是否自动将 ecui 的标识符全局化

            flgFixedSize,             // 在计算宽度与高度时，是否需要修正内填充与边框样式的影响
            flgFixedOffset,           // 在计算相对位置时，是否需要修正边框样式的影响
            scrollNarrow,             // 浏览器滚动条相对窄的一边的长度

            initRecursion = 0,        // init 操作的递归次数
            lastClientWidth,          // 浏览器之前的宽度

            plugins = {},             // 扩展组件列表
            maskElements = [],        // 遮罩层组

            mouseX,                   // 当前鼠标光标的X轴坐标
            mouseY,                   // 当前鼠标光标的Y轴坐标
            keyCode = 0,              // 当前键盘按下的键值，解决keypress与keyup中得不到特殊按键的keyCode的问题

            status,                   // 框架当前状态
            allControls = [],         // 全部生成的控件，供释放控件占用的内存使用
            independentControls = [], // 独立的控件，即使用create($create)方法创建的控件
            namedControls,            // 所有被命名的控件的集合
            uniqueIndex = 0,          // 控件的唯一序号
            connectedControls = {},   // 等待关联的控件集合

            selectorControl,          // 在select操作时使用此控件展现选择的部分

            pressedControl,           // 当前环境下被按压的控件
            overedControl,            // 当前鼠标移入的控件
            focusedControl,           // 当前环境下拥有焦点的控件

            envStack = [],            // 高优先级事件调用时，保存上一个事件环境的栈
            currEnv = {               // 当前操作的环境数据对象

                mousedown: function (event) {
                    event = standardEvent(event);

                    // 改变框架中被激活的控件
                    //__transform__control_o
                    var control = event.getTarget();
                    pressedControl = null;

                    if (control) {
                        if (!isScrollClick(event)) {
                            mousedown(control, event);
                        }
                        else if (ieVersion < 8) {
                            return;
                        }

                        for (; control; control = control.getParent()) {
                            if (control.isFocusable()) {
                                if (!(control != pressedControl && control.contain(focusedControl))) {
                                    setFocused(control);
                                }
                                break;
                            }
                        }
                    }
                    else {
                        if (control = findControl(event.target)) {
                            // 如果点击到了disabled的控件上，可能需要取消默认事件
                            mousedown(control, event, true);
                        }
                        else {
                            setFocused();
                        }
                    }
                },

                mouseover: function (event) {
                    // 鼠标移入的处理，首先需要计算是不是位于之前移出的控件之外，如果是需要触发之前的移出事件
                    event = standardEvent(event);

                    //__transform__control_o
                    var control = event.getTarget(),
                        parent = getCommonParent(control, overedControl),
                        allowPress = currEnv.type;

                    // 在拖曳与缩放状态时，不进行按压移入移出的处理
                    allowPress = allowPress != 'drag' && allowPress != 'zoom' && pressedControl &&
                        (!parent || parent.contain(pressedControl));

                    // 对控件及其父控件序列进行移出或移入操作，针对公共的父控件不进行处理
                    bubble(overedControl, 'mouseout', event, parent);
                    if (allowPress && pressedControl.contain(overedControl)) {
                        pressedControl.pressout(event);
                    }
                    bubble(control, 'mouseover', event, parent);
                    if (allowPress && pressedControl.contain(control)) {
                        pressedControl.pressover(event);
                    }

                    overedControl = control;
                },

                mousemove: function (event) {
                    event = standardEvent(event);

                    //__transform__control_o
                    var control = event.getTarget();

                    // 对控件及其父控件序列进行移动操作
                    bubble(control, 'mousemove', event);
                    if (pressedControl && pressedControl.contain(control)) {
                        pressedControl.pressmove(event);
                    }
                },

                mouseup: function (event) {
                    event = standardEvent(event);

                    //__transform__control_o
                    var control = event.getTarget();

                    bubble(control, 'mouseup', event);
                    if (pressedControl) {
                        pressedControl.pressend(event);
                        // 点击事件只在鼠标按下与弹起发生在同一个控件上时触发
                        if (control == pressedControl) {
                            pressedControl.click(event);
                        }
                        pressedControl = null;
                    }
                }
            },

            dragEnv = { // 拖曳操作的环境数据对象
                type: 'drag',

                mousemove: function (event) {
                    event = standardEvent(event);

                    // 计算限制拖拽的范围
                    //__transform__target_o
                    var target = currEnv.target,
                        // 计算期待移到的位置
                        expectX = target.getX() + mouseX - currEnv.x,
                        expectY = target.getY() + mouseY - currEnv.y,
                        // 计算实际允许移到的位置
                        x = MIN(MAX(expectX, currEnv.left), currEnv.right),
                        y = MIN(MAX(expectY, currEnv.top), currEnv.bottom);

                    if (!(target.ondragmove && target.ondragmove(event, x, y) === false ||
                            target.$dragmove(event, x, y) === false)) {
                        target.setPosition(x, y);
                    }

                    currEnv.x = mouseX + target.getX() - expectX;
                    currEnv.y = mouseY + target.getY() - expectY;
                },

                mouseup: function (event) {
                    event = standardEvent(event);

                    //__transform__target_o
                    var target = currEnv.target;
                    if (!(target.ondragend && target.ondragend(event) === false)) {
                        target.$dragend(event);
                    }
                    restore();
                    // 恢复IE浏览器外事件捕获的规则
                    if (ieVersion) {
                        DOCUMENT.body.releaseCapture(false);
                    }
                    currEnv.mouseup(event);
                }
            },

            interceptEnv = { // 强制点击拦截操作的环境数据对象
                type: 'intercept',

                mousedown: function (event) {
                    event = standardEvent(event);

                    //__transform__target_o
                    var target = currEnv.target,
                        env = currEnv,
                        control = event.getTarget();

                    if (!isScrollClick(event)) {
                        if (control && !control.isFocusable()) {
                            // 需要捕获但不激活的控件是高优先级处理的控件
                            mousedown(control, event);
                        }
                        else if (target.onintercept && target.onintercept(event) === false ||
                                    target.$intercept(event) === false) {
                            if (env == currEnv) {
                                if (control) {
                                    mousedown(control, event);
                                }
                            }
                            else {
                                currEnv.mousedown(event);
                            }
                        }
                        else {
                            restore();
                        }
                    }
                }
            },

            zoomEnv = { // 缩放操作的环境数据对象
                type: 'zoom',

                mousemove: function (event) {
                    event = standardEvent(event);

                    //__gzip_original__minWidth
                    //__gzip_original__maxWidth
                    //__gzip_original__minHeight
                    //__gzip_original__maxHeight
                    //__transform__target_o
                    var target = currEnv.target,
                        width = currEnv.width = mouseX - currEnv.x + currEnv.width,
                        height = currEnv.height = mouseY - currEnv.y + currEnv.height,
                        minWidth = currEnv.minWidth,
                        maxWidth = currEnv.maxWidth,
                        minHeight = currEnv.minHeight,
                        maxHeight = currEnv.maxHeight;

                    currEnv.x = mouseX;
                    currEnv.y = mouseY;

                    width = minWidth > width ? minWidth : maxWidth < width ? maxWidth : width;
                    height = minHeight > height ? minHeight : maxHeight < height ? maxHeight : height;

                    // 如果宽度或高度是负数，需要重新计算定位
                    target.setPosition(currEnv.left + MIN(width, 0), currEnv.top + MIN(height, 0));
                    if (!(target.onzoom && target.onzoom(event) === false || target.$zoom(event) === false)) {
                        target.setSize(ABS(width), ABS(height));
                    }
                },

                mouseup: function (event) {
                    event = standardEvent(event);

                    //__transform__target_o
                    var target = currEnv.target;
                    if (!(target.onzoomend && target.onzoomend(event) === false)) {
                        target.$zoomend(event);
                    }
                    restore();
                    if (ieVersion) {
                        DOCUMENT.body.releaseCapture(false);
                    }

                    // 如果是选择框需要关闭
                    if (target == selectorControl) {
                        target.hide();
                    }
                    else {
                        paint();
                    }
                    currEnv.mouseup(event);
                }
            },

            /**
             * 重绘浏览器区域的控件。
             * paint 方法在页面改变大小时自动触发，一些特殊情况下，例如包含框架的页面，页面变化时不会触发 onresize 事件，需要手工调用 paint 函数刷新所有的控件大小。
             * @public
             */
            paint = core.paint = function () {
                var i = 0,
                    list = [],
                    o;

                if (ieVersion) {
                    o = (isStrict ? DOCUMENT.documentElement : DOCUMENT.body).clientWidth;
                    if (lastClientWidth != o) {
                        lastClientWidth = o;
                    }
                    else {
                        // 阻止 ie6/7 下的重入
                        return;
                    }
                }

                status = PAINT;
                o = currEnv.type;
                mask(false);
                if (o != 'zoom') {
                    // 改变窗体大小需要清空拖拽状态
                    if (o == 'drag') {
                        currEnv.mouseup();
                    }
                    for (o = null; o !== undefined; o = list[i++]) {
                        for (var j = 0, controls = query({parent: o}); o = controls[j++]; ) {
                            if (o.isShow()) {
                                list.push(o);
                            }
                        }
                    }

                    for (i = 0; o = list[i++]; ) {
                        o.paint = blank;
                        o.resize();
                        delete o.paint;
                        if (ieVersion < 8) {
                            // 修复ie6/7下宽度自适应错误的问题
                            o = getStyle(j = o.getBase());
                            if (o.width == 'auto' && o.display == 'block') {
                                j.style.width = '100%';
                            }
                        }
                    }

                    if (ieVersion < 8) {
                        for (; o = list[--i]; ) {
                            j = o.getBase();
                            j.style.width = j.offsetWidth - (flgFixedSize ? o.getInvalidWidth(true) * 2 : 0) + 'px';
                        }
                    }

                    for (i = 0; o = list[i++]; ) {
                        o.cache(true, true);
                    }
                    for (i = 0; o = list[i++]; ) {
                        o.$setSize(o.getWidth(), o.getHeight());
                    }
                }
                if (ieVersion < 8) {
                    timer(mask, 0, null, true);
                }
                else {
                    mask(true);
                }
                status = NORMAL;
            };

        /**
         * 使一个 DOM 节点与一个 ECUI 控件 在逻辑上绑定。
         * 一个 DOM 节点只能绑定一个 ECUI 控件，多次绑定仅第一次有效，绑定后的 DOM 节点可以通过 getControl 方法得到绑定的 ECUI 控件。使用页面静态初始化(参见 ECUI 使用方式)控件后，如果需要修改 DOM 节点绑定的 ECUI 控件，通过改变 DOM 节点的 ecui 属性值，并调用核心提供的 init 方法初始化，是无效的。请调用 dispose 方法释放控件后，重新初始化，控件的 $dispose 方法或 ondispose 事件中需要释放与其相关联的所有 DOM 绑定。
         * @protected
         *
         * @param {HTMLElement} el Element 对象
         * @param {ecui.ui.Control} control ECUI 控件
         * @return {boolean} 绑定操作是否成功
         */
        $bind = core.$bind = function (el, control) {
            if (!el.getControl) {
                el._cControl = control;
                el.getControl = getControlByElement;
                return true;
            }
            return false;
        };

        /**
         * 为两个 ECUI 控件 建立连接。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)方式，控件创建后，需要的关联控件也许还未创建。$connect 方法提供将指定的函数滞后到对应的控件创建后才调用的模式。如果 targetId 对应的控件还未创建，则调用会被搁置，直到需要的控件创建成功后，再自动执行，参见 create 方法。
         * @protected
         *
         * @param {ecui.ui.Control} caller 发起建立连接请求的 ECUI 控件
         * @param {Function} func 用于建立连接的方法，即通过调用 func.call(caller, ecui.get(targetId)) 建立连接
         * @param {string} targetId 被连接的 ECUI 控件 标识符，即在标签的 ecui 属性中定义的 id 值
         */
        $connect = core.$connect = function (caller, func, targetId) {
            if (targetId) {
                var target = namedControls[targetId];
                if (target) {
                    func.call(caller, target);
                }
                else {
                    (connectedControls[targetId] = connectedControls[targetId] || [])
                        .push({func: func, caller: caller});
                }
            }
        };

        /**
         * 创建 ECUI 控件。
         * $create 方法创建 ECUI 控件，不会自动渲染控件，为了加快渲染速度，应该首先使用 $create 方法创建完所有的控件后，再调用控件的 cache 与 paint 方法渲染控件。params 参数对象支持的属性如下：
         * id        {string} 当前控件的 id，提供给 $connect 与 get 方法使用
         * base      {string} 控件的基本样式，参见 getBaseClass 方法，如果忽略此参数将使用基本 Element 对象的 className 属性
         * element   {HTMLElement} 与控件绑捆的 Element 对象，参见 getBase 方法，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent    {ecui.ui.Control} 父控件对象或者父 Element 对象
         * type      {string} 控件的默认样式，通常情况下省略此参数，使用 "ec-控件名称" 作为控件的默认样式
         * @protected
         *
         * @param {string} type 控件的名称
         * @param {Object} params 初始化参数，参见 ECUI 控件
         * @return {ecui.ui.Control} ECUI 控件
         */
        $create = core.$create = function (type, params) {
            params = params || {};

            //__gzip_original__parent
            //__gzip_original__id
            //__gzip_original__typeClass
            var i = 0,
                parent = params.parent,
                id = params.id,
                // 如果没有指定初始化控件，需要自己生成一个
                el = params.element || createDom(),
                typeClass = params.type,
                o = params.base || '';

            // 如果指定的节点已经初始化，直接返回
            if (el.getControl) {
                return el.getControl();
            }

            params.uid = 'ec-' + ++uniqueIndex;

            el.className +=
                ' ' + (typeClass && typeClass != type ? typeClass : params.type = 'ec-' + type.toLowerCase()) +
                ' ' + o;
            // 如果没有指定基本样式，使用控件的样式作为基本样式
            if (!o) {
                o = el.className.split(/\s+/);
                params.base = o[0] || o[1];
            }

            // 生成并注册控件，调用创建控件的处理函数
            type = new ui[toCamelCase(type.charAt(0).toUpperCase() + type.slice(1))](el, params);

            // 指定了父控件的元素都是不需要自动刷新的
            if (parent) {
                type.setParent(parent);
            }
            else if (o = findControl(getParent(type.getOuter()))) {
                if (!(o.onappend && o.onappend(type) === false || o.$append(type) === false)) {
                    type.$setParent(o);
                }
            }
            else {
                type.$setParent();
            }

            allControls.push(type);
            independentControls.push(type);
            type.create(params);

            if (id) {
                namedControls[id] = type;
                if (isGlobalId) {
                    WINDOW[id] = type;
                }
            }

            // 处理所有的关联操作
            if (el = connectedControls[id]) {
                for (connectedControls[id] = null; o = el[i++]; ) {
                    o.func.call(o.caller, type);
                }
            }

            return type;
        };

        /**
         * 快速创建 ECUI 控件。
         * $fastCreate 方法分解 Element 对象的 className 属性得到样式信息，其中第一个样式为类型样式，第二个样式为基本样式。
         * @protected
         *
         * @param {Function} type 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {Object} params 初始化参数，参见 ECUI 控件
         * @return {ecui.ui.Control} ECUI 控件
         */
        $fastCreate = core.$fastCreate = function (type, el, parent, params) {
            if (!initRecursion) {
                status = INIT;
            }
            var o = el.className.split(' ');

            params = params || {};

            params.uid = 'ec-' + ++uniqueIndex;
            params.type = o[0];
            params.base = o[1];

            // 生成并注册控件，调用创建控件的处理函数
            type = new type(el, params);
            type.$setParent(parent);
            type.create(params);

            allControls.push(type);
            if (!initRecursion) {
                status = NORMAL;
            }
            return type;
        };

        /**
         * 注册一个扩展组件。
         * @protected
         *
         * @param {string} name 扩展组件的参数名称
         * @param {Function} func 扩展组件的初始化函数
         */
        $register = core.$register = function (name, func) {
            plugins[name] = func;
        };

        /**
         * 获取高度修正值(即计算 padding, border 样式对 height 样式的影响)。
         * IE 在盒子模型上不完全遵守 W3C 标准，因此，需要使用 calcHeightRevise 方法计算 offsetHeight 与实际的 height 样式之间的修正值。
         * @public
         *
         * @param {CssStyle} style CssStyle 对象
         * @return {number} 高度修正值
         */
        calcHeightRevise = core.calcHeightRevise = function (style) {
            return flgFixedSize ? toNumber(style.borderTopWidth) + toNumber(style.borderBottomWidth) +
                    toNumber(style.paddingTop) + toNumber(style.paddingBottom)
                : 0;
        };

        /**
         * 获取左定位修正值(即计算 border 样式对 left 样式的影响)。
         * opera 等浏览器，offsetLeft 与 left 样式的取值受到了 border 样式的影响，因此，需要使用 calcLeftRevise 方法计算 offsetLeft 与实际的 left 样式之间的修正值。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {number} 左定位修正值
         */
        calcLeftRevise = core.calcLeftRevise = function (el) {
            //__transform__style_o
            var style = getStyle(el.offsetParent);
            return !firefoxVersion || style.overflow != 'visible' && getStyle(el, 'position') == 'absolute' ?
                toNumber(style.borderLeftWidth) * flgFixedOffset : 0;
        };

        /**
         * 获取上定位修正值(即计算 border 样式对 top 样式的影响)。
         * opera 等浏览器，offsetTop 与 top 样式的取值受到了 border 样式的影响，因此，需要使用 calcTopRevise 方法计算 offsetTop 与实际的 top 样式之间的修正值。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {number} 上定位修正值
         */
        calcTopRevise = core.calcTopRevise = function (el) {
            //__transform__style_o
            var style = getStyle(el.offsetParent);
            return !firefoxVersion || style.overflow != 'visible' && getStyle(el, 'position') == 'absolute' ?
                toNumber(style.borderTopWidth) * flgFixedOffset : 0;
        };

        /**
         * 获取宽度修正值(即计算 padding,border 样式对 width 样式的影响)。
         * IE 在盒子模型上不完全遵守 W3C 标准，因此，需要使用 calcWidthRevise 方法计算 offsetWidth 与实际的 width 样式之间的修正值。
         * @public
         *
         * @param {CssStyle} style CssStyle 对象
         * @return {number} 宽度修正值
         */
        calcWidthRevise = core.calcWidthRevise = function (style) {
            return flgFixedSize ? toNumber(style.borderLeftWidth) + toNumber(style.borderRightWidth) +
                    toNumber(style.paddingLeft) + toNumber(style.paddingRight)
                : 0;
        };

        /**
         * 创建 ECUI 控件。
         * 标准的创建 ECUI 控件 的工厂方法，所有的 ECUI 控件 都应该通过 create 方法或者 $create 方法生成。params 参数对象支持的属性如下：
         * id        {string} 当前控件的 id，提供给 $connect 与 get 方法使用
         * base      {string} 控件的基本样式，参见 getBaseClass 方法，如果忽略此参数将使用基本 Element 对象的 className 属性
         * element   {HTMLElement} 与控件绑捆的 Element 对象，参见 getBase 方法，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent    {ecui.ui.Control} 父控件对象或者父 Element 对象
         * type      {string} 控件的默认样式，通常情况下省略此参数，使用 "ec-控件名称" 作为控件的默认样式
         * @public
         *
         * @param {string} type 控件的名称
         * @param {Object} params 初始化参数，参见 ECUI 控件
         * @return {ecui.ui.Control} ECUI 控件
         */
        createControl = core.create = function (type, params) {
            if (!initRecursion) {
                status = INIT;
            }
            type = $create(type, params);
            type.cache();
            type.init();
            if (!initRecursion) {
                status = NORMAL;
            }
            return type;
        };

        /**
         * 释放 ECUI 控件及其子控件占用的内存。
         * @public
         *
         * @param {ecui.ui.Control|HTMLElement} control 需要释放的控件对象或包含控件的 DOM 节点
         */
        disposeControl = core.dispose = function (control) {
            var i = 0,
//{if 0}//
                type = control instanceof ui.Control,
//{else}//                type = control instanceof UI_CONTROL,
//{/if}//
                namedMap = {},
                o;

            // 释放激活的控件
            if (type) {
                loseFocus(control);
            }
            else if (focusedControl && contain(control, focusedControl.getOuter())) {
                setFocused(findControl(getParent(control)));
            }

            for (o in namedControls) {
                namedMap[namedControls[o].getUID()] = o;
            }

            for (; o = allControls[i++]; ) {
                if (type ? control.contain(o) : !!o.getOuter() && contain(control, o.getOuter())) {
                    if (o == overedControl) {
                        overedControl = null;
                    }
                    if (o == pressedControl) {
                        pressedControl = null;
                    }
                    o.dispose();
                    remove(independentControls, o);
                    if (o = namedMap[o.getUID()]) {
                        delete namedControls[o];
                    }
                    allControls.splice(--i, 1);
                }
            }
        };

        /**
         * 将指定的 ECUI 控件 设置为拖拽状态。
         * 只有在鼠标左键按下时，才允许调用 drag 方法设置待拖拽的 {'controls'|menu}，在拖拽操作过程中，将依次触发 ondragstart、ondragmove 与 ondragend 事件。range 参数支持的属性如下：
         * top    {number} 控件允许拖拽到的最小Y轴坐标
         * right  {number} 控件允许拖拽到的最大X轴坐标
         * bottom {number} 控件允许拖拽到的最大Y轴坐标
         * left   {number} 控件允许拖拽到的最小X轴坐标
         * @public
         *
         * @param {ecui.ui.Control} control 需要进行拖拽的 ECUI 控件对象
         * @param {Event} event 事件对象
         * @param {Object} range 控件允许拖拽的范围，省略参数时，控件默认只允许在 offsetParent 定义的区域内拖拽，如果 
         *                       offsetParent 是 body，则只允许在当前浏览器可视范围内拖拽
         */
        drag = core.drag = function (control, event, range) {
            if (event.type == 'mousedown') {
                //__gzip_original__currStyle
                var el = control.getOuter(),
                    parent = el.offsetParent,
                    style = getStyle(parent),
                    currStyle = el.style;

                copy(dragEnv, parent.tagName == 'BODY' || parent.tagName == 'HTML' ? getView() : {
                    top: 0,
                    right: parent.offsetWidth - toNumber(style.borderLeftWidth) - toNumber(style.borderRightWidth),
                    bottom: parent.offsetHeight - toNumber(style.borderTopWidth) - toNumber(style.borderBottomWidth),
                    left: 0
                });
                copy(dragEnv, range);
                dragEnv.right = MAX(dragEnv.right - control.getWidth(), dragEnv.left);
                dragEnv.bottom = MAX(dragEnv.bottom - control.getHeight(), dragEnv.top);
                dragEnv.target = control;
                setEnv(dragEnv);

                // 设置样式为absolute，才能拖拽
                currStyle.top = control.getY() + 'px';
                currStyle.left = control.getX() + 'px';
                currStyle.position = 'absolute';

                if (ieVersion) {
                    DOCUMENT.body.setCapture();
                }
                if (!(control.ondragstart && control.ondragstart(event) === false)) {
                    control.$dragstart(event);
                }
            }
        };

        /**
         * 事件对象标准化。
         * event 方法将浏览器产生的鼠标与键盘事件标准化并添加 ECUI 框架需要的信息到事件对象中。标准化的属性如下：
         * pageX           {number} 鼠标的X轴坐标
         * pageY           {number} 鼠标的Y轴坐标
         * which           {number} 触发事件的键盘代码
         * target          {HTMLElement} 触发事件的 Element 对象
         * stopPropagation {Function} 事件停止冒泡
         * preventDefault  {Function} 阻止事件默认的处理
         * getTarget       {Function} 获取事件相关的 ECUI 控件对象
         * @public
         *
         * @param {Event} event 事件对象
         * @return {Event} 标准化后的事件对象
         */
        standardEvent = core.event = function (event) {
            var body = DOCUMENT.body,
                html = getParent(body);

            if (ieVersion) {
                event = WINDOW.event;
                event.pageX = html.scrollLeft + body.scrollLeft - html.clientLeft + event.clientX - body.clientLeft;
                event.pageY = html.scrollTop + body.scrollTop - html.clientTop + event.clientY - body.clientTop;
                event.target = event.srcElement;
                event.which = event.keyCode;
                event.stopPropagation = stopPropagation;
                event.preventDefault = preventDefault;
            }

            event.getTarget = getTarget;

            mouseX = event.pageX;
            mouseY = event.pageY;

            return event;
        };

        /**
         * 获取指定名称的 ECUI 控件。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)创建的控件，如果在 ecui 属性中指定了 id，就可以通过 get 方法得到控件，也可以在 DOM 对象上使用 getControl 方法。
         * @public
         *
         * @param {string} id ECUI 控件的名称，通过 DOM 节点的 ecui 属性的 id 值定义
         * @return {ecui.ui.Control} 指定名称的 ECUI 控件对象，如果不存在返回 null
         */
        core.get = function (id) {
            if (!namedControls) {
                // 接管事件处理
                for (o in currEnv) {
                    attachEvent(DOCUMENT, o, currEnv[o]);
                }

                namedControls = {};

                // 检测Element宽度与高度的计算方式
                //__gzip_original__body
                var body = DOCUMENT.body,
                    o = getParameters(body, 'data-ecui');

                ecuiName = o.name || ecuiName;
                isGlobalId = o.globalId;

                insertHTML(
                    body,
                    'BEFOREEND',
                    '<div style="position:absolute;overflow:scroll;top:-90px;left:-90px;width:80px;height:80px;' +
                        'border:1px solid"><div style="position:absolute;top:0px;height:90px"></div></div>'
                );
                o = body.lastChild;
                flgFixedSize = o.offsetWidth > 80;
                flgFixedOffset = o.lastChild.offsetTop;
                scrollNarrow = o.offsetWidth - o.clientWidth - 2;
                removeDom(o);
                attachEvent(WINDOW, 'resize', paint);
                attachEvent(WINDOW, 'unload', onunload);
                attachEvent(WINDOW, 'scroll', onscroll);

                // 自动初始化所有节点
                core.init(body);
                status = NORMAL;
            }
            return namedControls[id] || null;
        };

        /**
         * 获取当前的初始化属性名称。
         * getAttributeName 方法返回页面静态初始化(参见 ECUI 使用方式)使用的属性名称，通过在 BODY 节点的 data-ecui 属性中指定，默认使用 ecui 作为初始化属性名称。
         * @public
         *
         * @return {string} 当前的初始化属性名称
         */
        getAttributeName = core.getAttributeName = function () {
            return ecuiName;
        };

        /**
         * 获取当前拥有焦点的控件。
         * @public
         *
         * @return {ecui.ui.Control} 当前拥有焦点的 ECUI 控件，如果不存在返回 null
         */
        getFocused = core.getFocused = function () {
            return focusedControl || null;
        };

        /**
         * 获取最近一次键盘按下事件的按键值。
         * getKey 方法返回的是最近一次 keydown 事件的 keyCode/which 值，用于解决浏览器的 keypress 事件中没有特殊按钮(例如方向键等)取值的问题。
         * @public
         *
         * @return {number} 按键的编码
         */
        getKey = core.getKey = function () {
            return keyCode;
        };

        /**
         * 获取当前鼠标光标的页面/相对于控件内部区域的X轴坐标。
         * getMouseX 方法计算相对于控件内部区域的X轴坐标时，按照 Element 盒子模型的标准，需要减去内层 Element 对象的 borderLeftWidth 样式的值。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件，如果省略参数，将获取鼠标在页面的X轴坐标，否则获取鼠标相对于控件内部区域的X轴坐标
         * @return {number} X轴坐标值
         */
        getMouseX = core.getMouseX = function (control) {
            if (control) {
                control = control.getOuter();
                return mouseX - getPosition(control).left - toNumber(getStyle(control, 'borderLeftWidth'));
            }
            return mouseX;
        };

        /**
         * 获取当前鼠标光标的页面/相对于控件内部区域的Y轴坐标。
         * getMouseY 方法计算相对于控件内部区域的Y轴坐标时，按照 Element 盒子模型的标准，需要减去 内层 Element 对象的 borderTopWidth 样式的值。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件，如果省略参数，将获取鼠标在页面的Y轴坐标，否则获取鼠标相对于控件内部区域的Y轴坐标
         * @return {number} Y轴坐标值
         */
        getMouseY = core.getMouseY = function (control) {
            if (control) {
                control = control.getOuter();
                return mouseY - getPosition(control).top - toNumber(getStyle(control, 'borderTopWidth'));
            }
            return mouseY;
        };

        /**
         * 从 Element 对象中获取初始化参数对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @param {string} attributeName 当前的初始化属性名称(参见 getAttributeName 方法)
         * @return {Object} 参数对象
         */
        getParameters = core.getParameters = function (el, attributeName) {
            attributeName = attributeName || ecuiName;

            var text = el.getAttribute(attributeName),
                params = {};

            if (text) {
                for (
                    el.removeAttribute(attributeName);
                    /\s*([\w-]+)\s*(:\s*|:\s*([^;\s]+(\s+[^;\s]+)*)\s*)?($|;)/.test(text);
                ) {
                    text = REGEXP["$'"];

                    el = REGEXP.$3;
                    params[toCamelCase(REGEXP.$1)] =
                        !el || el == 'true' ? true : el == 'false' ? false : ISNAN(el - 0) ? el : el - 0;
                }
            }

            return params;
        };

        /**
         * 获取当前处于按压状态的 ECUI 控件。
         * 控件的按压状态，指的是鼠标在控件上按下，到松开的全过程，之间无论鼠标移动到哪个位置，被按压的控件对象都不会发生改变。
         * @public
         *
         * @return {ecui.ui.Control} 处于按压状态的 ECUI 控件，如果不存在返回 null
         */
        getPressed = core.getPressed = function () {
            return pressedControl || null;
        };

        /**
         * 获取浏览器滚动条相对窄的一边的长度。
         * getScrollNarrow 方法对于垂直滚动条，返回的是滚动条的宽度，对于水平滚动条，返回的是滚动条的高度。
         * @public
         *
         * @return {number} 浏览器滚动条相对窄的一边的长度
         */
        getScrollNarrow = core.getScrollNarrow = function () {
            return scrollNarrow;
        };

        /**
         * 获取框架当前的状态。
         * getStatus 方法返回框架当前的工作状态，目前支持三类工作状态：NORMAL(正常状态)、INIT(加载状态)与PAINT(刷新状态)
         * @public
         *
         * @return {boolean} 框架当前的状态
         */
        getStatus = core.getStatus = function () {
            return status;
        };

        /**
         * 初始化指定的 DOM 节点及它的子节点。
         * init 方法将初始化指定的 DOM 节点及它的子节点，如果这些节点拥有初始化属性(ecui)，将按照规则为它们绑定 ECUI 控件，每一个节点只会被绑定一次，重复的绑定无效。页面加载完成时，将会自动针对 document.body 执行这个方法，相当于自动执行以下的语句：ecui.init(document.body)
         * @public
         *
         * @param {Element} el Element 对象
         */
        core.init = function (el) {
            var i = 0,
                list = [],
                params = el.all || el.getElementsByTagName('*'),
                elements = [el],
                o;

            if (!initRecursion++) {
                status = INIT;
                detachEvent(WINDOW, 'resize', paint);
            }

            // 自动初始化控件
            for (; o = params[i++]; ) {
                elements[i] = o;
            }

            for (i = 0; el = elements[i]; i++) {
                if (getParent(el)) {
                    params = getParameters(el);
                    params.element = el;
                    // 以下使用 el 替代 control
                    if (params.type) {
                        list.push(el = $create(params.type, params));
                    }
                    for (o in plugins) {
                        if (params[o]) {
                            plugins[o](el, params[o]);
                        }
//{if 0}//
                        if (el instanceof ui.Control && el['$init' + o]) {
                            el['$init' + o](params);
                        }
//{else}//                        el instanceof UI_CONTROL && el['$init' + o] && el['$init' + o](params);
//{/if}//
                    }
                }
            }

            for (i = 0; o = list[i++]; ) {
                o.cache();
            }
            for (i = 0; o = list[i++]; ) {
                o.init();
            }

            if (!(--initRecursion)) {
                attachEvent(WINDOW, 'resize', paint);
                status = NORMAL;
            }
        };

        /**
         * 设置框架拦截之后的一次点击，并将点击事件发送给指定的 ECUI 控件。
         * intercept 方法将下一次的鼠标点击事件转给指定控件的 $intercept 方法处理，相当于拦截了一次框架的鼠标事件点击操作，框架其它的状态不会自动改变，例如拥有焦点的控件不会改变。如果 $intercept 方法不返回 false，将自动调用 restore 方法。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        intercept = core.intercept = function (control) {
            interceptEnv.target = control;
            setEnv(interceptEnv);
        };

        /**
         * 判断容器大小是否需要修正(即计算 padding, border 样式对 width, height 样式的影响)。
         * @public
         *
         * @return {boolean} 容器大小是否需要修正
         */
        isFixedSize = core.isFixedSize = function () {
            return flgFixedSize;
        };

        /**
         * 使控件失去焦点。
         * 如果控件及它的子控件没有焦点，执行 loseFocus 方法系统的状态将不会产生变化。如果控件或它的子控件拥有焦点，执行 loseFocus 方法将使控件失去焦点，如果控件拥有父控件，此时父控件获得焦点。如果控件从拥有焦点状态变为了未拥有焦点状态，则触发 onblur 事件，它不完全是 setFocused 方法的逆向行为。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        loseFocus = core.loseFocus = function (control) {
            if (control.contain(focusedControl)) {
                setFocused(control.getParent());
            }
        };

        /**
         * 使用一个层遮罩整个浏览器可视化区域。
         * 遮罩层的 z-index 样式默认取值为 32767，请不要将 Element 对象的 z-index 样式设置大于 32767。
         * @public
         *
         * @param {number} opacity 透明度，如 0.5，如果省略参数将关闭遮罩层
         * @param {number} zIndex 遮罩层的 zIndex 样式值，如果省略使用 32767
         */
        mask = core.mask = function (opacity, zIndex) {
            //__gzip_original__body
            var i = 0,
                body = DOCUMENT.body,
                o = getView(),
                top = MAX(o.top - o.height * 2, 0),
                left = MAX(o.left - o.width * 2, 0),
                text = ';top:' + top + 'px;left:' + left +
                    'px;width:' + MIN(o.width * 5, o.maxWidth - left) +
                    'px;height:' + MIN(o.height * 5, o.maxHeight - top) + 'px;display:';

            if ('boolean' == typeof opacity) {
                text += opacity ? 'block' : 'none'; 
                for (; o = maskElements[i++]; ) {
                    o.style.cssText += text;
                }
            }
            else if (opacity === undefined) {
                removeDom(maskElements.pop());
                if (!maskElements.length) {
                    removeClass(body, 'mask');
                }
            }
            else {
                if (!maskElements.length) {
                    addClass(body, 'mask');
                }
                maskElements.push(o = body.appendChild(createDom(
                    '',
                    'position:absolute;background-color:#000;z-index:' + (zIndex || 32767)
                )));
                setStyle(o, 'opacity', opacity);
                o.style.cssText += text + 'block';
            }
        };

        /**
         * 查询满足条件的控件列表。
         * query 方法允许按多种条件组合查询满足需要的控件，如果省略条件表示不进行限制。condition参数对象支持的属性如下：
         * type   {Function} 控件的类型构造函数
         * parent {ecui.ui.Control} 控件的父控件对象
         * custom {Function} 自定义查询函数，传入的参数是控件对象
         * @public
         *
         * @param {Object} condition 查询条件，如果省略将返回全部的控件
         * @param {Array} 控件列表
         */
        query = core.query = function (condition) {
            condition = condition || {};

            //__gzip_original__parent
            for (
                var i = 0,
                    result = [],
                    parent = condition.parent,
                    custom = condition.custom,
                    o;
                o = independentControls[i++];
            ) {
                if ((!condition.type || (o instanceof condition.type)) &&
                        (parent === undefined || (o.getParent() == parent)) && (!custom || custom(o))) {
                    result.push(o);
                }
            }

            return result;
        };

        /**
         * 恢复当前框架的状态到上一个状态。
         * restore 用于恢复调用特殊操作如 drag、intercept 与 zoom 后改变的框架环境，包括各框架事件处理函数的恢复、控件的焦点设置等。
         * @public
         */
        restore = core.restore = function () {
            setHandler(currEnv, true);
            setHandler(currEnv = envStack.pop());
        };

        /**
         * 将指定的控件设置为选择状态。
         * select 方法将控件设置为选择，显示选择框并对选择框调用 zoom 方法。调用它会触发控件对象的 onselectstart 事
         * 件，在整个 select 的周期中，还将触发 onselect 与 onselectend 事件，在释放鼠标按键时选择操作周期结束。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {Event} event 事件对象
         * @param {string} className 选择框的样式名称，如果省略将使用 ec-selector
         */
        core.select = function (control, event, className) {
            function build(name) {
                selectorControl['$zoom' + name] = function (event) {
                    if (!(control['onselect' + name] && control['onselect' + name](event) === false)) {
                        control['$select' + name](event);
                    }
                };
            }

            if (event.type == 'mousedown') {

                if (!selectorControl) {
                    insertHTML(
                        DOCUMENT.body,
                        'BEFOREEND',
                        '<div class="ec-control ec-selector" style="overflow:hidden"><div class="ec-selector-box">' +
                            '</div></div>'
                    );
//{if 0}//
                    selectorControl = $fastCreate(ui.Control, DOCUMENT.body.lastChild);
//{else}//                    selectorControl = $fastCreate(UI_CONTROL, DOCUMENT.body.lastChild);
//{/if}//
                    selectorControl.$setSize = function (width, height) {
                        //__gzip_original__style
                        var el = this.getOuter().firstChild,
                            style = el.style;
//{if 0}//
                        ui.Control.prototype.$setSize.call(this, width, height);
//{else}//                        UI_CONTROL_CLASS.$setSize.call(this, width, height);
//{/if}//
                        style.width = MAX(1, width - calcWidthRevise(el)) + 'px';
                        style.height = MAX(1, height - calcHeightRevise(el)) + 'px';
                    };
                }

                build('start');
                build('');
                build('end');

                // 设置选择框的初始信息
                selectorControl.setPosition(mouseX, mouseY);
                selectorControl.setSize(1, 1);
                selectorControl.setClass(className || 'ec-selector');
                selectorControl.show();

                core.zoom(selectorControl, event);
            }

            event = null;
        };

        /**
         * 使 ECUI 控件 得到焦点。
         * setFocused 方法会将焦点状态设置到指定的控件，允许不指定需要获得焦点的控件，则当前拥有焦点的控件将失去焦点，需要当前获得焦点的控件失去焦点还可以调用 loseFocus 方法。获得焦点的控件触发 onfocus 事件，失去焦点的控件触发 onblur 事件。需要注意的是，如果控件拥有焦点，当通过 setFocused 方法设置它的子控件获得焦点时，虽然焦点对应的控件对象发生了变化，但是控件并不会触发 onblur 方法，此时控件逻辑上仍然处于拥有焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        setFocused = core.setFocused = function (control) {
            var parent = getCommonParent(focusedControl, control);

            // 对不重复的部分进行获得或失去焦点操作
            bubble(focusedControl, 'blur', null, parent);
            bubble(focusedControl = control, 'focus', null, parent);

            // 只要试图改变激活的控件，键盘控制码就失效
            keyCode = -keyCode;
        };

        /**
         * 将指定的 ECUI 控件 设置为缩放状态。
         * zoom 方法将控件设置为缩放，缩放的值允许负数，用于表示反向的缩放，调用它会触发控件对象的 onzoomstart 事件，在整个 zoom 的周期中，还将触发 onzoom 与 onzoomend 事件，在释放鼠标按键时缩放操作周期结束。range 参数支持的属性如下：
         * minWidth  {number} 控件允许缩放的最小宽度 
         * maxWidth  {number} 控件允许缩放的最大宽度 
         * minHeight {number} 控件允许缩放的最小高度 
         * maxHeight {number} 控件允许缩放的最大高度 
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {Event} event 事件对象
         * @param {Object} range 控件允许的缩放范围参数
         */
        core.zoom = function (control, event, range) {
            if (event.type == 'mousedown') {

                control.getOuter().style.position = 'absolute';

                // 保存现场环境
                if (range) {
                    copy(zoomEnv, range);
                }
                zoomEnv.top = control.getY();
                zoomEnv.left = control.getX();
                zoomEnv.width = control.getWidth();
                zoomEnv.height = control.getHeight();
                zoomEnv.target = control;
                setEnv(zoomEnv);

                if (ieVersion) {
                    DOCUMENT.body.setCapture();
                }
                if (!(control.onzoomstart && control.onzoomstart(event) === false)) {
                    control.$zoomstart(event);
                }
            }
        };

        /**
         * 键盘事件处理。
         * @private
         *
         * @param {Event} event 事件对象
         */
        currEnv.keydown = currEnv.keypress = currEnv.keyup = function (event) {
            event = standardEvent(event);

            //__gzip_original__type
            //__gzip_original__which
            var type = event.type,
                which = event.which;

            if (type == 'keydown' && ABS(keyCode) != which) {
                keyCode = which;
            }
            for (var o = focusedControl; o; o = o.getParent()) {
                if (o[type](event) === false) {
                    event.preventDefault();
                    break;
                }
            }
            if (type == 'keyup' && ABS(keyCode) == which) {
                // 这里是为了防止一次多个键被按下，最后一个被按下的键松开时取消
                keyCode = 0;
            }
        };

        /**
         * 双击事件与选中内容开始事件处理。
         * @private
         *
         * @param {Event} event 事件对象
         */
        if (ieVersion) {
            currEnv.dblclick = function (event) {
                currEnv.mousedown(event);
                currEnv.mouseup(event);
            };

            currEnv.selectstart = function (event) {
                event = standardEvent(event);
                mousedown(findControl(event.target), event, true);
            };
        }

        /**
         * 滚轮事件处理。
         * @private
         *
         * @param {Event} event 事件对象
         */
        currEnv[firefoxVersion ? 'DOMMouseScroll' : 'mousewheel'] = function (event) {
            event = standardEvent(event);
            if (event.detail === undefined) {
                event.detail = event.wheelDelta / -40;
            }

            // 拖拽状态下，不允许滚动
            if (currEnv.type == 'drag' || bubble(overedControl, 'mousewheel', event) === false ||
                    bubble(focusedControl, 'mousewheel', event) === false) {
                event.preventDefault();
            }
        };

        /**
         * 处理鼠标点击。
         * @private
         *
         * @param {ecui.ui.Control} control 需要操作的控件
         * @param {Event} event 事件对象
         * @param {boolean} flag 调用方式标志位
         */
        function mousedown(control, event, flag) {
            if (!flag) {
                bubble(pressedControl = control, 'mousedown', event);
                if (!pressedControl) {
                    // 在mousedown冒泡中有alert类似操作，并松开了鼠标左键，导致操作提前中止
                    event.preventDefault();
                    return;
                }
                pressedControl.pressstart(event);
            }
            for (; control; control = control.getParent()) {
                if (!control.isSelectStart()) {
                    event.preventDefault();
                }
            }
        }

        /**
         * 冒泡处理控件事件。
         * @private
         *
         * @param {ecui.ui.Control} start 开始冒泡的控件
         * @param {string} name 控件调用的函数名称
         * @param {ecui.ui.Control} end 终止冒泡的控件，如果不设置将一直冒泡至顶层
         * @param {Event} 事件对象
         * @return {boolean} 如果返回 false 表示在中途被停止冒泡
         */
        function bubble(start, name, event, end) {
            for (; start != end; start = start.getParent()) {
                if (start[name](event) === false) {
                    return false;
                }
            }
        }

        /**
         * 获取两个控件的公共父控件。
         * @private
         *
         * @param {ecui.ui.Control} control1 控件1
         * @param {ecui.ui.Control} control2 控件2
         * @return {ecui.ui.Control} 公共的父控件，如果没有，返回 null
         */
        function getCommonParent(control1, control2) {
            if (control1 != control2) {
                var i = 0,
                    list1 = [],
                    list2 = [];

                // 向序列中填充父控件
                for (; control1; control1 = control1.getParent()) {
                    list1.push(control1);
                }
                for (; control2; control2 = control2.getParent()) {
                    list2.push(control2);
                }

                list1.reverse();
                list2.reverse();

                // 过滤父控件序列中重复的部分
                for (; list1[i] == list2[i]; i++) {};
                control1 = list1[i - 1];
            }

            return control1 || null;
        }

        /**
         * 获取当前 DOM 节点绑定的 ECUI 控件。
         * 与控件关联的 DOM 节点(例如通过 init 方法初始化，或者使用 $bind 方法绑定，或者使用 create、$fastCreate 方法生成控件)，会被添加一个 getControl 方法用于获取它绑定的 ECUI 控件，更多获取控件的方法参见 get。
         * @private
         *
         * @return {ecui.ui.Control} 与指定的 DOM 节点绑定的 ECUI 控件
         */
        function getControlByElement() {
            return this._cControl;
        }

        /**
         * 获取触发事件的控件对象
         * @private
         *
         * @return {ecui.ui.Control} 控件对象
         */
        function getTarget() {
            var o = findControl(this.target);
            if (o && o.isEnabled()) {
                for (; o; o = o.getParent()) {
                    if (o.isCapture()) {
                        return o;
                    }
                }
            }
            return null;
        }

        /**
         * 判断点击是否发生在滚动条区域。
         * @private
         *
         * @param {Event} event 事件对象
         * @return {boolean} 点击是否发生在滚动条区域
         */
        function isScrollClick(event) {
            var target = event.target,
                pos = getPosition(target),
                style = getStyle(target);
            return event.pageX - pos.left - toNumber(style.borderLeftWidth) >= target.clientWidth !=
                event.pageY - pos.top - toNumber(style.borderTopWidth) >= target.clientHeight;
        }

        /**
         * 窗体滚动时的事件处理。
         * @private
         */
        function onscroll() {
            mask(true);
        }

        /**
         * 页面关闭时释放占用的空间，防止内存泄漏。
         * @private
         */
        function onunload() {
            for (var i = 0, o; o = allControls[i++]; ) {
                try {
                    o.dispose();
                }
                catch (e) {
                }
            }

            // 清除闭包中引用的 Element 对象
            DOCUMENT = maskElements = null;
        }

        /**
         * 阻止事件的默认处理。
         * @private
         */
        function preventDefault() {
            this.returnValue = false;
        }

        /**
         * 设置 ecui 环境。
         * @private
         *
         * @param {Object} env 环境描述对象
         */
        function setEnv(env) {
            var o = {};
            setHandler(currEnv, true);

            copy(o, currEnv);
            copy(o, env);
            o.x = mouseX;
            o.y = mouseY;
            setHandler(o);

            envStack.push(currEnv);
            currEnv = o;
        }

        /**
         * 设置document节点上的鼠标事件。
         * @private
         *
         * @param {Object} env 环境描述对象，保存当前的鼠标光标位置与document上的鼠标事件等
         * @param {boolean} remove 如果为true表示需要移除data上的鼠标事件，否则是添加鼠标事件
         */
        function setHandler(env, remove) {
            for (var i = 0, func = remove ? detachEvent : attachEvent, o; i < 5; ) {
                if (env[o = eventNames[i++]]) {
                    func(DOCUMENT, o, env[o]);
                }
            }
        }

        /**
         * 事件停止冒泡。
         * @private
         */
        function stopPropagation() {
            this.cancelBubble = true;
        }

        ready(core.get);
    })();
//{/if}//
//{if 0}//
})();
//{/if}//