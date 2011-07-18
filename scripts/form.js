/*
Form - 定义独立于文档布局的内容区域的基本操作。
窗体控件，继承自基础控件，内部包含了三个部件，分别是标题栏(基础控件)、关闭按钮(基础控件)与内容区域(截面控件)。窗体控件
仿真浏览器的多窗体效果，如果在其中包含 iframe 标签，可以在当前页面打开一个新的页面，避免了使用 window.open 在不同浏览
器下的兼容性问题。多个窗体控件同时工作时，当前激活的窗体在最上层。窗体控件的标题栏默认可以拖拽，窗体可以设置置顶方式显
示，在置顶模式下，只有当前窗体可以响应操作。窗体控件的 z-index 从4096开始，页面开发请不要使用大于或等于4096的 z-index 
值。

窗体控件直接HTML初始化的例子:
<div ecui="type:form;hide:true">
    <!-- 标题可以没有 -->
    <label>窗体的标题</label>
    <!-- 这里放窗体的内容 -->
    ...
</div>

属性
_bFlag      - 初始是否自动隐藏/是否使用showModal激活
_bAuto      - 标题栏是否自适应宽度
_uTitle     - 标题栏
_uClose     - 关闭按钮
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        undefined,

        indexOf = array.indexOf,
        remove = array.remove,
        createDom = dom.create,
        first = dom.first,
        getStyle = dom.getStyle,
        moveElements = dom.moveElements,
        cancel = util.cancel,
        getView = util.getView,
        inherits = util.inherits,

        $fastCreate = core.$fastCreate,
        calcHeightRevise = core.calcHeightRevise,
        calcWidthRevise = core.calcWidthRevise,
        drag = core.drag,
        getFocused = core.getFocused,
        mask = core.mask,
        setFocused = core.setFocused,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = ui.Control.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化窗体控件。
     * params 参数支持的属性如下：
     * hide 初始是否自动隐藏
     * titleAuto title 是否自适应宽度，默认自适应宽度
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_FORM
    //__gzip_original__UI_FORM_TITLE
    //__gzip_original__UI_FORM_CLOSE
    var UI_FORM =
        ui.Form = function (el, params) {
            UI_CONTROL.call(this, el, params);

            // 生成标题控件与内容区域控件对应的Element对象
            //__gzip_original__baseClass
            //__gzip_original__partParams
            var baseClass = params.base,
                partParams = {select: false},
                o = createDom(baseClass + '-main', 'position:relative;overflow:auto'),
                titleEl = first(el);

            moveElements(el, o, true);

            if (titleEl && titleEl.tagName == 'LABEL') {
                el.innerHTML = '<div class="ec-control ' + baseClass + '-close" style="position:absolute"></div>';
                el.insertBefore(titleEl, el.firstChild);
                titleEl.className = 'ec-control ' + (titleEl.className || baseClass + '-title');
                titleEl.style.cssText += ';position:absolute';
            }
            else {
                el.innerHTML = '<div class="ec-control ' + baseClass +
                    '-title" style="position:absolute"></div><div class="ec-control ' +
                    baseClass + '-close" style="position:absolute"></div>';
                titleEl = el.firstChild;
            }

            el.style.overflow = 'hidden';
            el.appendChild(o);
            this.$setBody(o);

            this._bFlag = params.hide;
            this._bAuto = params.titleAuto !== false;

            // 初始化标题区域
            this._uTitle = $fastCreate(UI_FORM_TITLE, titleEl, this, partParams);

            // 初始化关闭按钮
            this._uClose = $fastCreate(UI_FORM_CLOSE, titleEl.nextSibling, this, partParams);
        },
        UI_FORM_CLASS = inherits(UI_FORM, UI_CONTROL),

        /**
         * 初始化窗体控件的标题栏部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_FORM_TITLE = UI_FORM.Title = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_FORM_TITLE_CLASS = inherits(UI_FORM_TITLE, UI_CONTROL),

        /**
         * 初始化窗体控件的关闭按钮部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_FORM_CLOSE = UI_FORM.Close = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_FORM_CLOSE_CLASS = inherits(UI_FORM_CLOSE, UI_CONTROL),

        UI_FORM_ALL = [],   // 当前显示的全部窗体
        UI_FORM_MODAL = 0;  // 当前showModal的窗体数
//{else}//
    /**
     * 刷新所有显示的窗体的zIndex属性。
     * @protected
     *
     * @param {ecui.ui.Form} form 置顶显示的窗体
     */
    function UI_FORM_FLUSH_ZINDEX(form) {
        UI_FORM_ALL.push(UI_FORM_ALL.splice(indexOf(UI_FORM_ALL, form), 1)[0]);

        // 改变当前窗体之后的全部窗体z轴位置，将当前窗体置顶
        for (var i = 0, j = UI_FORM_ALL.length - UI_FORM_MODAL, o; o = UI_FORM_ALL[i++]; ) {
            o.getOuter().style.zIndex = i > j ? 32767 + (i - j) * 2 : 4095 + i;
        }
    }

    /**
     * 标题栏激活开始事件处理，需要触发拖动，如果当前窗体未得到焦点则得到焦点。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_FORM_TITLE_CLASS.$activate = function (event) {
        UI_CONTROL_CLASS.$activate.call(this, event);
        drag(this.getParent(), event);
    };

    /**
     * 窗体关闭按钮点击事件，关闭窗体。
     * @protected
     *
     * @params {Event} event 事件对象
     */
    UI_FORM_CLOSE_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);
        this.getParent().hide();
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_FORM_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);

        style = getStyle(this.getBase().lastChild);
        this.$cache$mainWidthRevise = calcWidthRevise(style);
        this.$cache$mainHeightRevise = calcHeightRevise(style);
        this._uTitle.cache(true, true);
        this._uClose.cache(true, true);
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_FORM_CLASS.$dispose = function () {
        UI_CONTROL_CLASS.hide.call(this);

        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 控件获得焦点事件的默认处理。
     * 窗体控件获得焦点时需要将自己置于所有窗体控件的顶部。如果控件处于可操作状态(参见 isEnabled)，focus 方法触发 onfocus 事件，如果事件返回值不为 false，则调用 $focus 方法。
     * @protected
     */
    UI_FORM_CLASS.$focus = function () {
        UI_CONTROL_CLASS.$focus.call(this);

        UI_FORM_FLUSH_ZINDEX(this);
    };

    /**
     * 隐藏控件。
     * @protected
     */
    UI_FORM_CLASS.$hide = function () {
        // showModal模式下隐藏窗体需要释放遮罩层
        var i = indexOf(UI_FORM_ALL, this);
        UI_FORM_ALL.splice(i, 1);

        if (i > UI_FORM_ALL.length - UI_FORM_MODAL) {
            if (this._bFlag) {
                if (i == UI_FORM_ALL.length) {
                    mask();
                }
                else {
                    // 如果不是最后一个，将遮罩层标记后移
                    UI_FORM_ALL[i]._bFlag = true;
                }
                this._bFlag = false;
            }
            UI_FORM_MODAL--;
        }

        UI_CONTROL_CLASS.$hide.call(this);
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_FORM_CLASS.$init = function () {
        UI_CONTROL_CLASS.$init.call(this);
        this._uTitle.$init();
        this._uClose.$init();
        if (this._bFlag) {
            this._bFlag = false;
            this.$hide();
        }
        else {
            this.$show();
        }
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_FORM_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this.$locate();

        var style = this.getBase().lastChild.style;

        style.width = this.getBodyWidth() - this.$cache$mainWidthRevise + 'px';
        style.height = this.getBodyHeight() - this.$cache$mainHeightRevise + 'px';
        if (this._bAuto) {
            this._uTitle.$setSize(this.getBodyWidth());
        }
    };

    /**
     * 显示控件。
     * @protected
     */
    UI_FORM_CLASS.$show = function () {
        UI_FORM_ALL.push(this);
        UI_CONTROL_CLASS.$show.call(this);
        setFocused(this);
    };

    /**
     * 窗体居中显示。
     * @public
     */
    UI_FORM_CLASS.center = function () {
        o = this.getOuter();
        o.style.position = this.$cache$position = 'absolute';
        o = o.offsetParent;

        if (!o || o.tagName == 'BODY' || o.tagName == 'HTML') {
            var o = getView(),
                x = o.right + o.left,
                y = o.bottom + o.top;
        }
        else {
            x = o.offsetWidth;
            y = o.offsetHeight;
        }

        this.setPosition((x - this.getWidth()) / 2, (y - this.getHeight()) / 2);
    };

    /**
     * 隐藏控件。
     * 如果控件处于显示状态，调用 hide 方法会触发 onhide 事件，控件转为隐藏状态，并且控件会自动失去焦点。如果控件已经处于隐藏状态，则不执行任何操作。
     * @public
     *
     * @return {boolean} 显示状态是否改变
     */
    UI_FORM_CLASS.hide = function () {
        // showModal模式下，只有最顶层的窗体才允许关闭
        for (var i = indexOf(UI_FORM_ALL, this), o; o = UI_FORM_ALL[++i]; ) {
            if (o._bFlag) {
                return false;
            }
        }
        return UI_CONTROL_CLASS.hide.call(this);
    };

    /**
     * 设置窗体控件标题。
     * @public
     *
     * @param {string} text 窗体标题
     */
    UI_FORM_CLASS.setTitle = function (text) {
        this._uTitle.$setBodyHTML(text || '');
    };

    /**
     * 显示控件。
     * 显示窗体控件时，需要将窗体控件设置为获得焦点状态，即窗体控件或者子控件拥有焦点。
     * @public
     *
     * @return {boolean} 显示状态是否改变
     */
    UI_FORM_CLASS.show = function () {
        if (UI_FORM_MODAL && indexOf(UI_FORM_ALL, this) < UI_FORM_ALL.length - UI_FORM_MODAL) {
            // 如果已经使用showModal，对原来不是showModal的窗体进行处理
            UI_FORM_MODAL++;
        }

        var result = UI_CONTROL_CLASS.show.call(this);
        if (!result) {
            UI_FORM_FLUSH_ZINDEX(this);
        }
        return result;
    };

    /**
     * 窗体以独占方式显示
     * showModal 方法将窗体控件以独占方式显示，此时鼠标点击窗体以外的内容无效，关闭窗体后自动恢复。
     * @public
     *
     * @param {number} opacity 遮罩层透明度，默认为0.05
     */
    UI_FORM_CLASS.showModal = function (opacity) {
        if (!this._bFlag) {
            if (indexOf(UI_FORM_ALL, this) < UI_FORM_ALL.length - UI_FORM_MODAL) {
                UI_FORM_MODAL++;
            }

            mask(opacity !== undefined ? opacity : 0.05, 32766 + UI_FORM_MODAL * 2);

            this._bFlag = true;
            if (!UI_CONTROL_CLASS.show.call(this)) {
                UI_FORM_FLUSH_ZINDEX(this);
            }
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//