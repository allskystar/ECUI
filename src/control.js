//{if $css}//
ecui.__ControlStyle__('\
.ui-hide {\
    display: none !important;\
}\
');
//{/if}//
/*
@example
<div ui="type:control">
    <!-- 这里放控件包含的内容 -->
    ...
</div>
*/
/*ignore*/
/*
@fields
_bCapturable        - 控件是否响应浏览器事件状态
_bUserSelect        - 控件是否允许选中内容
_bFocusable         - 控件是否允许获取焦点
_bDisabled          - 控件的状态，为true时控件不处理任何事件
_bGesture           - 控件是否允许手势操作
_bCached            - 控件是否已经读入缓存
_bReady             - 控件是否已经完全生成
_sUID               - 控件的内部ID
_sClass             - 控件的当前样式
_sSubType           - 控件的子类型
_sWidth             - 控件的基本宽度值，可能是百分比或者空字符串
_sHeight            - 控件的基本高度值，可能是百分比或者空字符串
_eMain              - 控件的基本标签对象
_eBody              - 控件用于承载子控件的载体标签，通过$setBody函数设置这个值，绑定当前控件
_cParent            - 父控件对象
_hResize            - 改变大小的事件
_aStatus            - 控件当前的状态集合
*/
/*end*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var waitReadyList;

    /**
     * 设置控件的父对象。
     * @private
     *
     * @param {ecui.ui.Control} parent 父控件对象
     * @param {HTMLElement} parentElement 父 Element 对象
     */
    function alterParent(parent, parentElement) {
        var oldParent = this._cParent,
            el = this._eMain;

        // 触发原来父控件的移除子控件事件
        if (parent !== oldParent) {
            if (oldParent) {
                if (!core.dispatchEvent(oldParent, 'remove', {child: this})) {
                    return;
                }
            }
            if (parent) {
                if (!core.dispatchEvent(parent, 'append', {child: this})) {
                    parent = parentElement = null;
                }
            }
        }

        if (parentElement !== el.parentElement) {
            if (parentElement) {
                parentElement.appendChild(el);
            } else {
                dom.remove(el);
            }
        }

        this.$setParent(parent);
    }

    /**
     * 部件的ready事件监听器。
     * @private
     *
     * @param {ECUIEvent} event ECUI事件对象
     */
    function unitReadyHandler(event) {
        // ready事件不允许被阻止
        if (this.isShow() && !core.dispatchEvent(this, 'ready', event)) {
            this.$ready(event);
        }
    }

    /**
     * 基础控件。
     * 基础控件 与 ECUI状态与事件控制器 共同构成 ECUI核心。基础控件扩展了原生 DOM 节点的标准事件，提供对控件基础属性的操作，是所有控件实现的基础。
     * options 属性：
     * id          名称，指定后可以使用 ecui.get([id]) 的方式获取控件
     * uid         唯一标识符，不可自行定义，系统自动生成
     * primary     主元素需要绑定的样式
     * capturable  是否接收交互事件，如果设置不接收交互事件，交互事件由控件的父控件处理，缺省值为 true
     * disabled    是否失效，如果设置失效，控件忽略所有事件，缺省值为 false
     * focusable   是否允许获取焦点，如果设置不允许获取焦点，控件的交互事件不会改变当前拥有焦点的控件，用于自定义滚动条，缺省值为 true
     * userSelect  是否允许选中内容，缺省值为 true
     * data        控件缓存数据对象
     * item        控件缓存数据对象
     * @control
     */
    ui.Control = core.inherits(
        null,
        function (el, options) {
            this._eMain = this._eBody = el;
            if (options.primary) {
                el.className = (options.id || '') + ' ' + el.className + options.primary;
            }
            // svg classname 是数组 不能做trim操作
            if (typeof el.className === 'string') {
                this._sClass = el.classList[0];
            }
            this._bDisabled = !!options.disabled;
            this._bCapturable = options.capturable !== false;
            this._bUserSelect = options.userSelect !== false;
            this._bFocusable = options.focusable;
            this._oData = options.data;
            this._oItem = options.item;
            this._bGesture = true;
            this._sSubType = '';
            this._aStatus = ['', ' '];
            this._sWidth = el.style.width;
            this._sHeight = el.style.height;
            this._hResize = util.blank;
            if (!options.main) {
                this._UIControl_oHandler = unitReadyHandler.bind(this);
            }
        },
        {
            /**
             * 激活事件。
             * 控件激活时，添加状态样式 active。
             * @event
             */
            $activate: function () {
                this.alterStatus('+active');
            },

            /**
             * 添加子控件事件。
             * @event
             */
            $append: util.blank,

            /**
             * 滚动前事件。
             * @event
             */
            $beforescroll: util.blank,

            /**
             * 失去焦点事件。
             * 控件失去焦点时，移除状态样式 focus。
             * @event
             */
            $blur: function () {
                if (this._eBody.contains(document.activeElement)) {
                    try {
                        document.activeElement.blur();
                    } catch (ignore) {
                    }
                }
                this.alterStatus('-focus');
            },

            /**
             * 缓存控件的属性。
             * $cache 方法缓存部分控件属性的值，在初始化时避免频繁的读写交替操作，加快渲染的速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法直接操作 DOM 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @protected
             *
             * @param {CssStyle} style 主元素的css样式对象
             */
            $cache: function (style) {
                var resize;
                this.$$border = [dom.toPixel(style.borderTopWidth), dom.toPixel(style.borderRightWidth), dom.toPixel(style.borderBottomWidth), dom.toPixel(style.borderLeftWidth)];
                this.$$padding = [dom.toPixel(style.paddingTop), dom.toPixel(style.paddingRight), dom.toPixel(style.paddingBottom), dom.toPixel(style.paddingLeft)];
                if (this.$$width !== this._eMain.offsetWidth) {
                    if (this.$$width) {
                        resize = true;
                    }
                    this.$$width = this._eMain.offsetWidth;
                }
                if (this.$$height !== this._eMain.offsetHeight) {
                    if (this.$$height) {
                        resize = true;
                    }
                    this.$$height = this._eMain.offsetHeight;
                }
                if (resize) {
                    this._hResize();
                    this._hResize = util.timer(function () {
                        core.dispatchEvent(this, 'resize');
                    }, 0, this);
                }
            },

            /**
             * 点击事件。
             * @event
             */
            $click: util.blank,

            /**
             * 控件创建事件。
             * @event
             */
            $create: function () {
                core.$bind(this.getMain(), this);
            },

            /**
             * 双击事件。
             * @event
             */
            $dblclick: util.blank,

            /**
             * 失去激活事件。
             * 控件失去激活时，移除状态样式 active。
             * @event
             */
            $deactivate: function () {
                this.alterStatus('-active');
            },

            /**
             * 失效事件。
             * 控件失效时，增加样式 ui-disabled 与状态样式 disabled
             * @event
             */
            $disable: function () {
                dom.addClass(this._eMain, 'ui-disabled');
                this.alterStatus('+disabled');
                core.$clearState(this);

                var el = this._eMain;
                dom.toArray(el.all || el.getElementsByTagName('*')).forEach(function (item) {
                    if (item.disabled !== undefined || item.getAttribute('contenteditable')) {
                        var tabIndex = item.getAttribute('tabIndex') || '';
                        if (tabIndex !== '-1') {
                            item.setAttribute('_tabIndex', tabIndex);
                            item.setAttribute('tabIndex', '-1');
                        }
                    }
                });
            },

            /**
             * 销毁事件。
             * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
             * @event
             */
            $dispose: function () {
                this.$setParent();
                this._eMain.getControl = null;
                this._eMain = this._eBody = null;
                // 取消初始化的操作，防止控件在 onload 结束前被 dispose，从而引发初始化访问的信息错误的问题
                this.initStructure = util.blank;
            },

            /**
             * 拖拽结束事件。
             * @event
             */
            $dragend: util.blank,

            /**
             * 拖拽事件。
             * event 属性：
             * x   x轴坐标
             * y   y轴坐标
             * @event
             */
            $dragmove: function (event) {
                this.setPosition(event.x, event.y);
            },

            /**
             * 拖拽开始事件。
             * @event
             */
            $dragstart: util.blank,

            /**
             * 启用事件。
             * 控件启用时，移除样式 ui-disabled 与状态样式 disabled
             * @event
             */
            $enable: function () {
                dom.removeClass(this._eMain, 'ui-disabled');
                this.alterStatus('-disabled');

                var el = this._eMain;
                dom.toArray(el.all || el.getElementsByTagName('*')).forEach(function (item) {
                    var tabIndex = item.getAttribute('_tabIndex');
                    if (tabIndex !== null) {
                        if (tabIndex) {
                            item.setAttribute('tabIndex', tabIndex);
                        } else {
                            item.removeAttribute('tabIndex');
                        }
                        item.removeAttribute('_tabIndex');
                    }
                });
            },

            /**
             * 获得焦点事件。
             * 控件获得焦点时，添加状态样式 focus。
             * @event
             */
            $focus: function () {
                if (this.isFocused()) {
                    this.alterStatus('+focus');
                }
            },

            /**
             * 3D Touch 用力按下事件。
             * @event
             */
            $forcedown: util.blank,

            /**
             * 3D Touch 释放弹起事件。
             * @event
             */
            $forceup: util.blank,

            /**
             * 获取控件的基本高度。
             * 控件的基本高度指控件基本区域与用户数据存放区域的高度差值，即主元素与内部元素(如果相同则忽略其中之一)的上下边框宽度(border-width)与上下内填充宽度(padding)之和。
             * @protected
             *
             * @return {number} 控件的基本高度
             */
            $getBasicHeight: function () {
                return this.isCached() ? this.$$border[0] + this.$$border[2] + this.$$padding[0] + this.$$padding[2] : 0;
            },

            /**
             * 获取控件的基本宽度。
             * 控件的基本宽度指控件基本区域与用户数据存放区域的宽度差值，即主元素与内部元素(如果相同则忽略其中之一)的左右边框宽度(border-width)与左右内填充宽度(padding)之和。
             * @protected
             *
             * @return {number} 控件的基本宽度
             */
            $getBasicWidth: function () {
                return this.isCached() ? this.$$border[1] + this.$$border[3] + this.$$padding[1] + this.$$padding[3] : 0;
            },

            /**
             * 获取指定的部件。
             * $getSection 方法返回控件的一个部件对象，部件对象也是 ECUI 控件，是当前控件的组成成份，不可缺少，请不要轻易的对部件对象进行操作。
             * @protected
             *
             * @param {string} name 部件名称
             * @return {ecui.ui.Control} 部件对象
             */
            $getSection: function (name) {
                return this['_u' + name];
            },

            /**
             * 隐藏事件。
             * 控件隐藏时，控件失去激活、悬停与焦点状态，不检查控件之前的状态，因此不会导致浏览器的刷新操作。
             * @event
             */
            $hide: util.blank,

            /**
             * 初始化控件的结构。
             * @protected
             *
             * @param {number} width 控件的宽度
             * @param {number} height 控件的高度
             */
            $initStructure: util.blank,

            /**
             * 键盘键按下事件。
             * @event
             */
            $keydown: util.blank,

            /**
             * 键盘键持续按压事件。
             * @event
             */
            $keypress: util.blank,

            /**
             * 键盘键弹起事件。
             * @event
             */
            $keyup: util.blank,

            /**
             * 鼠标键按下事件。
             * @event
             */
            $mousedown: util.blank,

            /**
             * 鼠标移动事件。
             * @event
             */
            $mousemove: util.blank,

            /**
             * 鼠标移出事件。
             * 鼠标移出控件区域时，控件失去悬停状态，移除状态样式 hover。
             * @event
             */
            $mouseout: function () {
                this.alterStatus('-hover');
            },

            /**
             * 鼠标移入事件。
             * 鼠标移入控件区域时，控件获得悬停状态，添加状态样式 hover。
             * @event
             */
            $mouseover: function () {
                this.alterStatus('+hover');
            },

            /**
             * 鼠标键弹起事件。
             * @event
             */
            $mouseup: util.blank,

            /**
             * 鼠标滚轮事件。
             * @event
             */
            $mousewheel: util.blank,

            /**
             * 初始化完成事件。
             * @event
             */
            $ready: function () {
                this._bReady = true;
                if (this._cParent) {
                    core.removeEventListener(this._cParent, 'ready', this._UIControl_oHandler);
                }
                delete this._UIControl_oHandler;
            },

            /**
             * 移除子控件事件。
             * @event
             */
            $remove: util.blank,

            /**
             * 控件结构恢复。
             * @protected
             */
            $restoreStructure: function () {
                this._eMain.style.width = this._sWidth;
                this._eMain.style.height = this._sHeight;
            },

            /**
             * 滚动事件。
             * @event
             */
            $scroll: util.blank,

            /**
             * 设置控件的内层元素。
             * ECUI 控件 逻辑上分为外层元素、主元素与内层元素，外层元素用于控制控件自身布局，主元素是控件生成时捆绑的 Element 对象，而内层元素用于控制控件对象的子控件与文本布局，三者允许是同一个 Element 对象。
             * @protected
             *
             * @param {HTMLElement} el Element 对象
             */
            $setBody: function (el) {
                this._eBody = el;
            },

            /**
             * 直接设置父控件。
             * 相对于 setParent 方法，$setParent 方法仅设置控件对象逻辑上的父对象，不进行任何逻辑上的检查，用于某些特殊情况下的设定，如下拉框控件中的选项框子控件需要使用 $setParent 方法设置它的逻辑父控件为下拉框控件。
             * @protected
             *
             * @param {ecui.ui.Control} parent ECUI 控件对象
             */
            $setParent: function (parent) {
                if (this._UIControl_oHandler) {
                    if (this._cParent) {
                        core.removeEventListener(this._cParent, 'ready', this._UIControl_oHandler);
                    }
                    this._cParent = parent;
                    if (parent) {
                        if (parent.isReady() && this.isShow()) {
                            if (!core.dispatchEvent(this, 'ready')) {
                                this.$ready(core.wrapEvent('ready'));
                            }
                        } else {
                            core.addEventListener(parent, 'ready', this._UIControl_oHandler);
                        }
                    }
                } else {
                    this._cParent = parent;
                }
            },

            /**
             * 设置控件的大小。
             * @protected
             *
             * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
             * @param {number} height 高度，如果不需要设置则省略此参数
             */
            $setSize: function (width, height) {
                this.cache();

                var fixedSize = core.isContentBox(this._eMain),
                    resize,
                    value;

                // 防止负宽度IE下出错
                if (width && (value = width - (fixedSize ? this.$getBasicWidth() : 0)) > 0) {
                    this._eMain.style.width = value + 'px';
                    if (this.$$width !== width) {
                        if (this.$$width) {
                            resize = true;
                        }
                        this.$$width = width;
                    }
                }

                // 防止负高度IE下出错
                if (height && (value = height - (fixedSize ? this.$getBasicHeight() : 0)) > 0) {
                    this._eMain.style.height = value + 'px';
                    if (this.$$height !== height) {
                        if (this.$$height) {
                            resize = true;
                        }
                        this.$$height = height;
                    }
                }

                if (resize) {
                    this._hResize();
                    this._hResize = util.timer(function () {
                        core.dispatchEvent(this, 'resize');
                    }, 0, this);
                }
            },

            /**
             * 显示控件。
             * $show 方法直接显示控件，不检查控件之前的状态，因此不会导致浏览器的刷新操作。
             * @protected
             */
            $show: util.blank,

            /**
             * 为控件添加/移除一个状态样式。
             * 状态样式分别附加在类型样式与当前样式之后(参见 getType 与 getClass 方法)，使用-号进行分隔。如果类型样式为 ui-control，当前样式为 demo，扩展样式 hover 后，控件主元素将存在四个样式，分别为 ui-control、demo、ui-control-hover 与 demo-hover。
             * @public
             *
             * @param {string} className 状态样式名，以+号开头表示添加扩展样式，以-号开头表示移除扩展样式
             */
            alterStatus: function (className) {
                if (this._sClass) {
                    var classes = this.getClasses();
                    classes.push('');

                    if (className.charAt(0) === '+') {
                        className = '-' + className.slice(1) + ' ';
                        if (this._aStatus.indexOf(className) < 0) {
                            dom.addClass(this._eMain, classes.join(className));
                            this._aStatus.push(className);
                        }
                    } else {
                        className += ' ';
                        if (this._aStatus.indexOf(className) >= 0) {
                            dom.removeClass(this._eMain, classes.join(className));
                            util.remove(this._aStatus, className);
                        }
                    }
                }
            },

            /**
             * 改变控件的子类型。
             * 控件的子类型会自动基于控件的类型与基本样式进行扩展，目前一个控件只能有一个子类型，用于 checkbox/radio/treeview 等改变状态使用，需要移除子类型只需要传入空字符串即可。
             * @public
             *
             * @param {string} subtype 子类型名
             */
            alterSubType: function (subtype) {
                if (this._sSubType !== subtype) {
                    var classes = this.constructor.TYPES[0].slice();
                    if (this._sClass && this._sClass !== classes[0]) {
                        classes.push(this._sClass);
                    }

                    if (this._sSubType) {
                        dom.removeClass(
                            this._eMain,
                            classes.map(
                                function (item) {
                                    return this._aStatus.join(item + '-' + this._sSubType);
                                },
                                this
                            ).join('')
                        );
                    }
                    if (subtype) {
                        dom.addClass(
                            this._eMain,
                            classes.map(
                                function (item) {
                                    return this._aStatus.join(item + '-' + subtype);
                                },
                                this
                            ).join('')
                        );
                    }
                    this._sSubType = subtype;
                }
            },

            /**
             * 将控件添加到页面元素中。
             * appendTo 方法设置父元素，并使用 findControl 查找父控件对象。如果父控件发生变化，原有的父控件若存在，将触发移除子控件事件(onremove)，并解除控件与原有父控件的关联，新的父控件若存在，将触发添加子控件事件(onappend)，如果此事件返回 false，添加失败，相当于忽略 parentElement 参数。
             * @public
             *
             * @param {HTMLElement} parentElement 父 Element 对象，忽略参数控件将移出 DOM 树
             */
            appendTo: function (parentElement) {
                alterParent.call(this, parentElement && core.findControl(parentElement), parentElement);
            },

            /**
             * 控件失去焦点状态。
             * blur 方法将使控件失去焦点状态，参见 loseFocus 方法。
             * @public
             */
            blur: function () {
                core.loseFocus(this);
            },

            /**
             * 缓存控件的属性。
             * cache 方法验证控件是否已经缓存，如果未缓存将调用 $cache 方法缓存控件属性的值。在子控件或者应用程序开发过程中，如果需要避开控件提供的方法直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @public
             *
             * @param {boolean} force 是否需要强制刷新缓存，相当于之前执行了 clearCache 方法，默认不强制刷新
             */
            cache: function (force) {
                if ((force || !this._bCached) && (this._eMain.offsetWidth || this._eMain.offsetHeight)) {
                    force = this._bCached === undefined;
                    this._bCached = true;
                    this.$cache(window.getComputedStyle(this._eMain));
                    if (force && this._bInited) {
                        // 已经初始化，但第一次缓存的控件进行结构化
                        this.initStructure();
                    }
                } else if (force) {
                    this.clearCache();
                }
            },

            /**
             * 控件居中显示。
             * @public
             *
             * @param {number} top y轴的坐标，如果不指定水平方向也居中
             */
            center: function (top) {
                var parent = this._eMain.offsetParent;

                if (!parent || parent.tagName === 'BODY' || parent.tagName === 'HTML') {
                    var view = dom.getView(),
                        x = view.right + view.left,
                        y = view.bottom + view.top;
                } else {
                    x = parent.offsetWidth;
                    y = parent.offsetHeight;
                }
                this.setPosition(Math.max((x - this.getWidth()) / 2, 0), top !== undefined ? top : Math.max((y - this.getHeight()) / 2, 0));
            },

            /**
             * 清除控件的缓存。
             * 在子控件或者应用程序开发过程中，如果需要避开控件提供的方法直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @public
             */
            clearCache: function () {
                this._bCached = false;
            },

            /**
             * 清除所有的状态样式。
             * @public
             */
            clearStatus: function () {
                if (this._sClass) {
                    var classes = this.getClasses();
                    classes.push('');

                    this._aStatus.slice(2).forEach(
                        function (item) {
                            dom.removeClass(this._eMain, classes.join(item));
                        },
                        this
                    );

                    this._aStatus = this._aStatus.slice(0, 2);
                }
            },

            /**
             * 判断是否包含指定的控件。
             * contain 方法判断指定的控件是否逻辑上属于当前控件的内部区域，即当前控件是指定的控件的某一级父控件。
             * @public
             *
             * @param {ecui.ui.Control} control ECUI 控件
             * @return {boolean} 是否包含指定的控件
             */
            contains: function (control) {
                for (; control; control = control._cParent) {
                    if (control === this) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 控件获得失效状态。
             * 控件获得失效状态时，添加状态样式 -disabled(参见 alterStatus 方法)。disable 方法导致控件失去激活、悬停、焦点状态，所有子控件的 isDisabled 方法返回 true，但不会设置子控件的失效状态样式。
             * @public
             *
             * @return {boolean} 控件失效状态是否改变
             */
            disable: function () {
                if (!this._bDisabled) {
                    this.$disable();
                    this._bDisabled = true;
                    return true;
                }
                return false;
            },

            /**
             * 销毁控件。
             * dispose 方法销毁控件及其所有的子控件，相当于调用 ecui.dispose(this) 方法。
             * @public
             */
            dispose: function () {
                core.dispose(this);
            },

            /**
             * 控件解除失效状态。
             * 控件解除失效状态时，移除状态样式 -disabled(参见 alterStatus 方法)。enable 方法仅解除控件自身的失效状态，如果其父控件失效，isDisabled 方法返回 true。
             * @public
             *
             * @return {boolean} 控件失效状态是否改变
             */
            enable: function () {
                if (this._bDisabled) {
                    this.$enable();
                    this._bDisabled = false;
                    return true;
                }
                return false;
            },

            /**
             * 找到指定类型的祖先控件。
             * @public
             *
             * @param {Function} UIClass 控件的构造函数
             * @return {ecui.ui.Control} 指定类型的控件，如果不存在返回 null
             */
            findControl: function (UIClass) {
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof UIClass) {
                        return parent;
                    }
                }
                return null;
            },

            /**
             * 控件获得焦点状态。
             * 如果控件没有处于焦点状态，focus 方法将设置控件获取焦点状态，参见 isFocused 与 setFocused 方法。
             * @public
             */
            focus: function () {
                if (!this.isFocused()) {
                    core.setFocused(this);
                }
            },

            /**
             * 获取控件的内层元素。
             * getBody 方法返回用于控制子控件与文本布局的内层元素。
             * @public
             *
             * @return {HTMLElement} Element 对象
             */
            getBody: function () {
                return this._eBody;
            },

            /**
             * 获取控件的当前样式。
             * @public
             *
             * @return {string} 控件的当前样式
             */
            getClass: function () {
                return this._sClass;
            },

            /**
             * 获取控件的全部样式。
             * @public
             *
             * @return {Array} 控件的全部样式
             */
            getClasses: function () {
                var classes = this.constructor.TYPES[0].slice();
                if (this._sClass !== classes[0]) {
                    classes.push(this._sClass);
                }
                if (this._sSubType) {
                    classes = classes.concat(
                        classes.map(
                            function (item) {
                                return item + '-' + this._sSubType;
                            },
                            this
                        )
                    );
                }
                return classes;
            },

            /**
             * 获取控件内层可使用区域的高度。
             * getClientHeight 方法返回能被子控件与文本填充的控件区域高度，相当于盒子模型的 content 区域的高度。
             * @public
             *
             * @return {number} 控件内层可使用区域的宽度
             */
            getClientHeight: function () {
                return this.getHeight() - this.getMinimumHeight();
            },

            /**
             * 获取控件内层可使用区域的宽度。
             * getClientWidth 方法返回能被子控件与文本填充的控件区域宽度，相当于盒子模型的 content 区域的宽度。
             * @public
             *
             * @return {number} 控件内层可使用区域的宽度
             */
            getClientWidth: function () {
                return this.getWidth() - this.getMinimumWidth();
            },

            /**
             * 获取控件的内容。
             * @public
             *
             * @return {string} HTML 片断
             */
            getContent: function () {
                return this._eBody.innerHTML;
            },

            /**
             * 获取控件区域的高度。
             * @public
             *
             * @return {number} 控件的高度
             */
            getHeight: function () {
                this.cache();
                return this.$$height;
            },

            /**
             * 获取控件的主元素。
             * getMain 方法返回控件生成时定义的 Element 对象(参见 create 方法)。
             * @public
             *
             * @return {HTMLElement} Element 对象
             */
            getMain: function () {
                return this._eMain;
            },

            /**
             * 获取控件的最小高度。
             * setSize 方法不允许设置小于 getMinimumHeight 方法返回的高度值。
             * @public
             *
             * @return {number} 控件的最小高度
             */
            getMinimumHeight: function () {
                this.cache();
                return this.$getBasicHeight();
            },

            /**
             * 获取控件的最小宽度。
             * @public
             *
             * @return {number} 控件的最小宽度
             */
            getMinimumWidth: function () {
                this.cache();
                return this.$getBasicWidth();
            },

            /**
             * 获取父控件。
             * 控件接收的事件将向父控件冒泡处理，getParent 返回的结果是 ECUI 的逻辑父控件，父控件与子控件不一定存在 DOM 树层面的父子级关系。
             * @public
             *
             * @return {ecui.ui.Control} 父控件对象
             */
            getParent: function () {
                return this._cParent || null;
            },

            /**
             * 获取控件用于设置 Position 的 DOM 元素。
             * @public
             *
             * @return {HTMLElement} 控件用于设置 Position 的元素
             */
            getPositionElement: function () {
                return this._eMain;
            },

            /**
             * 获取控件的子类型。
             * @public
             *
             * @return {string} 控件的子类型
             */
            getSubType: function () {
                return this._sSubType;
            },

            /**
             * 获取控件的类型。
             * @public
             *
             * @return {string} 控件的类型
             */
            getType: function () {
                return this.constructor.TYPES[0][0];
            },

            /**
             * 获取控件的内部唯一标识符。
             * getUID 方法返回的 ID 不是初始化选项中指定的 id，而是框架为每个控件生成的内部唯一标识符。
             * @public
             *
             * @return {string} 控件 ID
             */
            getUID: function () {
                return this._sUID;
            },

            /**
             * 获取部件的样式。
             * @public
             *
             * @param {Function} baseClass 控件的构造函数，表示从这个基类开始处理部件样式
             * @param {string} name 部件名称
             * @return {string} HTML 片断
             */
            getUnitClass: function (baseClass, name) {
                for (var i = 1, clazz = this.constructor; clazz; i++) {
                    if (clazz === baseClass) {
                        break;
                    }
                    clazz = clazz.SUPER;
                }

                clazz = this.constructor.TYPES[this.constructor.TYPES.length - i].slice();
                if (this._sClass && this._sClass !== clazz[0]) {
                    clazz.push(this._sClass);
                }
                return clazz.join('-' + name + ' ') + '-' + name;
            },

            /**
             * 获取控件区域的宽度。
             * @public
             *
             * @return {number} 控件的宽度
             */
            getWidth: function () {
                this.cache();
                return this.$$width;
            },

            /**
             * 获取控件的相对X轴坐标。
             * getX 方法返回控件的外层元素的 offsetLeft 属性值。如果需要得到控件相对于整个文档的X轴坐标，请调用 getOuter 方法获得外层元素，然后调用 DOM 的相关函数计算(例如 ecui.dom.getPosition)。
             * @public
             *
             * @return {number} X轴坐标
             */
            getX: function () {
                return this.isShow() ? this._eMain.offsetLeft : 0;
            },

            /**
             * 获取控件的相对Y轴坐标。
             * getY 方法返回控件的外层元素的 offsetTop 属性值。如果需要得到控件相对于整个文档的Y轴坐标，请调用 getOuter 方法获得外层元素，然后调用 DOM 的相关函数计算(例如 ecui.dom.getPosition)。
             * @public
             *
             * @return {number} Y轴坐标
             */
            getY: function () {
                return this.isShow() ? this._eMain.offsetTop : 0;
            },

            /**
             * 隐藏控件。
             * 如果控件处于显示状态，调用 hide 方法会触发 onhide 事件，控件转为隐藏状态，并且控件会自动失去激活、悬停与焦点状态。如果控件已经处于隐藏状态，则不执行任何操作。
             * @public
             *
             * @return {boolean} 显示状态是否改变
             */
            hide: function () {
                if (!this._eMain.classList.contains('ui-hide')) {
                    var controls = [this].concat(
                        core.query(
                            function (item) {
                                return this !== item && this.contains(item) && item.isShow();
                            },
                            this
                        )
                    );
                    dom.addClass(this._eMain, 'ui-hide');
                    // 控件隐藏时需要清除状态
                    core.$clearState(this);
                    controls.forEach(function (item) {
                        core.dispatchEvent(item, 'hide');
                    });
                    return true;
                }
                return false;
            },

            /**
             * 控件初始化。
             * init 方法在控件缓存读取后调用，有关控件生成的完整过程描述请参见 基础控件。
             * @public
             */
            init: function () {
                if (this._bDisabled) {
                    this.$disable();
                }

                var el = this._eMain;
                if (el.style.display === 'none') {
                    dom.addClass(el, 'ui-hide');
                    el.style.display = '';
                } else if (this._bCached) {
                    // 处于显示状态的控件需要完成初始化
                    if (waitReadyList === null) {
                        // 页面已经加载完毕，直接初始化结构
                        this.initStructure();
                    } else {
                        if (!waitReadyList) {
                            // 页面未加载完成，将需要初始化的控件存放在调用序列中
                            // 需要这么做的原因是 ie 的 input 回填机制，一定要在 onload 之后才触发
                            waitReadyList = [];
                            util.timer(
                                function () {
                                    waitReadyList.forEach(function (item) {
                                        item.initStructure();
                                    });
                                    waitReadyList = null;
                                }
                            );
                        }
                        waitReadyList.push(this);
                    }
                }

                this._bInited = true;
            },

            /**
             * 初始化控件的结构。
             * @public
             */
            initStructure: function () {
                this.$initStructure(this.getClientWidth(), this.getClientHeight());
                if (!this._bReady) {
                    // 第一次结构化触发ready执行，ready事件默认处理不能被阻止
                    if (!core.dispatchEvent(this, 'ready')) {
                        this.$ready(core.wrapEvent('ready'));
                    }
                }
            },

            /**
             * 判断控件是否处于激活状态。
             * @public
             *
             * @return {boolean} 控件是否处于激活状态
             */
            isActived: function () {
                return this.contains(core.getActived());
            },

            /**
             * 判断是否已经缓存。
             * @public
             *
             * @return {boolean} 控件是否已经缓存
             */
            isCached: function () {
                return !!this._bCached;
            },

            /**
             * 判断是否响应浏览器事件。
             * 控件不响应浏览器事件时，相应的事件由父控件进行处理。
             * @public
             *
             * @return {boolean} 控件是否响应浏览器事件
             */
            isCapturable: function () {
                return this._bCapturable;
            },

            /**
             * 判断控件是否生成。
             * @public
             *
             * @return {boolean} 控件是否生成
             */
            isCreated: function () {
                return true;
            },

            /**
             * 判断控件是否处于失效状态。
             * 控件是否处于失效状态，影响控件是否处理事件，它受到父控件的失效状态的影响。可以通过 enable 与 disable 方法改变控件的失效状态，如果控件失效，它所有的子控件也会失效
             * @public
             *
             * @return {boolean} 控件是否失效
             */
            isDisabled: function () {
                return this._bDisabled || (!!this._cParent && this._cParent.isDisabled());
            },

            /**
             * 判断是否允许获得焦点。
             * 控件不允许获得焦点时，被点击时不会改变当前处于焦点状态的控件，但此时控件拥有框架事件响应的最高优先级。
             * @public
             *
             * @return {boolean} 控件是否允许获取焦点
             */
            isFocusable: function () {
                if (this._bFocusable !== undefined) {
                    return this._bFocusable;
                }
                var parent = this.getParent();
                return parent ? parent.isFocusable() : true;
            },

            /**
             * 判断控件是否处于焦点状态。
             * @public
             *
             * @return {boolean} 控件是否处于焦点状态
             */
            isFocused: function () {
                return this.contains(core.getFocused());
            },

            /**
             * 判断控件是否允许手势操作。
             * @public
             *
             * @return {boolean} 控件是否允许手势操作
             */
            isGestureStatus: function () {
                return !this.isDisabled() && this._bGesture;
            },

            /**
             * 判断控件是否处于悬停状态。
             * @public
             *
             * @return {boolean} 控件是否处于悬停状态
             */
            isHovered: function () {
                return this.contains(core.getHovered());
            },

            /**
             * 判断控件结构是否完全生成。
             * @public
             *
             * @return {boolean} 控件结构是否完全生成
             */
            isInited: function () {
                return !!this._bInited;
            },

            /**
             * 判断控件是否完全生成。
             * @public
             *
             * @return {boolean} 控件是否完全生成
             */
            isReady: function () {
                return !!this._bReady;
            },

            /**
             * 判断是否处于显示状态。
             * @public
             *
             * @return {boolean} 控件是否显示
             */
            isShow: function () {
                return this.isInited() && !this._eMain.classList.contains('ui-hide') && !!this._eMain.offsetWidth;
            },

            /**
             * 判断是否允许选中内容。
             * @public
             *
             * @return {boolean} 控件是否允许选中内容
             */
            isUserSelect: function () {
                return this._bUserSelect;
            },

            /**
             * 控件刷新。
             * @public
             */
            repaint: function () {
                this.$restoreStructure();
                this.cache(true);
                this.initStructure();
            },

            /**
             * 设置当前控件是否允许捕获事件。
             * @public
             *
             * @param {boolean} status 当前控件是否允许捕获事件
             */
            setCapturableStatus: function (status) {
                this._bCapturable = status;
            },

            /**
             * 设置控件可使用区域的大小。
             * @public
             *
             * @param {number} width 宽度
             * @param {number} height 高度
             */
            setClientSize: function (width, height) {
                this.setSize(width && width + this.getMinimumWidth(), height && height + this.getMinimumHeight());
            },

            /**
             * 设置控件的当前样式。
             * setClass 方法改变控件的当前样式，扩展样式分别附加在类型样式与当前样式之后，从而实现控件的状态样式改变，详细的描述请参见 alterStatus 方法。控件的当前样式通过 getClass 方法获取。
             * @public
             *
             * @param {string} currClass 控件的当前样式名称，不允许为空
             */
            setClass: function (currClass) {
                // 如果基本样式没有改变不需要执行
                if (currClass !== this._sClass) {
                    var classes = this.getClasses(),
                        className = this._eMain.className.split(/\s+/).join('  ').replace(new RegExp('(^| )(' + classes.join('|') + ')(-[^ ]+)?( |$)', 'g'), '');

                    this._sClass = currClass;

                    classes = this.getClasses();

                    this._eMain.className =
                        classes.map(
                            function (item) {
                                return this._aStatus.join(item);
                            },
                            this
                        ).join('') + className;
                }
            },

            /**
             * 设置控件的内容。
             * @public
             *
             * @param {string} html HTML 片断
             */
            setContent: function (html) {
                core.dispose(this._eBody, true);
                this._eBody.innerHTML = html;
                core.init(this._eBody);
            },

            /**
             * 设置当前控件是否允许手势操作。
             * @public
             *
             * @param {boolean} status 当前控件是否允许手势操作
             */
            setGestureStatus: function (status) {
                this._bGesture = status;
            },

            /**
             * 设置当前控件的父控件。
             * setParent 方法设置父控件，将当前控件挂接到父控件对象的内层元素中。如果父控件发生变化，原有的父控件若存在，将触发移除子控件事件(onremove)，并解除控件与原有父控件的关联，新的父控件若存在，将触发添加子控件事件(onappend)，如果此事件返回 false，添加失败，相当于忽略 parent 参数。
             * @public
             *
             * @param {ecui.ui.Control} parent 父控件对象，忽略参数控件将移出 DOM 树
             */
            setParent: function (parent) {
                alterParent.call(this, parent, parent && parent._eBody);
            },

            /**
             * 设置控件的坐标。
             * setPosition 方法设置的是控件的 left 与 top 样式，受到 position 样式的影响。
             * @public
             *
             * @param {number} x 控件的X轴坐标
             * @param {number} y 控件的Y轴坐标
             */
            setPosition: function (x, y) {
                var style = this._eMain.style;
                style.left = x + 'px';
                style.top = y + 'px';
            },

            /**
             * 设置控件的大小。
             * 需要设置的控件大小如果低于控件允许的最小值，将忽略对应的宽度或高度的设置。
             * @public
             *
             * @param {number} width 控件的宽度
             * @param {number} height 控件的高度
             */
            setSize: function (width, height) {
                if (this._bCached) {
                    // 控件新的大小不允许小于最小值
                    if (width < this.getMinimumWidth()) {
                        width = 0;
                    }
                    if (height < this.getMinimumHeight()) {
                        height = 0;
                    }

                    this.$setSize(width, height);
                    if (width) {
                        this._sWidth = this._eMain.style.width;
                    }
                    if (height) {
                        this._sHeight = this._eMain.style.height;
                    }

                    this.$restoreStructure();
                    this.initStructure();
                }
            },

            /**
             * 显示控件。
             * 如果控件处于隐藏状态，调用 show 方法会触发 onshow 事件，控件转为显示状态。如果控件已经处于显示状态，则不执行任何操作。
             * @public
             *
             * @return {boolean} 显示状态是否改变
             */
            show: function () {
                if (this._eMain.classList.contains('ui-hide')) {
                    dom.removeClass(this._eMain, 'ui-hide');
                    var controls = [this].concat(
                        core.query(
                            function (item) {
                                return this !== item && this.contains(item) && item.isShow();
                            },
                            this
                        )
                    );
                    controls.forEach(function (item) {
                        item.cache();
                    });
                    controls.forEach(function (item) {
                        core.dispatchEvent(item, 'show');
                    });
                    return true;
                }
                return false;
            }
        }
    );

    var definedInterface = {};

    ui.Control.defineProperty = function (name) {
        if (definedInterface[name]) {
            return definedInterface[name];
        }
//ecui.interfaces{
        var propertyName = name.charAt(0).toUpperCase() + name.slice(1),
            methods = {
                // item移除时选项组需要释放状态
                $remove: function (event) {
                    _class.$remove(event);
                    if (event.returnValue !== false && this._oValue === event.child) {
                        this['set' + propertyName]();
                    }
                }
            };

        // 底层的$setXXXX方法
        methods['$set' + propertyName] = function (item) {
            item = item || null;
            var oldItem = this._oValue;
            if (oldItem !== item) {
                if (oldItem) {
                    oldItem.alterStatus('-' + name);
                }
                if (item) {
                    item.alterStatus('+' + name);
                }
                this._oValue = item;
                return oldItem || null;
            }
        };

        // setXXXX方法，会发送propertychange事件
        methods['set' + propertyName] = function (item) {
            if (typeof item === 'number') {
                item = this.getItem(item);
            }

            var oldItem = this['$set' + propertyName](item);
            if (oldItem !== undefined) {
                core.dispatchEvent(this, 'propertychange', {name: name, item: item, history: oldItem});
            }
        };

        // getXXXX方法，获取属性的值
        methods['get' + propertyName] = function () {
            return this._oValue || null;
        };
//ecui.interfaces}
        return (definedInterface[name] = core.interfaces(propertyName, methods));
    };
})();
