/*
Control - ECUI 的核心组成部分，定义了基本的控件行为。
基础控件是 ECUI 的核心组成部分，对 DOM 树上的节点区域进行封装。基础控件扩展了 Element 节点的标准事件(例如得到与失去焦
点、鼠标按压事件等)，提供了方法对控件的基本属性(例如控件大小、位置与显示状态等)进行改变，是一切控件实现的基础。基本控
件支持四种状态：得到焦点(focus)、鼠标移入(over)、按压时鼠标移入(press)与失效(disabled)

基本控件直接HTML初始化的例子，id指定名称，可以通过ecui.get(id)的方式访问控件:
<div ecui="type:control;id:test">
    <!-- 这里控件包含的内容 -->
    ...
</div>

属性
_bCapture                - 控件是否响应浏览器事件状态
_bSelect                 - 控件是否允许选中内容
_bFocusable              - 控件是否允许获取焦点状态
_bEnabled                - 控件的状态，为false时控件不处理任何事件
_bCache                  - 是否处于缓存状态
_nWidth                  - 控件的宽度缓存
_nHeight                 - 控件的高度缓存
_sUID                    - 控件的ID
_sBaseClass              - 控件定义时的基本样式
_sClass                  - 控件当前使用的样式
_sType                   - 控件的类型样式，通常是ec-控件类型
_sWidth                  - 控件的基本宽度值，可能是百分比或者空字符串
_sHeight                 - 控件的基本高度值，可能是百分比或者空字符串
_sDisplay                - 控件的布局方式，在hide时保存，在show时恢复
_eBase                   - 控件的基本标签对象
_eBody                   - 控件用于承载子控件的载体标签，通过setBodyElement函数设置这个值，绑定当前控件
_cParent                 - 父控件对象
_aStatus                 - 控件当前的状态集合
$cache$borderTopWidth    - 上部边框线宽度缓存
$cache$borderLeftWidth   - 左部边框线宽度缓存
$cache$borderRightWidth  - 右部边框线宽度缓存
$cache$borderBottomWidth - 下部边框线宽度缓存
$cache$paddingTop        - 上部内填充宽度缓存
$cache$paddingLeft       - 左部内填充宽度缓存
$cache$paddingRight      - 右部内填充宽度缓存
$cache$paddingBottom     - 下部内填充宽度缓存
$cache$position          - 控件布局方式缓存
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        undefined,
        DOCUMENT = document,
        REGEXP = RegExp,

        USER_AGENT = navigator.userAgent,
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,

        remove = array.remove,
        addClass = dom.addClass,
        getParent = dom.getParent,
        getStyle = dom.getStyle,
        removeClass = dom.removeClass,
        removeDom = dom.remove,
        blank = util.blank,
        timer = util.timer,
        toNumber = util.toNumber,

        INIT = core.INIT,
        PAINT = core.PAINT,

        $bind = core.$bind,
        calcLeftRevise = core.calcLeftRevise,
        calcTopRevise = core.calcTopRevise,
        findControl = core.findControl,
        getStatus = core.getStatus,
        isFixedSize = core.isFixedSize,
        loseFocus = core.loseFocus,

        eventNames = [
            'mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup',
            'pressstart', 'pressover', 'pressmove', 'pressout', 'pressend',
            'click', 'focus', 'blur', 'keydown', 'keypress', 'keyup', 'mousewheel',
            'change', 'resize', 'create', 'init'
        ];
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化基础控件。
     * params 参数支持的属性如下：
     * type    控件的类型样式
     * base    控件的基本样式
     * capture 是否需要捕获鼠标事件，默认捕获
     * select  是否允许选中内容，默认允许
     * focus   是否允许获取焦点，默认允许
     * enabled 是否可用，默认可用
     * @protected
     *
     * @param {HTMLElement} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    ///__gzip_original__UI_CONTROL
    var UI_CONTROL =
        ui.Control = function (el, params) {
            this._bCapture = params.capture !== false;
            this._bSelect = params.select !== false;
            this._bFocusable = params.focus !== false;
            this._bEnabled = params.enabled !== false;
            this._sBaseClass = this._sClass = params.base;
            this._sUID = params.uid;
            this._sType = params.type;
            this._eBase = this._eBody = el;
            this._cParent = null;

            this._sWidth = el.style.width;
            this._sHeight = el.style.height;

            this._aStatus = ['', ' '];

            $bind(el, this);
        },
        UI_CONTROL_CLASS = UI_CONTROL.prototype,

        UI_CONTROL_READY_LIST;
//{else}//
    /**
     * 控件失去焦点事件的默认处理。
     * 控件失去焦点时默认调用 $blur 方法，删除控件在 $focus 方法中添加的扩展样式 -focus。如果控件处于可操作状态(参见 isEnabled)，blur 方法触发 onblur 事件，如果事件返回值不为 false，则调用 $blur 方法。
     * @protected
     */
    UI_CONTROL_CLASS.$blur = function () {
        this.alterClass('focus', true);
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_CONTROL_CLASS.$cache = function (style, cacheSize) {
        //__gzip_original__el
        for (
            var i = 0,
                list = [
                    'borderTopWidth', 'borderLeftWidth', 'borderRightWidth', 'borderBottomWidth',
                    'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom'
                ],
                el = this._eBase,
                fixedSize = isFixedSize(),
                o;
            o = list[i++];
        ) {
            this['$cache$' + o] = toNumber(style[o]);
        }

        this.$cache$position = style.position;

        if (cacheSize !== false) {
            this._nWidth =
                el.offsetWidth ||
                    toNumber(style.width || el.style.width) + (fixedSize ? this.$getInvalidWidth() : 0);
            this._nHeight =
                el.offsetHeight ||
                    toNumber(style.height || el.style.height) + (fixedSize ? this.$getInvalidHeight() : 0);
        }
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_CONTROL_CLASS.$dispose = function () {
        this._eBase.getControl = undefined;
        this._eBase = this._eBody = null;
        this.$ready = blank;
    };

    /**
     * 控件获得焦点事件的默认处理。
     * 控件获得焦点时默认调用 $focus 方法，调用 alterClass 方法为控件添加扩展样式 -focus。如果控件处于可操作状态(参见 isEnabled)，focus 方法触发 onfocus 事件，如果事件返回值不为 false，则调用 $focus 方法。
     * @protected
     */
    UI_CONTROL_CLASS.$focus = function () {
        this.alterClass('focus');
    };

    /**
     * 获取控件的基本无效高度，即控件基本区域与控件内部区域高度的差值。
     * @public
     *
     * @return {number} 控件的无效高度
     */
    UI_CONTROL_CLASS.$getInvalidHeight = function () {
        this.cache();
        return this.$cache$borderTopWidth + this.$cache$borderBottomWidth +
            this.$cache$paddingTop + this.$cache$paddingBottom;
    };

    /**
     * 获取控件的基本无效宽度，即控件基本区域与控件内部区域宽度的差值。
     * @public
     *
     * @return {number} 控件的无效宽度
     */
    UI_CONTROL_CLASS.$getInvalidWidth = function () {
        this.cache();
        return this.$cache$borderLeftWidth + this.$cache$borderRightWidth +
            this.$cache$paddingLeft + this.$cache$paddingRight;
    };

    /**
     * 获取指定的部件。
     * $getSection 方法返回控件的一个部件对象，部件对象也是 ECUI 控件，是当前控件的组成成份，不可缺少，请不要轻易的对部件对象进行操作。
     * @protected
     *
     * @param {string} name 部件名称
     * @return {ecui.ui.Control} 部件对象
     */
    UI_CONTROL_CLASS.$getSection = function (name) {
        return this['_u' + name];
    };

    /**
     * 隐藏控件。
     * @protected
     */
    UI_CONTROL_CLASS.$hide = function () {
        if (this._sDisplay === undefined) {
            var style = this.getOuter().style;
            // 保存控件原来的 display 值，在显示时使用
            this._sDisplay = style.display;
            style.display = 'none';
            // 如果控件拥有焦点，设置成隐藏状态时需要失去焦点
            loseFocus(this);
        }
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_CONTROL_CLASS.$init = function () {
        this.alterClass('disabled', this._bEnabled);
        this.$setSize(this.getWidth(), this.getHeight());

        if (this.$ready) {
            if (getStatus() != INIT || UI_CONTROL_READY_LIST === null) {
                this.$ready();
            }
            else {
                if (!UI_CONTROL_READY_LIST) {
                    UI_CONTROL_READY_LIST = [];
                    timer(function () {
                        for (var i = 0, o; o = UI_CONTROL_READY_LIST[i++]; ) {
                            o.$ready();
                        }
                        UI_CONTROL_READY_LIST = null;
                    });
                }
                UI_CONTROL_READY_LIST.push(this);
            }
        }
    };

    /**
     * 设置控件容器内部定位化。
     * $locate 方法执行后，容器内部 DOM 节点的 position 属性设置成 absolute 时将相对基本 Element 对象定位。
     * @protected
     */
    UI_CONTROL_CLASS.$locate = function () {
        if (this.$cache$position != 'absolute') {
            this._eBase.style.position = this.$cache$position = 'relative';
        }
    };

    /**
     * 鼠标移出控件区域事件的默认处理。
     * 鼠标移出控件区域时默认调用 $mouseout 方法，删除控件在 $mouseover 方法中添加的扩展样式 -over。如果控件处于可操作状态(参见 isEnabled)，mouseout 方法触发 onmouseout 事件，如果事件返回值不为 false，则调用 $mouseout 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CONTROL_CLASS.$mouseout = function () {
        this.alterClass('over', true);
    };

    /**
     * 鼠标移入控件区域事件的默认处理。
     * 鼠标移入控件区域时默认调用 $mouseover 方法，调用 alterClass 方法为控件添加扩展样式 -over。如果控件处于可操作状态(参见 isEnabled)，mouseover 方法触发 onmouseover 事件，如果事件返回值不为 false，则调用 $mouseover 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CONTROL_CLASS.$mouseover = function () {
        this.alterClass('over');
    };

    /**
     * 控件按压状态结束或控件按压状态中鼠标移出控件区域事件的默认处理。
     * 鼠标左键按压控件结束或控件按压状态中鼠标移出控件区域时默认调用 $pressend/$pressout 方法，删除控件在 $pressstart/$pressover 方法中添加的扩展样式 -press。如果控件处于可操作状态(参见 isEnabled)，pressend/pressout 方法触发 onpressend/onpressout 事件，如果事件返回值不为 false，则调用 $pressend/$pressout 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CONTROL_CLASS.$pressend = UI_CONTROL_CLASS.$pressout = function () {
        this.alterClass('press', true);
    };

    /**
     * 控件按压状态开始或控件按压状态中鼠标移入控件区域事件的默认处理。
     * 鼠标左键按压控件开始或控件按压状态中鼠标移入控件区域时默认调用 $pressstart/$pressover 方法，调用 alterClass 方法为控件添加扩展样式 -press。如果控件处于可操作状态(参见 isEnabled)，pressstart/pressover 方法触发 onpressstart/onpressover 事件，如果事件返回值不为 false，则调用 $pressstart/$pressover 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CONTROL_CLASS.$pressover = UI_CONTROL_CLASS.$pressstart = function () {
        this.alterClass('press');
    };

    /**
     * 控件大小发生变化的默认处理。
     * @protected
     */
    UI_CONTROL_CLASS.$resize = function () {
        //__gzip_original__el
        //__gzip_original__currStyle
        var el = this._eBase,
            currStyle = el.style;

        currStyle.width = this._sWidth;
        if (ieVersion < 8 && getStatus() != PAINT) {
            // 如果此时浏览器在进行整体的刷新重绘，则不进入此分支
            var style = getStyle(el);
            if (style.width == 'auto' && style.display == 'block') {
                currStyle.width = '100%';
                currStyle.width = el.offsetWidth - (isFixedSize() ? this.$getInvalidWidth() * 2 : 0) + 'px';
            }
        }
        currStyle.height = this._sHeight;
        this.paint();
    };

    /**
     * 设置控件内层的 Element 对象。
     * ECUI 的控件逻辑上分为外层 Element 对象、基本 Element 对象与内层 Element 对象，外层对象用于控制控件自身布局，基本对象是控件生成时捆绑的 Element 对象，而内层对象用于控制控件对象的子控件与文本布局，通常情形下三者是同一个 Element 对象。
     * @protected
     *
     * @param {HTMLElement} el Element 对象
     */
    UI_CONTROL_CLASS.$setBody = function (el) {
        this._eBody = el;
    };

    /**
     * 设置控件内层 Element 对象的 innerHTML 属性。
     * @protected
     *
     * @param {string} innerHTML HTML 片断
     */
    UI_CONTROL_CLASS.$setBodyHTML = function (innerHTML) {
        this._eBody.innerHTML = innerHTML;
    };

    /**
     * 直接设置父控件。
     * 与 setParent 方法最大的不同，$setParent 方法仅设置控件对象逻辑上的父对象，不进行任何逻辑上的检查，用于某些特殊情况下的设定，如下拉框控件中的选项框子控件需要使用 $setParent 方法设置它的逻辑父控件为下拉框控件。
     * @protected
     *
     * @param {ecui.ui.Control} parent ECUI 控件对象
     */
    UI_CONTROL_CLASS.$setParent = function (parent) {
        this._cParent = parent;
    };

    /**
     * 设置控件的大小。
     * $setSize 方法设置控件实际的大小，不改变其它的如缓存等信息。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_CONTROL_CLASS.$setSize = function (width, height) {
        //__gzip_original__style
        var style = this._eBase.style,
            flgFixedSize = isFixedSize();

        if (width) {
            style.width = width - (flgFixedSize ? this.$getInvalidWidth() : 0) + 'px';
            this._nWidth = width;
        }

        if (height) {
            style.height = height - (flgFixedSize ? this.$getInvalidHeight() : 0) + 'px';
            this._nHeight = height;
        }
    };

    /**
     * 显示控件。
     * @protected
     */
    UI_CONTROL_CLASS.$show = function () {
        this.getOuter().style.display = this._sDisplay || '';
        this._sDisplay = undefined;
    };

    /**
     * 为控件增加/删除一个扩展样式。
     * @public
     *
     * @param {string} className 扩展样式的尾缀
     * @param {boolean} isRemoved 为 true 时删除样式，否则新增样式
     */
    UI_CONTROL_CLASS.alterClass = function (className, isRemoved) {
        className = '-' + className + ' ';

        (isRemoved ? removeClass : addClass)(
            this._eBase,
            this._sType + className + this._sClass + className
        );

        if (isRemoved) {
            remove(this._aStatus, className);
        }
        else {
            this._aStatus.push(className);
        }
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @public
     *
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     * @param {boolean} force 是否需要强制刷新缓存，相当于执行了 clearCache 方法，默认不强制刷新
     */
    UI_CONTROL_CLASS.cache = function (cacheSize, force) {
        if (force || !this._bCache) {
            this._bCache = true;
            this.$cache(getStyle(this._eBase), cacheSize);
        }
    };

    /**
     * 清除控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @public
     */
    UI_CONTROL_CLASS.clearCache = function () {
        this._bCache = false;
    };

    /**
     * 判断当前控件是否包含指定的控件。
     * contain 方法判断指定的控件是否逻辑上属于当前控件的内部区域，即通过反复调用控件的 getParent 方法是否能得到当前控件。
     * @public
     *
     * @param {ecui.ui.Control} control ECUI 控件
     * @return {boolean} 是否包含指定的控件
     */
    UI_CONTROL_CLASS.contain = function (control) {
        for (; control; control = control._cParent) {
            if (control == this) {
                return true;
            }
        }
        return false;
    };

    /**
     * 销毁控件。
     * dispose 方法触发 ondispose 事件，然后调用 $dispose 方法，dispose 方法在页面卸载时会被自动调用，通常不需要直接调用。
     * @public
     */
    UI_CONTROL_CLASS.dispose = function () {
        try {
            if (this.ondispose) {
                this.ondispose();
            }
        }
        catch (e) {
        }
        this.$dispose();
    };

    /**
     * 获取控件的基本 Element 对象。
     * getBase 方法返回控件生成时捆绑的 Element 对象，参见 create 方法。
     * @public
     *
     * @return {HTMLElement} Element 对象
     */
    UI_CONTROL_CLASS.getBase = function () {
        return this._eBase;
    };

    /**
     * 获取控件的基本样式。
     * getBaseClass 方法返回控件生成时捆绑的样式，参见 create 方法。与调用 getClass 方法返回当前样式的区别在于，基本样式不会改变，而当前样式允许通过 setClass 方法来设置。
     * @public
     *
     * @return {string} 控件的基本样式
     */
    UI_CONTROL_CLASS.getBaseClass = function () {
        return this._sBaseClass;
    };

    /**
     * 获取控件内层的 Element 对象。
     * getBody 方法返回用于控制子控件与文本布局的内层 Element 对象。
     * @public
     *
     * @return {HTMLElement} Element 对象
     */
    UI_CONTROL_CLASS.getBody = function () {
        return this._eBody;
    };

    /**
     * 获取控件内层可使用区域的高度。
     * getBodyHeight 方法返回能被子控件与文本填充的控件区域高度，相当于盒子模型的 content 区域的高度。
     * @public
     *
     * @return {number} 控件内层可使用区域的宽度
     */
    UI_CONTROL_CLASS.getBodyHeight = function () {
        return this.getHeight() - this.getInvalidHeight();
    };

    /**
     * 获取控件内层可使用区域的宽度。
     * getBodyWidth 方法返回能被子控件与文本填充的控件区域宽度，相当于盒子模型的 content 区域的宽度。
     * @public
     *
     * @return {number} 控件内层可使用区域的宽度
     */
    UI_CONTROL_CLASS.getBodyWidth = function () {
        return this.getWidth() - this.getInvalidWidth();
    };

    /**
     * 获取控件的当前样式。
     * getClass 方法返回控件当前使用的样式，在调用 alterClass 方法时，当前样式与默认样式会被添加样式后缀，从而实现控件状态的样式变更。与调用 getBaseClass 方法返回基本样式的区别在于，基本样式不会改变，而当前样式允许通过 setClass 方法来设置。
     * @public
     *
     * @return {string} 控件的当前样式
     */
    UI_CONTROL_CLASS.getClass = function () {
        return this._sClass;
    };

    /**
     * 获取控件区域的高度。
     * @public
     *
     * @return {number} 控件的高度
     */
    UI_CONTROL_CLASS.getHeight = function () {
        this.cache();
        return this._nHeight;
    };

    /**
     * 获取控件的完全无效高度，即控件外部区域与控件内部区域高度的差值。
     * @public
     *
     * @return {number} 控件的无效高度
     */
    UI_CONTROL_CLASS.getInvalidHeight = function () {
        return this.$getInvalidHeight();
    };

    /**
     * 获取控件的完全无效宽度，即控件外部区域与控件内部区域宽度的差值。
     * @public
     *
     * @return {number} 控件的无效宽度
     */
    UI_CONTROL_CLASS.getInvalidWidth = function () {
        return this.$getInvalidWidth();
    };

    /**
     * 获取控件外层的 Element 对象。
     * getOuter 方法返回用于控制控件自身布局的外层 Element 对象。
     * @public
     *
     * @return {HTMLElement} Element 对象
     */
    UI_CONTROL_CLASS.getOuter = function () {
        return this._eBase;
    };

    /**
     * 获取父控件。
     * @public
     *
     * @return {ecui.ui.Control} 父控件对象
     */
    UI_CONTROL_CLASS.getParent = function () {
        return this._cParent || null;
    };

    /**
     * 获取控件的默认样式。
     * 控件的默认样式也称为控件的类型样式，在调用 alterClass 方法时，默认样式与当前样式会被添加样式后缀，从而实现控件状态的样式变更。在调用 create 方法时指定，参见 getClass 与 getBaseClass 方法。
     * @public
     *
     * @return {string} 控件的默认样式
     */
    UI_CONTROL_CLASS.getType = function () {
        return this._sType;
    };

    /**
     * 获取控件的内部唯一标识符。
     * getUID 方法返回的 ID 不是标签 eui 属性中指定的 id，而是框架为每个控件生成的内部唯一标识符。
     * @public
     *
     * @return {string} 控件 ID
     */
    UI_CONTROL_CLASS.getUID = function () {
        return this._sUID;
    };

    /**
     * 获取控件区域的宽度。
     * @public
     *
     * @return {number} 控件的宽度
     */
    UI_CONTROL_CLASS.getWidth = function () {
        this.cache();
        return this._nWidth;
    };

    /**
     * 获取控件的相对X轴坐标。
     * getX 方法返回控件的外层 Element 对象的 offsetLeft 属性值。如果需要得到控件相对于整个文档的X轴坐标，请调用 getOuter 方法获得外层 Element 对象，然后调用 DOM 的相关函数计算(例如 ecui.dom.getPosition)。
     * @public
     *
     * @return {number} X轴坐标
     */
    UI_CONTROL_CLASS.getX = function () {
        var el = this.getOuter();

        return this.isShow() ? el.offsetLeft - calcLeftRevise(el) : 0;
    };

    /**
     * 获取控件的相对Y轴坐标。
     * getY 方法返回控件的外层 Element 对象的 offsetTop 属性值。如果需要得到控件相对于整个文档的X轴坐标，请调用 getOuter 方法获得外层 Element 对象，然后调用 DOM 的相关函数计算(例如 ecui.dom.getPosition)。
     * @public
     *
     * @return {number} Y轴坐标
     */
    UI_CONTROL_CLASS.getY = function () {
        var el = this.getOuter();

        return this.isShow() ? el.offsetTop - calcTopRevise(el) : 0;
    };

    /**
     * 隐藏控件。
     * 如果控件处于显示状态，调用 hide 方法会触发 onhide 事件，控件转为隐藏状态，并且控件会自动失去焦点。如果控件已经处于隐藏状态，则不执行任何操作。
     * @public
     *
     * @return {boolean} 显示状态是否改变
     */
    UI_CONTROL_CLASS.hide = function () {
        if (this.isShow()) {
            if (!(this.onhide && this.onhide() === false)) {
                this.$hide();
            }
        }
    };

    /**
     * 判断控件是否响应浏览器事件。
     * 控件不响应浏览器事件时，相应的事件由父控件进行处理。
     * @public
     *
     * @return {boolean} 控件是否响应浏览器事件
     */
    UI_CONTROL_CLASS.isCapture = function () {
        return this._bCapture;
    };

    /**
     * 判断控件是否处于可操作状态。
     * 控件是否处于可操作状态，影响控件是否处理事件，控件的可操作状态，受父控件的可操作状态影响。可以通过 setEnabled 方法改变控件的可操作状态，如果控件设置为不可操作，它所有的子控件也都不可操作。
     * @public
     *
     * @return {boolean} 控件是否可操作
     */
    UI_CONTROL_CLASS.isEnabled = function () {
        // 当控件处于可操作状态时，查询父控件是否可用
        return this._bEnabled && (!this._cParent || this._cParent.isEnabled());
    };

    /**
     * 判断控件是否允许获取焦点。
     * 控件不允许获取焦点时，被点击时不会改变当前的焦点控件，但此时控件拥有框架处理的最高优先级。
     * @public
     *
     * @return {boolean} 控件是否允许获取焦点
     */
    UI_CONTROL_CLASS.isFocusable = function () {
        return this._bFocusable;
    };

    /**
     * 判断控件是否允许选中内容。
     * @public
     *
     * @return {boolean} 控件是否允许选中内容
     */
    UI_CONTROL_CLASS.isSelectStart = function () {
        return this._bSelect;
    };

    /**
     * 判断控件是否处于显示状态。
     * @public
     *
     * @return {boolean} 控件是否显示
     */
    UI_CONTROL_CLASS.isShow = function () {
        return !!this.getOuter().offsetWidth;
    };

    /**
     * 控件刷新。
     * paint 方法将导致控件整体重绘，在通常情况下，建议控件改变的状态进行重绘，而不是调用 paint 方法。
     * @public
     */
    UI_CONTROL_CLASS.paint = function () {
        this.cache(true, true);
        this.$setSize(this.getWidth(), this.getHeight());
    };

    /**
     * 设置控件内层可使用区域的大小。
     * 可使用区域的大小，与 getWidth、getHeight、getInvalidWidth、getInvalidHeight 四个方法有关。
     * @public
     *
     * @param {number} width 宽度
     * @param {number} height 高度
     */
    UI_CONTROL_CLASS.setBodySize = function (width, height) {
        this.setSize(width && width + this.getInvalidWidth(), height && height + this.getInvalidHeight());
    };

    /**
     * 设置控件是否响应浏览器事件。
     * 控件不响应浏览器事件时，相应的事件由父控件进行处理。
     * @public
     *
     * @param {boolean} 控件是否响应浏览器事件，默认响应事件
     */
    UI_CONTROL_CLASS.setCapture = function (status) {
        this._bCapture = status !== false;
    };

    /**
     * 设置控件的当前样式。
     * setClass 方法设置控件当前使用的样式，在调用 alterClass 方法时，当前样式与默认样式会被添加样式后缀，从而实现控件状态的样式变更。控件的当前样式通过 getClass 方法获取。请注意，使用 setClass 方法不会改变控件部件的基本样式。
     * @public
     *
     * @param {string} currClass 控件的当前样式
     */
    UI_CONTROL_CLASS.setClass = function (currClass) {
        var oldClass = this._sClass,
            type = this._sType;

        currClass = currClass || this._sBaseClass;

        // 如果基本样式没有改变不需要执行
        if (currClass != oldClass) {
            this._eBase.className =
                this._aStatus.join(type) + this._aStatus.join(currClass) +
                    this._eBase.className.replace(
                        new REGEXP('^\\s+|(' + oldClass + '|' + type + ')(-[^\\s]+)?(\\s+|$)|\\s+$', 'g'),
                        ''
                    );

            this._sClass = currClass;
        }
    };

    /**
     * 设置控件的可操作状态。
     * 如果控件设置为不可操作，调用 alterClass 方法为控件添加扩展样式 -disabled，同时自动失去焦点；如果设置为可操作，移除控件的扩展样式 -disabled。setEnabled 方法只是设置控件自身的可操作状态，然后控件设置为可操作，并不代表调用 isEnabled 方法返回的值一定是 true，控件的可操作状态还受到父控件的可操作状态的影响。
     * @public
     *
     * @param {boolean} status 控件是否可操作，默认为 true
     * @return {boolean} 状态是否发生改变
     */
    UI_CONTROL_CLASS.setEnabled = function (status) {
        status = status !== false;

        // 检查与控件当前状态是否一致
        if (this._bEnabled != status) {
            this.alterClass('disabled', status);
            // 如果控件拥有焦点，设置成不可用状态时需要失去焦点
            if (!status) {
                loseFocus(this);
            }
            this._bEnabled = status;
            return true;
        }

        return false;
    };

    /**
     * 设置控件是否允许获取焦点。
     * 控件不允许获取焦点时，被点击时不会改变当前的焦点控件，但此时控件拥有框架处理的最高优先级。
     * @public
     *
     * @param {boolean} 控件是否允许获取焦点，默认允许
     */
    UI_CONTROL_CLASS.setFocusable = function (status) {
        this._bFocusable = status !== false;
    };

    /**
     * 设置当前控件的父控件。
     * setParent 方法设置父控件，参数是父控件对象时，将当前控件挂接到父控件对象的内层 Element 对象下，如果参数是父 Element 对象，将当前控件挂接到这个 Element 对象上并使用 findControl 查找父控件对象。调用 setParent 方法设置父控件，如果在设置父控件之前已经存在父控件，会触发原父控件的 onremove 事件并解除控件与原父控件的关联，新的父控件如果存在，会触发父控件的 onappend 事件，如果事件返回 false，表示父控件不允许当前控件作为它的子控件，设置失败，相当于忽略 parent 参数。
     * @public
     *
     * @param {ecui.ui.Control|HTMLElement} parent 父控件对象/父 Element 对象，忽略参数则将控件移出 DOM 树
     */
    UI_CONTROL_CLASS.setParent = function (parent) {
        var oldParent = this._cParent,
            el = this.getOuter(),
            parentEl;

        // 识别父对象类型
        if (parent) {
            if (parent instanceof UI_CONTROL) {
                parentEl = parent._eBody;
            }
            else {
                parentEl = parent;
                parent = findControl(parent);
            }
        }

        // 触发原来父控件的移除子控件事件
        if (parent != oldParent || parentEl != getParent(el)) {
            if (oldParent) {
                if (oldParent.onremove) {
                    oldParent.onremove(this);
                }
                oldParent.$remove(this);
            }
            if (parent) {
                if (parent.onappend && parent.onappend(this) === false || parent.$append(this) === false) {
                    parent = parentEl = null;
                }
            }

            if (parentEl) {
                parentEl.appendChild(el);
            }
            else {
                removeDom(el);
            }
            this.$setParent(parent);
            this.clearCache();
        }
    };

    /**
     * 设置控件的坐标。
     * setPosition 方法设置的是控件的 left 与 top 样式，受到 position 样式的影响。
     * @public
     *
     * @param {number} x 控件的X轴坐标
     * @param {number} y 控件的Y轴坐标
     */
    UI_CONTROL_CLASS.setPosition = function (x, y) {
        var style = this.getOuter().style;
        style.left = x + 'px';
        style.top = y + 'px';
    };

    /**
     * 设置控件的大小。
     * @public
     *
     * @param {number} width 控件的宽度
     * @param {number} height 控件的高度
     */
    UI_CONTROL_CLASS.setSize = function (width, height) {
        //__gzip_original__style
        var style = this._eBase.style;

        this.$setSize(width, height);
        if (width) {
            this._sWidth = style.width;
        }
        if (height) {
            this._sHeight = style.height;
        }
    };

    /**
     * 显示控件。
     * 如果控件处于隐藏状态，调用 show 方法会触发 onshow 事件，控件转为显示状态。如果控件已经处于显示状态，则不执行任何操作。
     * @public
     */
    UI_CONTROL_CLASS.show = function () {
        if (!this.isShow()) {
            if (!(this.onshow && this.onshow() === false)) {
                this.$show();
            }
        }
    };

    (function () {
        function build(name, enabled) {
            UI_CONTROL_CLASS[name] = function (event) {
                if (enabled || this.isEnabled()) {
                    if (this['on' + name] && this['on' + name](event) === false || 
                            this['$' + name](event) === false) {
                        return false;
                    }
                }
            };

            UI_CONTROL_CLASS['$' + name] = UI_CONTROL_CLASS['$' + name] || blank;
        }

        // 初始化事件处理函数，以事件名命名，这些函数行为均是判断控件是否可操作/是否需要调用事件/是否需要执行缺省的事件处理，对应的缺省事件处理函数名以$开头后接事件名，处理函数以及缺省事件处理函数参数均为事件对象，仅执行一次。
        for (var i = 0, o; o = eventNames[i++]; ) {
            build(o, i > 17 || i == 10);
        }

        // 初始化空操作的一些缺省处理
        UI_CONTROL_CLASS.$intercept = UI_CONTROL_CLASS.$append = UI_CONTROL_CLASS.$remove =
            UI_CONTROL_CLASS.$selectstart = UI_CONTROL_CLASS.$select = UI_CONTROL_CLASS.$selectend =
            UI_CONTROL_CLASS.$zoomstart = UI_CONTROL_CLASS.$zoom = UI_CONTROL_CLASS.$zoomend =
            UI_CONTROL_CLASS.$dragstart = UI_CONTROL_CLASS.$dragmove = UI_CONTROL_CLASS.$dragend = blank;
    })();
//{/if}//
//{if 0}//
})();
//{/if}//