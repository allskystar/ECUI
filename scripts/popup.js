/*
Popup - 定义弹出菜单项的基本操作。
弹出菜单控件，继承自基础控件，实现了选项组接口。弹出式菜单操作时不会改变当前已经激活的对象，任何点击都将导致弹出菜单消
失，弹出菜单默认向右展开子菜单，如果右部已经到达浏览器最边缘，将改为向左显示。

弹出菜单控件直接HTML初始化的例子:
<div ecui="type:popup;name:test">
    <!-- 这里放选项内容 -->
    <li>菜单项</li>
    ...
    <!-- 包含子菜单项的菜单项 -->
    <li>
        <label>菜单项</label>
        <!-- 这里放子菜单项 -->
        <li>子菜单项</li>
        ...
    </li>
    ...
</div>

属性
_nOptionSize - 弹出菜单选项的显示数量，不设置将全部显示
_cSuperior   - 上一级被激活的弹出菜单控件
_cInferior   - 下一级被激活的弹出菜单控件
_uPrev       - 向上滚动按钮
_uNext       - 向下滚动按钮

子菜单项属性
_cPopup      - 是否包含下级弹出菜单
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        DOCUMENT = document,
        MATH = Math,
        MAX = MATH.max,
        MIN = MATH.min,

        createDom = dom.create,
        first = dom.first,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        getStyle = dom.getStyle,
        moveElements = dom.moveElements,
        removeDom = dom.remove,
        blank = util.blank,
        extend = util.extend,
        getView = util.getView,
        inherits = util.inherits,
        toNumber = util.toNumber,

        $fastCreate = core.$fastCreate,
        findControl = core.findControl,
        intercept = core.intercept,
        restore = core.restore,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_ITEM = ui.Item,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_ITEMS = ui.Items;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化弹出菜单控件。
     * options 对象支持的属性如下：
     * optionSize 弹出菜单选项的显示数量，不设置将全部显示
     * @public
     *
     * @param {HTMLElement} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_POPUP
    //__gzip_original__UI_POPUP_BUTTON
    //__gzip_original__UI_POPUP_ITEM
    var UI_POPUP =
        ui.Popup = function (el, options) {
            UI_CONTROL.call(this, el, options);

            //__gzip_original__baseClass
            //__gzip_original__buttonParams
            var baseClass = options.base,
                buttonParams = {select: false, focus: false};

            removeDom(el);
            el.style.cssText += ';position:absolute;overflow:hidden';
            if (this._nOptionSize = options.optionSize) {
                var o = createDom(baseClass + '-main', 'position:absolute;top:0px;left:0px');

                moveElements(el, o);

                el.innerHTML =
                    '<div class="ec-control ' + baseClass +
                        '-prev" style="position:absolute;top:0px;left:0px"></div><div class="ec-control ' +
                        baseClass + '-next" style="position:absolute"></div>';

                this.$setBody(el.insertBefore(o, el = el.firstChild));

                this._uPrev = $fastCreate(UI_POPUP_BUTTON, el, this, buttonParams);
                this._uNext = $fastCreate(UI_POPUP_BUTTON, el.nextSibling, this, buttonParams);
            }

            // 初始化菜单项
            this.$initItems();
        },
        UI_POPUP_CLASS = inherits(UI_POPUP, UI_CONTROL),

        /**
         * 初始化弹出菜单控件的按钮部件。
         * @public
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} options 初始化选项
         */
        UI_POPUP_BUTTON = UI_POPUP.Button = function (el, options) {
            UI_CONTROL.call(this, el, options);
        },
        UI_POPUP_BUTTON_CLASS = inherits(UI_POPUP_BUTTON, UI_CONTROL),

        /**
         * 初始化弹出菜单控件的选项部件。
         * @public
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} options 初始化选项
         */
        UI_POPUP_ITEM = UI_POPUP.Item = function (el, options) {
            UI_ITEM.call(this, el, options);

            var o = first(el),
                tmpEl;

            if (o && o.tagName == 'LABEL') {
                moveElements(el, tmpEl = createDom('ec-popup ' + options.parent.getBaseClass()));
                el.appendChild(o);
                this._cPopup = $fastCreate(UI_POPUP, tmpEl, this, extend({}, options));
            }

            UI_POPUP_ITEM_FLUSH(this);
        },
        UI_POPUP_ITEM_CLASS = inherits(UI_POPUP_ITEM, UI_ITEM),

        UI_POPUP_CHAIN_FIRST,
        UI_POPUP_CHAIN_LAST;
