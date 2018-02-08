/*
ECUI核心的事件控制器与状态控制器，用于屏弊不同浏览器交互处理的不同，保存控制的状态及进行事件的分发处理。ECUI核心的事件分发实现了浏览器原生的防止事件重入功能，因此请使用 triggerEvent 方法来请求事件。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        util = core.util,
        ui = core.ui,

        isMobile = /(Android|iPhone|iPad|UCWEB|Fennec|Mobile)/i.test(navigator.userAgent),
        isStrict = document.compatMode === 'CSS1Compat',
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate'];
//{/if}//
    var scrollHandler,            // DOM滚动事件
        isMobileScroll,
        ecuiName = 'ui',          // Element 中用于自动渲染的 ecui 属性名称
        isGlobalId,               // 是否自动将 ecui 的标识符全局化

        flgFixedOffset,           // 在计算相对位置时，是否需要修正边框样式的影响
        flgFixedSize,             // 在计算盒子模型时，是否需要修正宽高
        scrollNarrow,             // 浏览器滚动条相对窄的一边的长度

        initRecursion = 0,        // init 操作的递归次数
        lastClientWidth,          // 浏览器之前的宽度

        maskElements = [],        // 遮罩层组
        unmasks = [],             // 用于取消庶罩层的函数列表

        touchCount = 0,           // 触屏的次数(可能多指)
        pauseCount = 0,           // 暂停的次数
        mouseX,                   // 当前鼠标光标的X轴坐标
        mouseY,                   // 当前鼠标光标的Y轴坐标
        lastMoveTime,             // 上次移动的时间
        speedX,                   // 当前鼠标X轴速度参数
        speedY,                   // 当前鼠标Y轴速度参数
        keyCode = 0,              // 当前键盘按下的键值，解决keypress与keyup中得不到特殊按键的keyCode的问题
        lastClick,                // 上一次产生点击事件的信息
        inertiaHandles = {},      // 惯性处理句柄

        allControls = [],         // 全部生成的控件，供释放控件占用的内存使用
        independentControls = [], // 独立的控件，即使用create($create)方法创建的控件
        namedControls,            // 所有被命名的控件的集合
        singletons = [],          // 所有被初始化成单例控件的集合
        uniqueIndex = 0,          // 控件的唯一序号
        delegateControls = {},    // 等待关联的控件集合

        activedControl,           // 当前环境下被激活的控件，即鼠标左键按下时对应的控件，直到左键松开后失去激活状态
        hoveredControl = null,    // 当前环境下鼠标悬停的控件
        focusedControl = null,    // 当前环境下拥有焦点的控件

        eventListeners = {},      // 控件事件监听描述对象
        eventStack = {},          // 事件调用堆栈记录，防止事件重入

        envStack = [],            // 高优先级事件调用时，保存上一个事件环境的栈
        currEnv = {               // 当前操作的环境

            // 触屏事件到鼠标事件的转化，与touch相关的事件由于ie浏览器会触发两轮touch与mouse的事件，所以需要屏弊一个
            /**
             * 按压开始事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            touchstart: function (event) {
                if (core.isTouch()) {
                    // 屏弊多指操作的ECUI事件响应
                    activedControl = undefined;
                    return;
                }

                isMobileScroll = false;
                touchCount++;

                if (!ieVersion) {
                    currEnv.mousedown(event);
                }
            },

            /**
             * 按压移动事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            touchmove: function (event) {
                if (!ieVersion) {
                    currEnv.mousemove(event);
                }
            },

            /**
             * 按压结束事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            touchend: function (event) {
                touchCount--;
                if (isMobileScroll) {
                    // 产生了滚屏操作，不响应ECUI事件
                    bubble(activedControl, 'deactivate');
                    activedControl = undefined;
                }

                if (!ieVersion) {
                    currEnv.mouseup(event);
                    // 解决非ie浏览器下触屏事件是touchstart/touchend/mouseover的问题，屏弊mouse事件
                    // TODO: 需要判断target与touchstart的target是否为同一个
//                    for (var el = event.target; el; el = dom.getParent(el)) {
//                        if (el.tagName === 'A') {
//                            el.click();
//                            break;
//                        }
//                    }
//                    event.exit();
                }
            },

            /**
             * 按压取消事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            touchcancel: function (event) {
                currEnv.touchend(event);
            },

            // 鼠标左键按下需要改变框架中拥有焦点的控件
            mousedown: function (event) {
                event = core.wrapEvent(event);

                if (isMobile && event.type === 'mousedown') {
                    return;
                }

                if (event.which === 1) {
                    if (activedControl) {
                        // 如果按下鼠标左键后，使用ALT+TAB使浏览器失去焦点然后松开鼠标左键，
                        // 需要恢复激活控件状态，第一次点击失效
                        bubble(activedControl, 'deactivate');
                        activedControl = undefined;
                        // 这里不能return，要考虑请求来自于其它环境的情况
                    }

                    var control = event.getControl(),
                        target = control;

                    if (!(lastClick && isDblClick())) {
                        lastClick = {time: Date.now()};
                    }

                    // 为了兼容beforescroll事件，同时考虑到scroll执行效率问题，自己手动触发滚动条事件
                    if (isScrollClick(event)) {
                        onbeforescroll(event);
                        scrollHandler = util.timer(
                            function () {
                                var handler = scrollHandler;
                                scrollHandler = null;
                                onscroll(event);
                                scrollHandler = handler;
                                onbeforescroll(event);
                            },
                            -50
                        );
                    }

                    if (control) {
                        // IE8以下的版本，如果为控件添加激活样式，原生滚动条的操作会失效
                        // 常见的表现是需要点击两次才能进行滚动操作，而且中途不能离开控件区域
                        // 以免触发悬停状态的样式改变。
                        if (!scrollHandler || ieVersion >= 9) {
                            for (; target; target = target.getParent()) {
                                if (target.isFocusable()) {
                                    if (!(target !== control && target.contain(focusedControl))) {
                                        // 允许获得焦点的控件必须是当前激活的控件，或者它没有焦点的时候才允许获得
                                        // 典型的用例是滚动条，滚动条不需要获得焦点，如果滚动条的父控件没有焦点
                                        // 父控件获得焦点，否则焦点不发生变化
                                        if (!isMobile) {
                                            // 移动端是在mouseup时获得焦点
                                            core.setFocused(target);
                                        }
                                    }
                                    break;
                                }
                            }
                        }

                        mousedown(control, event);
                    } else {
                        target = event.target;
                        if (control = event.getTarget()) {
                            // 如果点击的是失效状态的控件，检查是否需要取消文本选择
                            onselectstart(control, event);
                            // 检查是否INPUT/SELECT/TEXTAREA/BUTTON标签，需要失去焦点，
                            // 因为ecui不能阻止mousedown focus输入框
                            if (!isMobile) {
                                // 移动端输入框是在mouseup时失去焦点
                                if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
                                    util.timer(
                                        function () {
                                            target.blur();
                                        }
                                    );
                                    event.preventDefault();
                                }
                            }
                        }
                        if (!isMobile) {
                            // 移动端输入框是在mouseup时失去焦点
                            // 点击到了空白区域，取消控件的焦点
                            core.setFocused();
                        }
                        // 正常情况下 activedControl 是 undefined，如果是down按下但未点击到控件，此值为null
                        activedControl = null;
                    }
                }
            },

            mousemove: function (event) {
                event = core.wrapEvent(event);

                if (scrollHandler) {
                    scrollHandler();
                    scrollHandler = null;
                    util.timer(onscroll, 500, this, event);
                }

                var control = event.getControl();
                bubble(control, 'mousemove', event);
                if (hoveredControl !== control) {
                    currEnv.mouseover(event);
                }
            },

            // 鼠标移入的处理，需要计算是不是位于当前移入的控件之外，如果是需要触发移出事件
            mouseover: function (event) {
                event = core.wrapEvent(event);

                var control = event.getControl(),
                    parent = getCommonParent(control, hoveredControl);

                bubble(hoveredControl, 'mouseout', event, parent);
                hoveredControl = control;
                bubble(control, 'mouseover', event, parent);
            },

            mouseup: function (event) {
                event = core.wrapEvent(event);

                if (scrollHandler) {
                    scrollHandler();
                    scrollHandler = null;
                    util.timer(onscroll, 500, this, event);
                }

                if (isMobile && event.type === 'mouseup') {
                    return;
                }

                var control = event.getControl(),
                    commonParent;

                if (activedControl !== undefined) {
                    // 如果为 undefined 表示之前没有触发 mousedown 事件就触发了 mouseup，
                    // 这种情况出现在鼠标在浏览器外按下了 down 然后回浏览器区域 up，
                    // 或者是 ie 系列浏览器在触发 dblclick 之前会触发一次单独的 mouseup，
                    // dblclick 在 ie 下的事件触发顺序是 mousedown/mouseup/click/mouseup/dblclick
                    bubble(control, 'mouseup', event);

                    if (activedControl) {
                        commonParent = getCommonParent(control, activedControl);
                        bubble(commonParent, 'click', event);
                        // 点击事件在同时响应鼠标按下与弹起周期的控件上触发(如果之间未产生鼠标移动事件)
                        // 模拟点击事件是为了解决控件的 Element 进行了 remove/append 操作后 click 事件不触发的问题
                        if (lastClick) {
                            if (isDblClick() && lastClick.target === control) {
                                bubble(commonParent, 'dblclick', event);
                                lastClick = null;
                            } else {
                                lastClick.target = control;
                            }
                        }
                        bubble(activedControl, 'deactivate', event);
                    }

                    // 将 activedControl 的设置复位，此时表示没有鼠标左键点击
                    activedControl = undefined;
                }
            },

            // 鼠标点击时控件如果被屏弊需要取消点击事件的默认处理，此时链接将不能提交
            click: function (event) {
                if (activedControl !== undefined) {
                    // 如果undefined表示移动端长按导致触发了touchstart但没有触发touchend
                    activedControl = undefined;
                }

                event = core.wrapEvent(event);

                var control = event.getTarget();
                if (control && control.isDisabled()) {
                    // 取消点击的默认行为，只要外层的Control被屏蔽，内部的链接(A)与输入框(INPUT)全部不能再得到焦点
                    event.preventDefault();
                }
            },

            /**
             * 双击事件与选中内容开始事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            dblclick: function (event) {
                if (ieVersion) {
                    // IE下双击事件不依次产生 mousedown 与 mouseup 事件，需要模拟
                    currEnv.mousedown(event);
                    currEnv.mouseup(event);
                }
            },

            /**
             * IE下选择开始事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            selectstart: function (event) {
                // IE下取消对文字的选择不能仅通过阻止 mousedown 事件的默认行为实现
                event = core.wrapEvent(event);
                onselectstart(event.getTarget(), event);
            },

            // dragend 实质上也是mouseup的行为
            dragend: function (event) {
                currEnv.mouseup(event);
            },

            /**
             * 键盘事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            keydown: function (event) {
                event = core.wrapEvent(event);
                keyCode = event.which;
                bubble(focusedControl, 'keydown', event);
            },

            /**
             * 键盘事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            keypress: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keypress', event);
            },

            /**
             * 键盘事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            keyup: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keyup', event);
                if (keyCode === event.which) {
                    // 一次多个键被按下，只有最后一个被按下的键松开时取消键值码
                    keyCode = 0;
                }
            }
        },

        dragEnv = { // 拖曳操作的环境
            type: 'drag',

            mousemove: function (event) {
                event = core.wrapEvent(event);

                dragmove(event, currEnv, mouseX, mouseY);

                event.exit();
            },

            mouseover: util.blank,

            mouseup: function (event) {
                var target = currEnv.target,
                    inertia = 'function' === typeof currEnv.inertia ? currEnv.inertia.call(target) : currEnv.inertia;

                if (FeatureFlags.INERTIA_1 && inertia) {
                    var uid = target.getUID(),
                        env = currEnv,
                        mx = mouseX,
                        my = mouseY,
                        start = Date.now(),
                        vx = core.getXSpeed(),
                        vy = core.getYSpeed(),
                        ax = vx / inertia,
                        ay = vy / inertia;

                    event = core.wrapEvent(event);

                    inertiaHandles[uid] = util.timer(function () {
                        var event = new ECUIEvent(),
                            time = (Date.now() - start) / 1000,
                            t = Math.min(time, inertia);

                        dragmove(event, env, Math.round(mx + vx * t - ax * t * t / 2), Math.round(my + vy * t - ay * t * t / 2));
                        if (t >= inertia) {
                            inertiaHandles[uid]();
                            dragend(event, env, target);
                        }
                    }, -20);
                } else {
                    event = core.wrapEvent(event);
                    dragend(event, currEnv, target);
                }
                activedControl = currEnv.actived;
                core.restore();

                currEnv.mouseup(event);
            }
        },

        interceptEnv = { // 强制点击拦截操作的环境，下拉框，弹出菜单等需要拦截第一次的点击调用
            type: 'intercept',

            mousedown: function (event) {
                event = core.wrapEvent(event);

                if (isMobile && event.type === 'mousedown') {
                    return;
                }
                if (event.which === 1) {
                    // 如果需要在intercept中触发click事件，需要设置activedControl的值
                    activedControl = event.getControl();

                    lastClick = null;

                    if (!isScrollClick(event)) {
                        if (activedControl && !activedControl.isFocusable()) {
                            // 需要捕获但不激活的控件是最高优先级处理的控件，例如滚动条
                            mousedown(activedControl, event);
                        } else {
                            // 默认仅拦截一次，框架自动释放环境
                            if (core.triggerEvent(currEnv.target, 'intercept', event)) {
                                core.restore();
                            }
                            // 取消冒泡，则控件不会触发click
                            if (event.cancelBubble) {
                                activedControl = undefined;
                            }
                        }
                    }
                }
            }
        };

    if (ieVersion < 9) {
        /**
         * 滚轮事件处理(IE 6/7/8)。
         * @private
         *
         * @param {Event} event 事件对象
         */
        currEnv.mousewheel = function (event) {
            onmousewheel(event, 0, 1);
        };
    } else if (firefoxVersion < 17) {
        /**
         * 滚轮事件处理(firefox)。
         * @private
         *
         * @param {Event} event 事件对象
         */
        currEnv.DOMMouseScroll = function (event) {
            onmousewheel(event, event.axis === 1 ? event.detail : 0, event.axis === 2 ? event.detail : 0);
        };
    } else {
        currEnv.wheel = function (event) {
            onmousewheel(event, event.deltaX, event.deltaY);
        };
    }

    /**
     * 创建 ECUI 事件对象。
     * @public
     *
     * @param {string} type 事件类型
     * @param {Event} event 浏览器原生事件对象，忽略将自动填充
     */
    function ECUIEvent(type, event) {
        this.type = type;
        if (event) {
            if (event.touches) {
                if (event.touches[0]) {
                    this.pageX = event.touches[0].pageX;
                    this.pageY = event.touches[0].pageY;
                } else {
                    this.pageX = mouseX;
                    this.pageY = mouseY;
                }
                this.which = 1;
            } else {
                this.pageX = event.pageX;
                this.pageY = event.pageY;
                this.which = event.which;
            }
            this.target = event.target;
            this._oNative = event;
        } else {
            this.pageX = mouseX;
            this.pageY = mouseY;
            this.which = keyCode;
            this.target = document;
        }
    }

    util.extend(ECUIEvent.prototype, {
        /**
         * 终止全部事件操作。
         * @public
         */
        exit: function () {
            this.preventDefault();
            this.stopPropagation();
        },

        /**
         * 获取触发事件的 ECUI 控件 对象
         * @public
         *
         * @return {ecui.ui.Control} 控件对象
         */
        getControl: function () {
            if (this._cControl !== undefined) {
                return this._cControl;
            }

            var control = this.getTarget();

            if (control && control.isTransparent()) {
                this._bThrough = true;
                var target = control;
                control = null;
                allControls.forEach(function (item) {
                    var el = item.getOuter();
                    if (item !== target && !item.isTransparent() && !dom.hasClass(el, 'ui-hide') && dom.contain(document.body, el)) {
                        var pos = dom.getPosition(el);
                        if (pos.top <= mouseY && pos.top + item.getHeight() >= mouseY && pos.left <= mouseX && pos.left + item.getWidth() >= mouseX) {
                            if (control) {
                                if (compareZIndex(control, item) < 0) {
                                    control = item;
                                }
                            } else {
                                control = item;
                            }
                        }
                    }
                }, this);
            }

            if (control && !control.isDisabled()) {
                for (; control; control = control.getParent()) {
                    if (control.isCapturable()) {
                        return this._cControl = control;
                    }
                }
            }
            return this._cControl = null;
        },

        /**
         * 获取原生的事件对象。
         * @public
         *
         * @return {Object} 原生的事件对象
         */
        getNative: function () {
            return this._oNative;
        },

        /**
         * 获取触发浏览器事件的控件对象。
         * @public
         *
         * @return {ecui.ui.Control} 控件对象
         */
        getTarget: function () {
            if (this._cTarget !== undefined) {
                return this._cTarget;
            }
            return this._cTarget = core.findControl(this.target);
        },

        /**
         * 事件是否穿透了 DOM 节点，如果控件设置了transparent属性，则浏览器事件将穿过这个控件到达下层的DOM元素。
         * @public
         *
         * @return {boolean} 是否穿透了 DOM 节点
         */
        isThrough: function () {
            return !!this._bThrough;
        },

        /**
         * 阻止事件的默认处理。
         * @public
         */
        preventDefault: function () {
            this.returnValue = false;
            if (this._oNative) {
                if (ieVersion < 9) {
                    this._oNative.returnValue = false;
                } else {
                    this._oNative.preventDefault();
                }
            }
        },

        /**
         * 事件停止冒泡。
         * @public
         */
        stopPropagation: function () {
            this.cancelBubble = true;
            if (this._oNative) {
                if (ieVersion < 9) {
                    this._oNative.cancelBubble = false;
                } else {
                    this._oNative.stopPropagation();
                }
            }
        }
    });

    /**
     * 冒泡处理控件事件。
     * @private
     *
     * @param {ecui.ui.Control} start 开始冒泡的控件
     * @param {string} type 事件类型
     * @param {ECUIEvent} 事件对象
     * @param {ecui.ui.Control} end 终止冒泡的控件，如果不设置将一直冒泡至顶层
     */
    function bubble(start, type, event, end) {
        event = event || new ECUIEvent(type);
        event.cancelBubble = false;
        start = start || null;
        end = end || null;
        for (; start !== end; start = start.getParent()) {
            event.returnValue = undefined;
            core.triggerEvent(start, type, event);
            if (event.cancelBubble) {
                return;
            }
        }
    }

    /**
     * 比较两个控件的叠加顺序。
     * @private
     *
     * @param {ecui.ui.Control} control1 控件1
     * @param {ecui.ui.Control} control2 控件2
     * @return {number} 如果控件1位于控件2之上，返回正数，否则返回负数，如果相等返回0
     */
    function compareZIndex(control1, control2) {
        if (control1 === control2) {
            return 0;
        }

        var i = 0,
            list1 = [],
            list2 = [];

        for (control1 = control1.getOuter(); control1; control1 = control1.offsetParent) {
            list1.push(control1);
        }
        for (control2 = control2.getOuter(); control2; control2 = control2.offsetParent) {
            list2.push(control2);
        }

        list1.reverse();
        list2.reverse();

        // 过滤父控件序列中重复的部分
        for (; list1[i] === list2[i]; i++) {}

        if (list1[i] === undefined) {
            return -1;
        }
        if (list2[i] === undefined) {
            return 1;
        }

        var style1 = dom.getStyle(list1[i]),
            style2 = dom.getStyle(list2[i]),
            index1 = style1.position === 'static' ? -0.5 : util.toNumber(style1.zIndex),
            index2 = style2.position === 'static' ? -0.5 : util.toNumber(style2.zIndex);

        if (index1 === index2) {
            if (ieVersion < 8) {
                var elements = list1[i - 1].all;
                index1 = Array.prototype.indexOf.call(elements, list1[i]);
                index2 = Array.prototype.indexOf.call(elements, list2[i]);
            } else {
                if (list1[i].compareDocumentPosition(list2[i]) & 2) {
                    return 1;
                }
                return -1;
            }
        }

        if (index1 < index2) {
            return -1;
        }
        if (index1 > index2) {
            return 1;
        }
    }

    /**
     * dispose一个控件，dispose情况特殊，ondispose不能阻止$dispose函数的执行。
     * @private
     *
     * @param {ecui.ui.Control} control 控件
     */
    function disposeControl(control) {
        try {
            var fn = control.ondispose;
            if (fn) {
                control.ondispose = util.blank;
                fn.call(control);
            }
        } catch (ignore) {
        }
        core.triggerEvent(control, 'dispose');
    }

    /**
     * 拖拽结束事件处理。
     * @private
     *
     * @param {ECUIEvent} ECUI 事件对象
     * @param {Object} ECUI 框架运行环境
     * @param {ecui.ui.Control} target 被拖拽的 ECUI 控件
     */
    function dragend(event, env, target) {
        var uid = target.getUID();

        if (env.limit) {
            var range = 'function' === typeof env.limit ? env.limit.call(target) : env.limit,
                codes = [],
                el = env.el || target.getOuter(),
                x = util.toNumber(el.style.left),
                y = util.toNumber(el.style.top),
                expectX = Math.min(range[1], Math.max(range[3], x)),
                expectY = Math.min(range[2], Math.max(range[0], y));
            if (range[5]) {
                expectX = Math.round(expectX / range[5]) * range[5];
            }
            if (range[4]) {
                expectY = Math.round(expectY / range[4]) * range[4];
            }
            if (x !== expectX) {
                codes.push('this.style.left->' + expectX);
            }
            if (y !== expectY) {
                codes.push('this.style.top->' + expectY);
            }

            if (codes.length) {
                inertiaHandles[uid] = core.effect.grade(
                    codes.join(';'),
                    500,
                    {
                        $: el,
                        onstep: function (percent) {
                            event.x = util.toNumber(this.style.left);
                            event.y = util.toNumber(this.style.top);
                            core.triggerEvent(target, 'dragmove', event);
                            if (percent === 1) {
                                core.triggerEvent(target, 'change', event);
                                inertiaHandles[uid]();
                                core.triggerEvent(target, 'dragend', event);
                                delete inertiaHandles[uid];
                            }
                        }
                    }
                );
                return;
            }
        }
        core.triggerEvent(target, 'dragend', event);
        delete inertiaHandles[uid];
    }

    /**
     * 拖拽移动事件处理。
     * @private
     *
     * @param {ECUIEvent} ECUI 事件对象
     * @param {Object} ECUI 框架运行环境
     * @param {number} x 需要移动到的 X 坐标
     * @param {number} y 需要移动到的 Y 坐标
     */
    function dragmove(event, env, x, y) {
        var target = env.target,
            // 计算期待移到的位置
            expectX = env.targetX + x - env.x,
            expectY = env.targetY + y - env.y;

        // 计算实际允许移到的位置
        event.x = Math.min(Math.max(expectX, env.left), env.right);
        event.y = Math.min(Math.max(expectY, env.top), env.bottom);

        if (core.triggerEvent(target, 'dragmove', event)) {
            target.setPosition(event.x, event.y);
        }

        env.x = x + env.targetX - expectX;
        env.y = y + env.targetY - expectY;
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
        /*jslint eqeq:true*/
        if (control1 != control2) {
            /*jslint eqeq:false*/
            var i = 0,
                list1 = [],
                list2 = [];

            for (; control1; control1 = control1.getParent()) {
                list1.push(control1);
            }
            for (; control2; control2 = control2.getParent()) {
                list2.push(control2);
            }

            list1.reverse();
            list2.reverse();

            // 过滤父控件序列中重复的部分
            for (; list1[i] === list2[i]; i++) {}
            control1 = list1[i - 1];
        }

        return control1 || null;
    }

    /**
     * 获取当前 Element 对象绑定的 ECUI 控件。
     * 与控件关联的 Element 对象(例如通过 init 方法初始化，或者使用 $bind 方法绑定，或者使用 create、$fastCreate 方法生成控件)，会被添加一个 getControl 方法用于获取它绑定的 ECUI 控件，更多获取控件的方法参见 get。
     * @private
     *
     * @return {ecui.ui.Control} 与 Element 对象绑定的 ECUI 控件
     */
    function getControlByElement() {
        return this._cControl;
    }

    /**
     * 初始化ECUI工作环境。
     * @private
     *
     * @return {boolean} 是否执行了初始化操作
     */
    function initEnvironment() {
        if (!namedControls) {
            // 设置全局事件处理
            for (var key in currEnv) {
                if (currEnv.hasOwnProperty(key)) {
                    dom.addEventListener(document, key, currEnv[key]);
                }
            }

            namedControls = {};

            dom.insertHTML(document.body, 'BEFOREEND', '<div class="ui-valid"><div></div></div>');
            // 检测Element宽度与高度的计算方式
            var el = document.body.lastChild;
            flgFixedOffset = el.lastChild.offsetTop;
            flgFixedSize = el.offsetWidth !== 80;
            scrollNarrow = el.offsetWidth - el.clientWidth - 2;
            dom.remove(el);

            var options = core.getOptions(document.body, 'data-ecui') || {};

            ecuiName = options.name || ecuiName;
            isGlobalId = options.globalId;

            if (options.load) {
                for (var text = options.load; /^\s*(\w+)\s*(\([^)]+\))?\s*($|,)/.test(text); ) {
                    text = RegExp['$\''];
                    try {
                        core[RegExp.$1].load(RegExp.$2 ? RegExp.$2.slice(1, -1) : '');
                    } catch (ignore) {
                    }
                }
            }

            dom.addEventListener(window, 'resize', core.repaint);
            dom.addEventListener(window, 'scroll', onscroll);
            dom.addEventListener(
                window,
                'unload',
                function () {
                    focusedControl = hoveredControl = activedControl = null;

                    allControls.forEach(function (item) {
                        disposeControl(item);
                    });

                    // 清除闭包中引用的 Element 对象
                    unmasks.forEach(function (item) {
                        item(true);
                    });
                    maskElements = null;
                }
            );

            core.init(document.body);

            return true;
        }
    }

    /**
     * 判断是否为允许的双击时间间隔。
     * @private
     *
     * @return {boolean} 是否为允许的双击时间间隔
     */
    function isDblClick() {
        return lastClick.time > Date.now() - 300;
    }

    /**
     * 判断点击是否发生在滚动条区域。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     * @return {boolean} 点击是否发生在滚动条区域
     */
    function isScrollClick(event) {
        var target = event.target,
            pos = dom.getPosition(target),
            style = dom.getStyle(target),
            x = event.pageX - pos.left - util.toNumber(style.borderLeftWidth) - target.clientWidth,
            y = event.pageY - pos.top - util.toNumber(style.borderTopWidth) - target.clientHeight;

        event.deltaX = target.clientWidth && target.clientWidth !== target.scrollWidth && y >= 0 && y < scrollNarrow ? 1 : 0;
        event.deltaY = target.clientHeight && target.clientHeight !== target.scrollHeight && x >= 0 && x < scrollNarrow ? 1 : 0;
        return event.deltaX !== event.deltaY;
    }

    /**
     * 处理鼠标点击。
     * @private
     *
     * @param {ecui.ui.Control} control 需要操作的控件
     * @param {ECUIEvent} event 事件对象
     */
    function mousedown(control, event) {
        if (!isScrollClick(event)) {
            bubble(activedControl = control, 'activate', event);
        }
        bubble(control, 'mousedown', event);
        onselectstart(control, event);
    }

    /**
     * 滚动时的事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     */
    function onbeforescroll(event) {
        independentControls.forEach(function (item) {
            core.triggerEvent(item, 'beforescroll', event);
        });
    }

    /**
     * 控件对象创建后的处理。
     * @private
     *
     * @param {ecui.ui.Control} control
     * @param {Object} options 控件初始化选项
     */
    function oncreate(control, options) {
        if (control.oncreate) {
            control.oncreate(options);
        }
        allControls.push(control);

        if (options.id) {
            namedControls[options.id] = control;
            control.$ID = options.id;
            if (isGlobalId) {
                window[util.toCamelCase(options.id)] = control;
            }
        }

        if (options.ext) {
            for (var key in options.ext) {
                if (options.ext.hasOwnProperty(key)) {
                    if (ext[key]) {
                        ext[key](control, options.ext[key], options);
                        if (key = control['$init' + key.charAt(0).toUpperCase() + util.toCamelCase(key.slice(1))]) {
                            key.call(control, options);
                        }
                    }
                }
            }
        }
    }

    /**
     * 滚轮事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     * @param {number} delta X轴滚动距离
     * @param {number} delta Y轴滚动距离
     */
    function onmousewheel(event, deltaX, deltaY) {
        event = core.wrapEvent(event);
        event.deltaX = deltaX;
        event.deltaY = deltaY;

        // 拖拽状态下，不允许滚动
        if (currEnv.type === 'drag') {
            event.preventDefault();
        } else {
            bubble(hoveredControl, 'mousewheel', event);
            if (!event.cancelBubble) {
                bubble(focusedControl, 'mousewheel', event);
            }
            onbeforescroll(event);
            scrollHandler = util.timer(
                function () {
                    scrollHandler = null;
                    onscroll(event);
                },
                50
            );
        }
    }

    /**
     * 滚动时的事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     */
    function onscroll(event) {
        if (scrollHandler) {
            return;
        }
        event = core.wrapEvent(event);
        independentControls.forEach(function (item) {
            core.triggerEvent(item, 'scroll', event);
        });
        if (core.isTouch()) {
            isMobileScroll = true;
        }
        core.mask(true);
    }

    /**
     * 文本选择开始处理。
     * @private
     *
     * @param {ecui.ui.Control} control 需要操作的控件
     * @param {ECUIEvent} event 事件对象
     */
    function onselectstart(control, event) {
        if (!isMobile) {
            for (; control; control = control.getParent()) {
                if (!control.isUserSelect()) {
                    event.preventDefault();
                    return;
                }
            }
        }
    }

    /**
     * 设置 ecui 环境。
     * @private
     *
     * @param {Object} env 环境描述对象
     */
    function setEnv(env) {
        var newEnv = {};
        setHandler(currEnv, true);

        util.extend(newEnv, currEnv);
        util.extend(newEnv, env);
        newEnv.x = mouseX;
        newEnv.y = mouseY;
        setHandler(newEnv);

        envStack.push(currEnv);
        currEnv = newEnv;
    }

    /**
     * 设置document节点上的鼠标事件。
     * @private
     *
     * @param {Object} env 环境描述对象，保存当前的鼠标光标位置与document上的鼠标事件等
     * @param {boolean} remove 如果为true表示需要移除data上的鼠标事件，否则是添加鼠标事件
     */
    function setHandler(env, remove) {
        for (var i = 0, func = remove ? dom.removeEventListener : dom.addEventListener, name; i < 5; ) {
            if (env[name = eventNames[i++]]) {
                func(document, name, env[name]);
            }
        }
    }

    util.extend(core, {
        /**
         * 使一个 Element 对象与一个 ECUI 控件 在逻辑上绑定。
         * 一个 Element 对象只能绑定一个 ECUI 控件，Element 对象通过 getControl方法获取绑定的 ECUI 控件，重复绑定会自动取消之前的绑定。
         * @protected
         *
         * @param {HTMLElement} el Element 对象
         * @param {ecui.ui.Control} control ECUI 控件
         */
        $bind: function (el, control) {
            el._cControl = control;
            el.getControl = getControlByElement;
        },

        /**
         * 清除控件的状态。
         * 控件在销毁、隐藏与失效等情况下，需要使用 $clearState 方法清除已经获得的焦点与激活等状态。
         * @protected
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        $clearState: function (control) {
            var parent = control.getParent();

            core.loseFocus(control);
            if (control.contain(activedControl)) {
                bubble(activedControl, 'deactivate', null, activedControl = parent);
            }
            if (control.contain(hoveredControl)) {
                bubble(hoveredControl, 'mouseout', null, hoveredControl = parent);
            }
        },

        /**
         * 创建 ECUI 控件。
         * $create 方法创建控件时不会自动渲染控件。在大批量创建控件时，为了加快渲染速度，应该首先使用 $create 方法创建所有控件完成后，再批量分别调用控件的 cache、init 与 repaint 方法渲染控件。options 对象支持的属性如下：
         * id         {string} 当前控件的 id，提供给 delegate 与 get 方法使用
         * main       {HTMLElement} 与控件绑捆的 Element 对象(参见 getMain 方法)，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent     {ecui.ui.Control} 父控件对象或者父 Element 对象
         * primary    {string} 控件的基本样式(参见 getMainClass 方法)，如果忽略此参数将使用主元素的 className 属性
         * @protected
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $create: function (UIClass, options) {
            options = options || {};

            var parent = options.parent,
                el = options.main,
                primary = options.primary || options.id || '',
                className;

            options.uid = 'ecui-' + (++uniqueIndex);

            if (el) {
                // 如果指定的元素已经初始化，直接返回
                if (el.getControl) {
                    return el.getControl();
                }

                if (UIClass.CLASS || primary) {
                    el.className = className = el.className + ' ' + primary + UIClass.CLASS;
                } else {
                    className = el.className;
                }

                // 如果没有指定基本样式，使用控件的样式作为基本样式
                /\s*([^\s]+)/.test(className);
                options.primary = RegExp.$1;
            } else {
                // 没有传入主元素，需要自动生成，此种情况比较少见，不推荐使用
                el = options.main = dom.create({className: primary + UIClass.CLASS});
                if (!primary) {
                    options.primary = UIClass.TYPES[0];
                }
            }

            // 生成控件
            options.classes = core.$getClasses(UIClass, options.primary);
            options.classes.push('');
            var control = new UIClass(el, options);

            if (parent) {
                if (parent instanceof ui.Control) {
                    control.setParent(parent);
                } else {
                    control.appendTo(parent);
                }
            } else {
                control.$setParent(core.findControl(dom.getParent(control.getOuter())));
            }

            oncreate(control, options);
            independentControls.push(control);

            // 处理所有的委托操作，参见delegate
            if (el = delegateControls[options.id]) {
                delete delegateControls[options.id];
                el.forEach(function (item) {
                    item.args[0] = control;
                    item.func.apply(item.caller, item.args);
                });
            }

            return control;
        },

        /**
         * 快速创建 ECUI 控件。
         * $fastCreate 方法仅供控件生成自己的部件使用，生成的控件不在控件列表中注册，不自动刷新也不能通过 query 方法查询(参见 $create 方法)。$fastCreate 方法通过分解 Element 对象的 className 属性得到样式信息，其中第一个样式为类型样式，第二个样式为基本样式。
         * @protected
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $fastCreate: function (UIClass, el, parent, options) {
            options = options || {};

            options.uid = 'ecui-' + (++uniqueIndex);
            if (!options.primary) {
                if (/\s*([^\s]+)/.test(el.className)) {
                    options.primary = RegExp.$1;
                }
            }

            options.classes = core.$getClasses(UIClass, options.primary);
            options.classes.push('');
            var control = new UIClass(el, options);
            control.$setParent(parent);
            oncreate(control, options);

            return control;
        },

        /**
         * 获取控件的当前样式组。
         * @private
         *
         * @param {Function} UIClass 控件类
         * @param {string} current 控件的当前样式
         * @return {Array} 样式数组
         */
        $getClasses: function (UIClass, current) {
            var classes = UIClass.TYPES.slice();
            if (current && current !== UIClass.TYPES[0]) {
                classes.push(current);
            }
            return classes;
        },

        /**
         * 添加控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {Function} func 监听函数
         */
        addEventListener: function (control, name, func) {
            name = control.getUID() + '#' + name;
            (eventListeners[name] = eventListeners[name] || []).push(func);
        },

        /**
         * 获取高度修正值(即计算 padding, border 样式对 height 样式的影响)。
         * IE 的盒子模型不完全遵守 W3C 标准，因此，需要使用 calcHeightRevise 方法计算 offsetHeight 与实际的 height 样式之间的修正值。
         * @public
         *
         * @param {CssStyle} style CssStyle 对象
         * @return {number} 高度修正值
         */
        calcHeightRevise: function (style) {
            return isStrict ? util.toNumber(style.borderTopWidth) + util.toNumber(style.borderBottomWidth) + util.toNumber(style.paddingTop) + util.toNumber(style.paddingBottom)
                : 0;
        },

        /**
         * 获取左定位修正值(即计算 border 样式对 left 样式的影响)。
         * opera 等浏览器，offsetLeft 与 left 样式的取值受到了 border 样式的影响，因此，需要使用 calcLeftRevise 方法计算 offsetLeft 与实际的 left 样式之间的修正值。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {number} 左定位修正值
         */
        calcLeftRevise: function (el) {
            var style = dom.getStyle(el.offsetParent);
            return !firefoxVersion || (style.overflow !== 'visible' && dom.getStyle(el, 'position') === 'absolute') ? util.toNumber(style.borderLeftWidth) * flgFixedOffset : 0;
        },

        /**
         * 获取上定位修正值(即计算 border 样式对 top 样式的影响)。
         * opera 等浏览器，offsetTop 与 top 样式的取值受到了 border 样式的影响，因此，需要使用 calcTopRevise 方法计算 offsetTop 与实际的 top 样式之间的修正值。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {number} 上定位修正值
         */
        calcTopRevise: function (el) {
            var style = dom.getStyle(el.offsetParent);
            return !firefoxVersion || (style.overflow !== 'visible' && dom.getStyle(el, 'position') === 'absolute') ? util.toNumber(style.borderTopWidth) * flgFixedOffset : 0;
        },

        /**
         * 获取宽度修正值(即计算 padding,border 样式对 width 样式的影响)。
         * IE 的盒子模型不完全遵守 W3C 标准，因此，需要使用 calcWidthRevise 方法计算 offsetWidth 与实际的 width 样式之间的修正值。
         * @public
         *
         * @param {CssStyle} style CssStyle 对象
         * @return {number} 宽度修正值
         */
        calcWidthRevise: function (style) {
            return isStrict ? util.toNumber(style.borderLeftWidth) + util.toNumber(style.borderRightWidth) + util.toNumber(style.paddingLeft) + util.toNumber(style.paddingRight)
                : 0;
        },

        /**
         * 创建 ECUI 控件。
         * 标准的创建 ECUI 控件 的工厂方法，适用于少量创建控件，生成的控件不需要任何额外的调用即可正常的显示，对于批量创建控件，请使用 $create 方法。options 对象支持的属性如下：
         * id        {string} 当前控件的 id，提供给 delegate 与 get 方法使用
         * main      {HTMLElement} 与控件绑捆的 Element 对象(参见 getMain 方法)，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent    {ecui.ui.Control} 父控件对象或者父 Element 对象
         * primary   {string} 控件的基本样式(参见 getMainClass 方法)，如果忽略此参数将使用主元素的 className 属性
         * @public
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        create: function (UIClass, options) {
            var control = core.$create(UIClass, options);
            control.cache();
            control.init(options);
            return control;
        },

        /**
         * 创建一个 ECUI 单例控件，ECUI 并未实现真正意义上的单例，这里只是用于标记该控件不会被 dispose 方法释放。
         * @public
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        createSingleton: function (UIClass, el, parent, options) {
            if (FeatureFlags.SINGLETON_1) {
                for (var i = 0, item; item = singletons[i++]; ) {
                    if (item.constructor === UIClass) {
                        return item;
                    }
                }
            }
            item = core.$fastCreate(UIClass, el, parent, options);
            singletons.push(item);
            return item;
        },

        /**
         * 委托框架在指定的 ECUI 控件 生成时执行某个方法。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)方式，控件创建时，相关联控件也许还未创建。delegate 方法提供将指定的函数滞后到对应的控件创建后才调用的模式。如果 targetId 对应的控件还未创建，则调用会被搁置，直到需要的控件创建成功后，再自动执行(参见 create 方法)。
         * @public
         *
         * @param {string} targetId 被委托的 ECUI 控件 标识符，即在标签的 ecui 属性中定义的 id 值
         * @param {Object} caller 委托的对象
         * @param {Function} func 调用的函数
         * @param {Object} ... 调用的参数
         */
        delegate: function (targetId, caller, func) {
            if (targetId) {
                var target = namedControls[targetId],
                    args = Array.prototype.slice.call(arguments, 2);
                if (target) {
                    args[0] = target;
                    func.apply(caller, args);
                } else {
                    (delegateControls[targetId] = delegateControls[targetId] || []).push({caller: caller, func: func, args: args});
                }
            }
        },

        /**
         * 释放 ECUI 控件及其子控件占用的内存。
         * @public
         *
         * @param {ecui.ui.Control|HTMLElement} control 需要释放的控件对象或包含控件的 Element 对象
         * @param {boolean} onlyChild 是否仅包含子控件，默认也包含自身
         */
        dispose: function (control, onlyChild) {

            // 判断一个控件是否位于一个DOM元素之下
            function contain(el, control) {
                for (; control; control = control.getParent()) {
                    if (dom.contain(el, control.getOuter())) {
                        return true;
                    }
                }
            }

            var isControl = control instanceof ui.Control,
                namedMap = {},
                parent;

            if (isControl) {
                core.$clearState(control);
            } else {
                parent = core.findControl(dom.getParent(control));
                // 以下判断需要考虑control.getOuter()物理上不属于control但逻辑上属于的情况
                if (focusedControl && contain(control, focusedControl)) {
                    core.setFocused(parent);
                }
                if (activedControl && contain(control, activedControl)) {
                    bubble(activedControl, 'deactivate', null, activedControl = parent);
                }
                if (hoveredControl && contain(control, hoveredControl)) {
                    bubble(hoveredControl, 'mouseout', null, hoveredControl = parent);
                }
            }

            for (var key in namedControls) {
                if (namedControls.hasOwnProperty(key)) {
                    namedMap[namedControls[key].getUID()] = key;
                }
            }

            singletons.forEach(function (item) {
                if (isControl ? control.contain(item) : !!item.getOuter() && contain(control, item)) {
                    item.setParent();
                }
            });

            // 需要删除的控件先放入一个集合中等待遍历结束后再删除，否则控件链将产生变化
            allControls.slice().filter(function (item) {
                if (isControl ? control.contain(item) : !!item.getOuter() && contain(control, item)) {
                    if (!onlyChild || (isControl ? control !== item : control !== item.getOuter())) {
                        util.remove(independentControls, item);
                        util.remove(allControls, item);
                        if (item = namedMap[item.getUID()]) {
                            delete namedControls[item];
                        }
                        return true;
                    }
                }
            }).forEach(function (item) {
                disposeControl(item);
                core.removeControlListeners(item);
            });
        },

        /**
         * 将指定的 ECUI 控件 设置为拖拽状态。
         * 只有在鼠标左键按下时，才允许调用 drag 方法设置待拖拽的 {'controls'|menu}，在拖拽操作过程中，将依次触发 ondragstart、ondragmove 与 ondragend 事件。range 参数支持的属性如下：
         * x      {number} 初始的x坐标
         * y      {number} 初始的y坐标
         * top    {number} 控件允许拖拽到的最小Y轴坐标
         * right  {number} 控件允许拖拽到的最大X轴坐标
         * bottom {number} 控件允许拖拽到的最大Y轴坐标
         * left   {number} 控件允许拖拽到的最小X轴坐标
         * @public
         *
         * @param {ecui.ui.Control} control 需要进行拖拽的 ECUI 控件对象
         * @param {ECUIEvent} event 事件对象
         * @param {Object} options 控件拖拽的参数，省略参数时，控件默认只允许在 offsetParent 定义的区域内拖拽，如果 offsetParent 是 body，则只允许在当前浏览器可视范围内拖拽
         */
        drag: function (control, event, options) {
            if (activedControl !== undefined) {
                if (FeatureFlags.INERTIA_1) {
                    // 控件之前处于惯性状态必须停止
                    var uid = control.getUID();
                    if (inertiaHandles[uid]) {
                        inertiaHandles[uid]();
                        delete inertiaHandles[uid];
                    }
                }

                // 判断鼠标没有mouseup
                var el = control.getOuter(),
                    parent = el.offsetParent,
                    style = dom.getStyle(parent);

                // 拖拽范围默认不超出上级元素区域
                util.extend(
                    dragEnv,
                    parent.tagName === 'BODY' || parent.tagName === 'HTML' ? util.getView() : {
                        top: 0,
                        right: parent.offsetWidth - util.toNumber(style.borderLeftWidth) - util.toNumber(style.borderRightWidth),
                        bottom: parent.offsetHeight - util.toNumber(style.borderTopWidth) - util.toNumber(style.borderBottomWidth),
                        left: 0
                    }
                );
                util.extend(dragEnv, options);

                var x = dragEnv.x !== undefined ? dragEnv.x : control.getX(),
                    y = dragEnv.y !== undefined ? dragEnv.y : control.getY();
                dragEnv.right = Math.max(dragEnv.right - control.getWidth(), dragEnv.left);
                dragEnv.bottom = Math.max(dragEnv.bottom - control.getHeight(), dragEnv.top);
                dragEnv.targetX = x;
                dragEnv.targetY = y;

                dragEnv.target = control;
                dragEnv.actived = activedControl;
                setEnv(dragEnv);

                // 清除激活的控件，在drag中不需要针对激活控件移入移出的处理
                activedControl = undefined;

                if (core.triggerEvent(control, 'dragstart', event)) {
                    control.setPosition(x, y);
                    el.style.position = 'absolute';
                }

                event.exit();
            }
        },

        /**
         * 从指定的 Element 对象开始，依次向它的父节点查找绑定的 ECUI 控件。
         * findControl 方法，会返回从当前 Element 对象开始，依次向它的父 Element 查找到的第一个绑定(参见 $bind 方法)的 ECUI 控件。findControl 方法一般在控件创建时使用，用于查找父控件对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {ecui.ui.Control} ECUI 控件对象，如果不能找到，返回 null
         */
        findControl: function (el) {
            for (; el; el = dom.getParent(el)) {
                if (el.getControl) {
                    return el.getControl();
                }
            }

            return null;
        },

        /**
         * 获取指定名称的 ECUI 控件。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)创建的控件，如果在 ecui 属性中指定了 id，就可以通过 get 方法得到控件，也可以在 Element 对象上使用 getControl 方法。
         * @public
         *
         * @param {string} id ECUI 控件的名称，通过 Element 对象的初始化选项 id 定义
         * @return {ecui.ui.Control} 指定名称的 ECUI 控件对象，如果不存在返回 null
         */
        get: function (id) {
            return namedControls[id] || null;
        },

        /**
         * 获取当前处于激活状态的 ECUI 控件。
         * 激活状态，指鼠标在控件区域左键从按下到弹起的全过程，无论鼠标移动到哪个位置，被激活的控件对象不会发生改变。处于激活状态的控件及其父控件，都具有激活状态样式。
         * @public
         *
         * @return {ecui.ui.Control} 处于激活状态的 ECUI 控件，如果不存在返回 null
         */
        getActived: function () {
            return activedControl || null;
        },

        /**
         * 获取当前的初始化属性名。
         * getAttributeName 方法返回页面静态初始化(参见 ECUI 使用方式)使用的属性名，通过在 BODY 节点的 data-ecui 属性中指定，默认使用 ecui 作为初始化属性名。
         * @public
         *
         * @return {string} 当前的初始化属性名
         */
        getAttributeName: function () {
            return ecuiName;
        },

        /**
         * 获取当前处于焦点状态的控件。
         * 焦点状态，默认优先处理键盘/滚轮等特殊事件。处于焦点状态的控件及其父控件，都具有焦点状态样式。通常鼠标左键的点击将使控件获得焦点状态，之前拥有焦点状态的控件将失去焦点状态。
         * @public
         *
         * @return {ecui.ui.Control} 处于焦点状态的 ECUI 控件，如果不存在返回 null
         */
        getFocused: function () {
            return focusedControl;
        },

        /**
         * 获取当前处于悬停状态的控件。
         * 悬停状态，指鼠标当前位于控件区域。处于悬停状态的控件及其父控件，都具有悬停状态样式。
         * @public
         *
         * @return {ecui.ui.Control} 处于悬停状态的 ECUI 控件，如果不存在返回 null
         */
        getHovered: function () {
            return hoveredControl;
        },

        /**
         * 获取当前有效的键值码。
         * getKey 方法返回最近一次 keydown 事件的 keyCode/which 值，用于解决浏览器的 keypress 事件中特殊按键(例如方向键等)没有编码值的问题。
         * @public
         *
         * @return {number} 键值码
         */
        getKey: function () {
            return keyCode;
        },

        /**
         * 获取当前鼠标光标的页面X轴坐标或相对于控件内部区域的X轴坐标。
         * getMouseX 方法计算相对于控件内部区域的X轴坐标时，按照浏览器盒子模型的标准，需要减去 Element 对象的 borderLeftWidth 样式的值。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件，如果省略参数，将获取鼠标在页面的X轴坐标，否则获取鼠标相对于控件内部区域的X轴坐标
         * @return {number} X轴坐标值
         */
        getMouseX: function (control) {
            if (control) {
                control = control.getBody();
                return mouseX - dom.getPosition(control).left - util.toNumber(dom.getStyle(control, 'borderLeftWidth'));
            }
            return mouseX;
        },

        /**
         * 获取当前鼠标光标的页面Y轴坐标或相对于控件内部区域的Y轴坐标。
         * getMouseY 方法计算相对于控件内部区域的Y轴坐标时，按照浏览器盒子模型的标准，需要减去 Element 对象的 borderTopWidth 样式的值。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件，如果省略参数，将获取鼠标在页面的Y轴坐标，否则获取鼠标相对于控件内部区域的Y轴坐标
         * @return {number} Y轴坐标值
         */
        getMouseY: function (control) {
            if (control) {
                control = control.getBody();
                return mouseY - dom.getPosition(control).top - util.toNumber(dom.getStyle(control, 'borderTopWidth'));
            }
            return mouseY;
        },

        /**
         * 获取所有被命名的控件。
         * @public
         *
         * @return {Object} 所有被命名的控件集合
         */
        getNamedControls: function () {
            return util.extend({}, namedControls);
        },

        /**
         * 从 Element 对象中获取初始化选项对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @param {string} attributeName 当前的初始化属性名(参见 getAttributeName 方法)
         * @return {Object} 初始化选项对象
         */
        getOptions: function (el, attributeName) {
            attributeName = attributeName || ecuiName;

            var text = dom.getAttribute(el, attributeName),
                options;

            if (text) {
                options = {};
                el.removeAttribute(attributeName);

                for (; /^(\s*;)?\s*(ext\-)?([\w\-]+)\s*(:\s*([^;\s]+(\s+[^;\s]+)*)?\s*)?($|;)/.test(text); ) {
                    text = RegExp['$\''];

                    var info = RegExp.$4,
                        value = RegExp.$5;
                    (RegExp.$2 ? (options.ext = options.ext || {}) : options)[util.toCamelCase(RegExp.$3)] = info ? value === 'true' ? true : value === 'false' ? false : decodeURIComponent(value) : true;
                }

                if (core.onparseoptions) {
                    core.onparseoptions(options);
                }
                return options;
            }
        },

        /**
         * 获取浏览器滚动条的厚度。
         * getScrollNarrow 方法对于垂直滚动条，返回的是滚动条的宽度，对于水平滚动条，返回的是滚动条的高度。
         * @public
         *
         * @return {number} 浏览器滚动条相对窄的一边的长度
         */
        getScrollNarrow: function () {
            return scrollNarrow;
        },

        getXSpeed: function () {
            return Date.now() - lastMoveTime > 500 ? 0 : speedX;
        },

        getYSpeed: function () {
            return Date.now() - lastMoveTime > 500 ? 0 : speedY;
        },

        /**
         * 控件继承。
         * 如果不指定类型样式，表示使用父控件的类型样式，如果指定的类型样式以 * 符号开头，表示移除父控件的类型样式并以之后的类型样式代替。生成的子类构造函数已经使用了 constructor/TYPES/CLASS 三个属性，TYPES 属性是控件的全部类型样式，CLASS 属性是控件的全部类型样式字符串。
         * @public
         *
         * @param {Function} superClass 父控件类
         * @param {string} type 子控件的类型样式
         * @param {Function} constructor 子控件的标准构造函数，如果忽略将直接调用父控件类的构造函数
         * @param {Object} ... 控件扩展的方法
         * @return {Function} 新控件的构造函数
         */
        inherits: function (superClass, type, constructor) {
            var index = 3,
                realType = type,
                realConstructor = constructor,
                subClass = function (el, options) {
                    subClass.constructor.call(this, el, options);
                    subClass.interfaces.forEach(function (constructor) {
                        constructor.call(this, el, options);
                    }, this);
                };

            if ('string' !== typeof realType) {
                index--;
                realType = '';
                realConstructor = type;
            }

            if ('function' !== typeof realConstructor) {
                subClass.constructor = superClass.constructor;
                index--;
            } else {
                subClass.constructor = realConstructor;
            }
            subClass.interfaces = [];

            if (superClass) {
                util.inherits(subClass, superClass);

                if (realType && realType.charAt(0) === '*') {
                    (subClass.TYPES = superClass.TYPES.slice())[0] = realType.slice(1);
                } else {
                    subClass.TYPES = (realType ? [realType] : []).concat(superClass.TYPES);
                }
            } else {
                // ecui.ui.Control的特殊初始化设置
                subClass.TYPES = [];
            }
            subClass.CLASS = subClass.TYPES.length ? ' ' + subClass.TYPES.join(' ') + ' ' : ' ';

            Array.prototype.slice.call(arguments, index).forEach(function (item) {
                if (item.NAME) {
                    if (item.constructor) {
                        subClass.interfaces.push(item.constructor);
                    }
                    // 对接口的处理
                    var Clazz = new Function();
                    Clazz.prototype = superClass.prototype;
                    var prototype = new Clazz();
                    util.extend(prototype, subClass.prototype);
                    subClass.prototype[item.NAME] = prototype;
                    item = item.Methods;
                }
                util.extend(subClass.prototype, item);
            });

            // 释放闭包占用的资源
            superClass = type = constructor = realConstructor = null;
            return subClass;
        },

        /**
         * 初始化指定的 Element 对象对应的 DOM 节点树。
         * init 方法将初始化指定的 Element 对象及它的子节点，如果这些节点拥有初始化属性(参见 getAttributeName 方法)，将按照规则为它们绑定 ECUI 控件，每一个节点只会被绑定一次，重复的绑定无效。页面加载完成时，将会自动针对 document.body 执行这个方法，相当于自动执行以下的语句：ecui.init(document.body)
         * @public
         *
         * @param {Element} el Element 对象
         */
        init: function (el) {
            if (!initEnvironment() && el) {
                var list = dom.getAttribute(el, ecuiName) ? [el] : [],
                    controls = [],
                    options;

                if (!initRecursion) {
                    // 第一层 init 循环的时候需要关闭resize事件监听，防止反复的重入
                    dom.removeEventListener(window, 'resize', core.repaint);
                }
                initRecursion++;

                Array.prototype.forEach.call(el.all || el.getElementsByTagName('*'), function (item) {
                    if (dom.getAttribute(item, ecuiName)) {
                        list.push(item);
                    }
                });

                list.forEach(function (item) {
                    if (options = core.getOptions(item)) {
                        options.main = item;
                        item = options.type ?
                                options.type.indexOf('.') < 0 ?
                                        ui[util.toCamelCase(options.type.charAt(0).toUpperCase() + options.type.slice(1))] :
                                        util.parseValue(options.type, ui) || util.parseValue(options.type) :
                                ui.Control;
                        controls.push({object: core.$create(item, options), options: options});
                    }
                });

                controls.forEach(function (item) {
                    item.object.cache();
                });
                controls.forEach(function (item) {
                    item.object.init(item.options);
                });

                initRecursion--;
                if (!initRecursion) {
                    dom.addEventListener(window, 'resize', core.repaint);
                }
            }
        },

        /**
         * 设置框架拦截之后的一次点击，并将点击事件发送给指定的 ECUI 控件。
         * intercept 方法将下一次的鼠标点击事件转给指定控件的 $intercept 方法处理，相当于拦截了一次框架的鼠标事件点击操作，框架其它的状态不会自动改变，例如拥有焦点的控件不会改变。如果 $intercept 方法不阻止冒泡，将自动调用 restore 方法。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        intercept: function (control) {
            interceptEnv.target = control;
            setEnv(interceptEnv);
        },

        /**
         * 默认的盒子模型是否为ContentBox状态
         * @public
         */
        isContentBox: function () {
            return flgFixedSize;
        },

        /**
         * 当前是否处于按压状态
         * @public
         *
         * @return {boolean} 是否有鼠标左键未释放处于按压状态
         */
        isTouch: function () {
            return touchCount > 0;
        },

        /**
         * 使控件失去焦点。
         * loseFocus 方法不完全是 setFocused 方法的逆向行为。如果控件及它的子控件不处于焦点状态，执行 loseFocus 方法不会发生变化。如果控件或它的子控件处于焦点状态，执行 loseFocus 方法将使控件失去焦点状态，如果控件拥有父控件，此时父控件获得焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        loseFocus: function (control) {
            if (control.contain(focusedControl)) {
                core.setFocused(control.getParent());
            }
        },

        /**
         * 使用或取消一个层遮罩整个浏览器可视化区域。
         * 遮罩层的 z-index 样式默认取值为 32767，请不要将 Element 对象的 z-index 样式设置大于 32767。当框架中至少一个遮罩层工作时，body 标签将增加一个样式 ecui-mask，IE6/7 的原生 select 标签可以使用此样式进行隐藏，解决强制置顶的问题。如果不传入任何参数，将关闭最近打开的一个遮罩层，如果要关闭指定的遮罩层，请直接调用返回的函数。
         * @public
         *
         * @param {number} opacity 透明度，如 0.5，如果省略参数将关闭遮罩层
         * @param {number} zIndex 遮罩层的 zIndex 样式值，如果省略使用 32767
         * @return {Function} 用于关闭当前遮罩层的函数
         */
        mask: function (opacity, zIndex) {
            var el = document.body,
                view = util.getView(),
                // 宽度向前扩展2屏，向后扩展2屏，是为了解决翻屏滚动的剧烈闪烁问题
                // 不直接设置为整个页面的大小，是为了解决IE下过大的遮罩层不能半透明的问题
                top = Math.max(view.top - view.height * 2, 0),
                left = Math.max(view.left - view.width * 2, 0),
                text = ';top:' + top + 'px;left:' + left + 'px;width:' + Math.min(view.width * 5, view.pageWidth - left) + 'px;height:' + Math.min(view.height * 5, view.pageHeight - top) + 'px;display:';

            if ('boolean' === typeof opacity) {
                // 仅简单的显示或隐藏当前的屏蔽层，用于resize时的重绘
                text += opacity ? 'block' : 'none';
                maskElements.forEach(function (item) {
                    item.style.cssText += text;
                });
            } else if (opacity === undefined) {
                unmasks.pop()();
            } else {
                if (!maskElements.length) {
                    dom.addClass(el, 'ui-modal');
                }
                maskElements.push(
                    el = el.appendChild(
                        dom.create(
                            {
                                className: 'ui-mask',
                                style: {
                                    cssText: text + 'block;z-index:' + (zIndex || 32767)
                                }
                            }
                        )
                    )
                );
                dom.setStyle(el, 'opacity', opacity);

                unmasks.push(

                    /**
                     * 关闭浮层。
                     * @public
                     *
                     * @param {boolean} unload 是否在 unload 中触发函数
                     */
                    function (unload) {
                        if (!unload) {
                            util.remove(maskElements, el);
                            util.timer(dom.remove, 1000, null, el);
                            el.style.display = 'none';
                            if (!maskElements.length) {
                                dom.removeClass(document.body, 'ui-modal');
                            }
                        }
                        el = null;
                    }
                );

                return unmasks[unmasks.length - 1];
            }
        },

        /**
         * 暂停框架自动初始化，暂停次数可以累加。
         * @public
         */
        pause: function () {
            pauseCount++;
        },

        /**
         * 查询满足条件的控件列表。
         * @public
         *
         * @param {Function} fn 查询函数
         * @param {Object} thisArg fn执行过程中的this对象
         * @return {Array} 控件列表
         */
        query: function (fn, thisArg) {
            return independentControls.filter(fn, thisArg);
        },

        /**
         * 移除控件的事件监听器。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        removeControlListeners: function (control) {
            var name = control.getUID() + '#',
                len = name.length;
            for (var key in eventListeners) {
                if (eventListeners.hasOwnProperty(key)) {
                    if (key.slice(0, len) === name) {
                        delete eventListeners[key];
                    }
                }
            }
        },

        /**
         * 移除控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {Function} func 监听函数
         */
        removeEventListener: function (control, name, func) {
            if (name = eventListeners[control.getUID() + '#' + name]) {
                util.remove(name, func);
            }
        },

        /**
         * 重绘浏览器区域的控件。
         * repaint 方法在页面改变大小时自动触发，一些特殊情况下，例如包含框架的页面，页面变化时不会触发 onresize 事件，需要手工调用 repaint 函数重绘所有的控件。
         * @public
         */
        repaint: function () {
            if (isMobile) {
                // 移动端不需要处理浏览器resize的情况，因为此时一般是输入法触发的
                return;
            }

            function filter(item) {
                return item.getParent() === resizeList && item.isShow();
            }

            if (ieVersion) {
                // 防止 ie6/7 下的多次重入
                widthList = (isStrict ? document.documentElement : document.body).clientWidth;
                if (lastClientWidth !== widthList) {
                    lastClientWidth = widthList;
                } else {
                    // 如果高度发生变化，相当于滚动条的信息发生变化，因此需要产生scroll事件进行刷新
                    onscroll(new ECUIEvent('scroll'));
                    return;
                }
            }

            // 隐藏所有遮罩层
            core.mask(false);

            // 改变窗体大小需要清空拖拽状态
            if (currEnv.type === 'drag') {
                currEnv.mouseup(new ECUIEvent('mouseup'));
            }

            independentControls.forEach(function (item) {
                core.triggerEvent(item, 'repaint');
            });

            // 按广度优先查找所有正在显示的控件，保证子控件一定在父控件之后
            for (var i = 0, list = [], resizeList = null, widthList; resizeList !== undefined; resizeList = list[i++]) {
                Array.prototype.push.apply(list, core.query(filter));
            }

            resizeList = list.filter(function (item) {
                core.triggerEvent(item, 'resize', widthList = new ECUIEvent('repaint'));
                // 这里与Control控件的$resize方法存在强耦合，repaint有值表示在$resize中没有进行针对ie的width值回填
                if (widthList.repaint) {
                    return item;
                }
            });

            if (resizeList.length) {
                // 由于强制设置了100%，因此改变ie下控件的大小必须从内部向外进行
                // 为避免多次reflow，增加一次循环
                widthList = resizeList.map(function (item) {
                    return item.getMain().offsetWidth;
                });
                resizeList.forEach(function (item, index) {
                    item.getMain().style.width = widthList[index] - (isStrict ? item.$getBasicWidth() * 2 : 0) + 'px';
                });
            }

            list.forEach(function (item) {
                item.cache(true, true);
            });
            list.forEach(function (item) {
                item.initStructure();
            });

            if (ieVersion < 8) {
                // 解决 ie6/7 下直接显示遮罩层，读到的浏览器大小实际未更新的问题
                util.timer(core.mask, 0, null, true);
            } else {
                core.mask(true);
            }
        },

        /**
         * 恢复当前框架的状态到上一个状态。
         * restore 用于恢复调用特殊操作如 drag 与 intercept 后改变的框架环境，包括各框架事件处理函数的恢复、控件的焦点设置等。
         * @public
         */
        restore: function () {
            setHandler(currEnv, true);
            setHandler(currEnv = envStack.pop());
        },

        /**
         * 触发框架自动初始化，减少暂停次数，到零时触发初始化。
         * @public
         */
        resume: function () {
            pauseCount--;
            if (!pauseCount) {
                if (document.body) {
                    dom.ready(function () {
                        core.init();
                    });
                }
            } else if (pauseCount < 0) {
                pauseCount = 0;
            }
        },

        /**
         * 使 ECUI 控件 得到焦点。
         * setFocused 方法将指定的控件设置为焦点状态，允许不指定需要获得焦点的控件，则当前处于焦点状态的控件将失去焦点，需要将处于焦点状态的控件失去焦点还可以调用 loseFocus 方法。如果控件处于失效状态，设置它获得焦点状态将使所有控件失去焦点状态。需要注意的是，如果控件处于焦点状态，当通过 setFocused 方法设置它的子控件获得焦点状态时，虽然处于焦点状态的控件对象发生了变化，但是控件不会触发 onblur 方法，此时控件逻辑上仍然处于焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        setFocused: function (control) {
            if (!control || control.isDisabled()) {
                // 处于失效状态的控件不允许获得焦点状态
                control = null;
            }

            var parent = getCommonParent(focusedControl, control);
            bubble(focusedControl, 'blur', null, parent);
            bubble(focusedControl = control, 'focus', null, parent);
        },

        /**
         * 触发事件。
         * triggerEvent 会根据事件返回值或 event 的新状态决定是否触发默认事件处理。
         * @public
         *
         * @param {ecui.ui.Control} control 控件对象
         * @param {string} name 事件名
         * @param {ECUIEvent|Object} event 事件对象或事件对象参数
         * @param {Object} ... 事件的其它参数
         * @return {boolean} 是否阻止默认事件处理
         */
        triggerEvent: function (control, name, event) {
            // 防止事件重入
            var uid = control.getUID(),
                args = Array.prototype.slice.call(arguments, 2),
                listeners;

            eventStack[uid] = eventStack[uid] || {};
            if (eventStack[uid][name]) {
                return;
            }
            eventStack[uid][name] = true;

            if (!(event instanceof ECUIEvent)) {
                event = util.extend(new ECUIEvent(name), event);
            } else {
                event.type = name;
            }

            delete event.returnValue;
            if ((control['on' + name] && control['on' + name].apply(control, args) === false) || event.returnValue === false || (control['$' + name] && control['$' + name].apply(control, args) === false)) {
                event.preventDefault();
            }

            // 检查事件是否被监听
            if (listeners = eventListeners[uid + '#' + name]) {
                listeners.forEach(function (item) {
                    if (item) {
                        item.apply(control, args);
                    }
                });
            }

            delete eventStack[uid][name];
            return event.returnValue !== false;
        },

        /**
         * 包装事件对象。
         * event 方法将浏览器产生的鼠标与键盘事件标准化并添加 ECUI 框架需要的信息到事件对象中。标准化的属性如下：
         * pageX           {number} 鼠标的X轴坐标
         * pageY           {number} 鼠标的Y轴坐标
         * which           {number} 触发事件的按键码
         * target          {HTMLElement} 触发事件的 Element 对象
         * returnValue     {boolean}  是否进行默认处理
         * cancelBubble    {boolean}  是否取消冒泡
         * exit            {Function} 终止全部事件操作
         * getControl      {Function} 获取触发事件的 ECUI 控件 对象
         * getNative       {Function} 获取原生的事件对象
         * preventDefault  {Function} 阻止事件的默认处理
         * stopPropagation {Function} 事件停止冒泡
         * @public
         *
         * @param {Event} event 事件对象
         * @return {ECUIEvent} 标准化后的事件对象
         */
        wrapEvent: function (event) {
            if (event instanceof ECUIEvent) {
                // 防止事件对象被多次包装
                return event;
            }

            var body = document.body,
                html = dom.getParent(body);

            if (ieVersion < 9) {
                event = window.event;
                event.pageX = html.scrollLeft + body.scrollLeft - html.clientLeft + (event.touches ? event.touches[0].clientX : event.clientX) - body.clientLeft;
                event.pageY = html.scrollTop + body.scrollTop - html.clientTop + (event.touches ? event.touches[0].clientY : event.clientY) - body.clientTop;
                event.target = event.srcElement;
                event.which = event.keyCode || (event.button | 1);
            }

            event = new ECUIEvent(event.type, event);

            if (event.type === 'mousemove' || event.type === 'touchmove') {
                lastClick = null;
                if (currEnv.type === 'drag') {
                    lastMoveTime = 1000 / (Date.now() - lastMoveTime);
                    speedX = (event.pageX - mouseX) * lastMoveTime;
                    speedY = (event.pageY - mouseY) * lastMoveTime;
                    lastMoveTime = Date.now();
                }
            } else if (event.type !== 'mouseup' && event.type !== 'touchend') {
                speedX = 0;
                speedY = 0;
            }

            mouseX = event.pageX;
            mouseY = event.pageY;

            return event;
        }
    });

    dom.ready(function () {
        if (!pauseCount) {
            core.init();
        }
    });
}());