//{else}//
    /**
     * 弹出菜单选项样式刷新。
     * @private
     *
     * @param {ecui.ui.Popup.Item} item 选项控件
     */
    function UI_POPUP_ITEM_FLUSH(item) {
        if (item) {
            item.setClass(item.getBaseClass() + (item.getItems().length ? '-complex' : ''));
        }
    }

    extend(UI_POPUP_CLASS, UI_ITEMS);

    /**
     * 鼠标单击控件事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_POPUP_BUTTON_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);

        //__gzip_original__prev
        var parent = this.getParent(),
            style = parent.getBody().style,
            list = parent.getItems(),
            height = list[0].getHeight(),
            prev = parent._uPrev,
            prevHeight = prev.getHeight(),
            top = (toNumber(style.top) - prevHeight) / height;

        parent.$setActived();
        style.top =
            MIN(MAX(prev == this ? ++top : --top, parent._nOptionSize - list.length), 0) * height + prevHeight + 'px';
    };

    /**
     * 菜单项点击的默认处理
     * @protected
     *
     * @params {Event} event 事件对象
     */
    UI_POPUP_ITEM_CLASS.$click = function (event) {
        UI_ITEM_CLASS.$click.call(this, event);
        if (!this.getItems().length) {
            UI_POPUP_CHAIN_FIRST.hide();
        }
    };

    /**
     * 菜单项移出的默认处理
     * @protected
     *
     * @params {Event} event 事件对象
     */
    UI_POPUP_ITEM_CLASS.$mouseout = function (event) {
        UI_ITEM_CLASS.$mouseout.call(this, event);
        if (!this.getItems().length) {
            this.getParent().$setActived();
        }
    };

    /**
     * 菜单项移入的默认处理
     * @protected
     *
     * @params {Event} event 事件对象
     */
    UI_POPUP_ITEM_CLASS.$mouseover = function (event) {
        // 改变菜单项控件的显示状态
        UI_ITEM_CLASS.$mouseover.call(this, event);

        var o = getView(),
            childPopup = this._cPopup,
            popup = this.getParent(),
            superior = popup._cSuperior,
            inferior = popup._cInferior,
            pos = getPosition(this.getOuter()),
            x = pos.left,
            width;

        if (inferior != childPopup) {
            // 隐藏之前显示的下级弹出菜单控件
            if (inferior) {
                inferior.hide();
            }

            if (this.getItems().length) {
                childPopup.show();

                // 计算子菜单应该显示的位置，以下使用o表示left
                width = childPopup.getWidth();
                inferior = x + this.getWidth() - 4;
                x -= width - 4;

                // 优先计算延用之前的弹出顺序的应该的位置，显示新的子弹出菜单
                childPopup.setPosition(
                    inferior + width > o.right || superior && superior.getX() > popup.getX() && x > o.left ?
                        x : inferior,
                    pos.top - 4
                );
            }
        }
    };

    /**
     * 菜单项激活结束的默认处理
     * @protected
     *
     * @params {Event} event 事件对象
     */
    UI_POPUP_ITEM_CLASS.$deactivate = function (event) {
        UI_ITEM_CLASS.$deactivate.call(this, event);
        if (!this.contain(event.getTarget())) {
            UI_POPUP_CHAIN_FIRST.hide();
        }
    };

    /**
     * 添加子选项控件。
     * 弹出菜单控件与弹出菜单子选项控件都包含 add 方法，用于添加子选项控件。如果位置序号不合法，子选项控件将添加在末尾的位置。
     * @public
     *
     * @param {string|Element|ecui.ui.Item} item 选项控件的 html 内容/控件对应的 Element 对象/选项控件
     * @param {number} index 子选项控件需要添加的位置序号
     * @return {ecui.ui.Item} 子选项控件
     */
    UI_POPUP_ITEM_CLASS.add = function (item, index) {
        return (this._cPopup =
            this._cPopup || $fastCreate(UI_POPUP, createDom('ec-popup ' + this.getParent().getBaseClass()), this))
                .add(item, index);
    };

    /**
     * 获取当前菜单选项控件的所有子选项控件。
     * @public
     *
     * @return {Array} 子选项控件列表，如果不存在返回空列表
     */
    UI_POPUP_ITEM_CLASS.getItems = function () {
        return this._cPopup && this._cPopup.getItems() || [];
    };

    /**
     * 移除子选项控件。
     * @public
     *
     * @param {number|ecui.ui.Item} item 选项控件的位置序号/选项控件
     * @return {ecui.ui.Item} 被移除的子选项控件
     */
    UI_POPUP_ITEM_CLASS.remove = function (item) {
        return this._cPopup && this._cPopup.remove(item);
    };

    /**
     * 选项控件发生变化的处理。
     * 在 选项组接口 中，选项控件发生增加/减少操作时调用此方法。
     * @protected
     */
    UI_POPUP_CLASS.$alterItems = function () {
        UI_POPUP_ITEM_FLUSH(this.getParent());

        if (getParent(this.getOuter())) {
            //__gzip_original__optionSize
            var list = this.getItems(),
                len = list.length,
                height = len && list[0].getHeight(),
                optionSize = this._nOptionSize,
                prev = this._uPrev,
                next = this._uNext,
                prevHeight = 0,
                bodyWidth = this.getBodyWidth();

            this.setItemSize(bodyWidth, height);

            height *= MIN(optionSize, len);
            if (optionSize) {
                if (len > optionSize) {
                    prev.show();
                    next.show();
                    prev.$setSize(bodyWidth);
                    next.$setSize(bodyWidth);

                    // 以下使用 prev 代替向上滚动按钮的高度，使用 next 代替向下滚动按钮的高度
                    prevHeight = prev.getHeight();
                    next.setPosition(0, prevHeight + height);
                    height += prevHeight + next.getHeight();
                }
                else {
                    prev.hide();
                    next.hide();
                }
            }

            this.getBody().style.top = prevHeight + 'px';
            this.setBodySize(0, height);
        }
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_POPUP_CLASS.$cache = function (style, cacheSize) {
        UI_ITEMS.$cache.call(this, style, cacheSize);

        if (this._uPrev) {
            this._uPrev.cache(true, true);
        }
        if (this._uNext) {
            this._uNext.cache(true, true);
        }
    };

    /**
     * 隐藏控件。
     * 隐藏弹出菜单，同时隐藏所有的子弹出菜单。
     * @protected
     */
    UI_POPUP_CLASS.$hide = function () {
        UI_CONTROL_CLASS.$hide.call(this);

        if (UI_POPUP_CHAIN_LAST = this._cSuperior) {
            this._cSuperior = null;
            UI_POPUP_CHAIN_LAST._cInferior = null;
        }
        else {
            restore();
        }
    };

    /**
     * 界面点击强制拦截事件的默认处理。
     * 弹出菜单需要强制拦截浏览器的点击事件，关闭弹出菜单。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_POPUP_CLASS.$intercept = function (event) {
        if (!(findControl(event.target) instanceof UI_POPUP_ITEM)) {
            UI_POPUP_CHAIN_FIRST.hide();
        }
        return false;
    };

    /**
     * 设置激活的选项。
     * $setActived 方法改变选项组控件中当前选中项的效果，不会触发相应的移入移出事件。
     * @protected
     *
     * @param {ecui.ui.Item} item 选项控件
     */
    UI_POPUP_CLASS.$setActived = function (item) {
        UI_ITEMS.$setActived.call(this, item);
        if (!item) {
            if (this._cInferior) {
                this._cInferior.hide();
            }
        }
    };

    /**
     * 显示控件。
     * 显示弹出菜单时，必须保证弹出菜单显示在屏幕内，并且子弹出菜单展开的方向尽可能一致。
     * @protected
     */
    UI_POPUP_CLASS.$show = function () {
        UI_CONTROL_CLASS.$show.call(this);

        // 已经移入的菜单选项需要移出
        this.$setActived();

        var o = getView(),
            el = this.getOuter(),
            pos;
        
        if (!getParent(el)) {
            DOCUMENT.body.appendChild(el);
            this.$alterItems();
        }

        pos = getPosition(el);

        // 限制弹出菜单不能超出屏幕
        this.setPosition(
            MIN(MAX(pos.left, o.left), o.right - this.getWidth()),
            MIN(MAX(pos.top, o.top), o.bottom - this.getHeight())
        );

        if (UI_POPUP_CHAIN_LAST) {
            // 如果之前存在已弹出的菜单
            el.style.zIndex = toNumber(getStyle(UI_POPUP_CHAIN_LAST.getOuter(), 'zIndex')) + 1;
            this._cSuperior = UI_POPUP_CHAIN_LAST;
            UI_POPUP_CHAIN_LAST._cInferior = this;
        }
        else {
            // 第一个弹出菜单，需要屏蔽鼠标点击
            el.style.zIndex = 32768;
            intercept(UI_POPUP_CHAIN_FIRST = this);
        }

        UI_POPUP_CHAIN_LAST = this;
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @public
     *
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     * @param {boolean} force 是否需要强制刷新缓存，相当于执行了 clearCache 方法，默认不强制刷新
     */
    UI_POPUP_CLASS.cache = function (cacheSize, force) {
        if (getParent(this.getOuter())) {
            UI_CONTROL_CLASS.cache.call(this, cacheSize, force);
        }
    };

    /**
     * 销毁控件。
     * dispose 方法触发 ondispose 事件，然后调用 $dispose 方法，dispose 方法在页面卸载时会被自动调用，通常不需要直接调用。
     * @public
     */
    UI_POPUP_CLASS.dispose = function () {
        this.hide();
        UI_ITEMS.dispose.call(this);
    };

    /**
     * 获取当前激活的下级弹出菜单。
     * getInferior 方法返回弹出菜单处于显示状态时，通过它打开的子弹出菜单。
     * @public
     *
     * @return {ecui.ui.Popup} 弹出菜单控件
     */
    UI_POPUP_CLASS.getInferior = function () {
        return this._cInferior;
    };

    /**
     * 获取当前激活的上级弹出菜单。
     * getSuperior 方法返回弹出菜单处于显示状态时，打开它的父弹出菜单。
     * @public
     *
     * @return {ecui.ui.Popup} 弹出菜单控件
     */
    UI_POPUP_CLASS.getSuperior = function () {
        return this._cSuperior;
    };

    /**
     * 控件刷新。
     * repaint 方法将导致控件整体重绘，在通常情况下，建议控件改变的状态进行重绘，而不是调用 repaint 方法。
     * @public
     */
    UI_POPUP_CLASS.repaint = function () {
        if (getParent(this.getOuter())) {
            UI_CONTROL_CLASS.repaint.call(this);
        }
    };

    /**
     * 设置当前控件的父控件。
     * 弹出菜单控件只能挂在 document.body 上，因此 setParent 方法无效。
     * @public
     *
     * @param {boolean} parent 设置/取消父控件对象，默认值为 false
     */
    UI_POPUP_CLASS.setParent = blank;
//{/if}//
//{if 0}//
})();
//{/if}//