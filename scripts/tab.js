/*
Tab - 定义分页选项卡的操作。
选项卡控件，继承自基础控件，实现了选项组接口。每一个选项卡都包含一个头部区域与内容区域，选项卡控件存在互斥性，只有唯一
的一个选项卡能被选中显卡内容区域。

直接初始化选项卡控件的例子
<div ecui="type:tab;selected:1">
    <!-- 包含内容的选项卡 -->
    <div>
        <label>标题1</label>
        <!-- 这里是内容 -->
        ...
    </div>
    <!-- 仅有标题的选项卡，以下selected定义与控件定义是一致的，可以忽略其中之一 -->
    <label ecui="selected:true">标题2</label>
</div>

属性
_bButton         - 向前向后滚动按钮是否显示
_oSelected       - 初始化时临时保存当前被选中的选项卡
_aPosition       - 选项卡位置缓存
_cSelected       - 当前选中的选项卡
_uPrev           - 向前滚动按钮
_uNext           - 向后滚动按钮

Item属性
_sContentDisplay - 内容 DOM 元素的布局属性
_eContent        - 内容 DOM 元素
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        MATH = Math,
        MAX = MATH.max,
        MIN = MATH.min,

        indexOf = array.indexOf,
        createDom = dom.create,
        moveElements = dom.moveElements,
        removeDom = dom.remove,
        first = dom.first,
        insertBefore = dom.insertBefore,
        setStyle = dom.setStyle,
        copy = util.copy,
        inherits = util.inherits,
        toNumber = util.toNumber,

        $fastCreate = core.$fastCreate,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_ITEM = ui.Item,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_ITEMS = ui.Items;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化选项卡控件。
     * params 参数支持的特定属性如下：
     * selected 选中的选项序号，默认为0
     * @protected
     *
     * @param {HTMLElement} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_TAB
    //__gzip_original__UI_TAB_BUTTON
    //__gzip_original__UI_TAB_ITEM
    var UI_TAB =
        ui.Tab = function (el, params) {
            UI_CONTROL.call(this, el, params);

            //__gzip_original__baseClass
            //__gzip_original__typeClass
            //__gzip_original__buttonParams
            var typeClass = params.type,
                baseClass = params.base,
                buttonParams = {select: false},
                o = createDom(typeClass + '-title ' + baseClass + '-title', 'position:relative;overflow:hidden');

            this._oSelected = params.selected || 0;

            // 生成选项卡头的的DOM结构
            o.innerHTML = '<div class="' + typeClass + '-title-prev ' + baseClass +
                '-title-prev" style="position:absolute;left:0px;display:none"></div><div class="' +
                typeClass + '-title-next ' + baseClass +
                '-title-next" style="position:absolute;display:none"></div><div class="' +
                baseClass + '-title-main" style="position:absolute;white-space:nowrap"></div>';

            moveElements(el, params = o.lastChild);
            el.appendChild(o);
            this.$setBody(params);

            this.$initItems();

            // 滚动按钮
            this._uNext = $fastCreate(UI_TAB_BUTTON, params = params.previousSibling, this, buttonParams);
            this._uPrev = $fastCreate(UI_TAB_BUTTON, params.previousSibling, this, buttonParams);
        },
        UI_TAB_CLASS = inherits(UI_TAB, UI_CONTROL),

        /**
         * 初始化选项卡控件的按钮部件。
         * @protected
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_TAB_BUTTON = UI_TAB.Button = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_TAB_BUTTON_CLASS = inherits(UI_TAB_BUTTON, UI_CONTROL),

        /**
         * 初始化选项卡控件的选项部件。
         * params 参数支持的特定属性如下：
         * selected 当前项是否被选中
         * @protected
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_TAB_ITEM = UI_TAB.Item = function (el, params) {
            UI_ITEM.call(this, el, params);

            //__gzip_original__parent
            var parent = params.parent;

            if (el.tagName != 'LABEL') {
                var o = first(el),
                    tmpEl;

                moveElements(el, tmpEl = createDom(params.base + '-content'), true);
                el.appendChild(o);
                this.setContent(tmpEl);
            }

            setStyle(el, 'display', 'inline-block');

            if (parent && params.selected) {
                parent._oSelected = this;
            }
        },
        UI_TAB_ITEM_CLASS = inherits(UI_TAB_ITEM, UI_ITEM);
//{else}//
    /**
     * 刷新向前向右滚动按钮的可操作状态。
     * @private
     *
     * @param {ecui.ui.Tab} control Tab 控件对象
     */
    function UI_TAB_FLUSH_BUTTON(control) {
        var left = toNumber(control.getBody().style.left);

        control._uPrev.setEnabled(left < control._uPrev.getWidth());
        control._uNext.setEnabled(
            left > control.getBodyWidth() - control.$cache$bodyWidth - control._uNext.getWidth()
        );
    }

    copy(UI_TAB_CLASS, UI_ITEMS);

    /**
     * 鼠标单击控件事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_TAB_BUTTON_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);

        //__gzip_original__pos
        var parent = this.getParent(),
            style = parent.getBody().style,
            pos = parent._aPosition,
            index = parent.$getLeftMostIndex();

        index = MIN(
            MAX(0, index + (parent._uPrev == this ? toNumber(style.left) != pos[index] ? 0 : -1 : 1)),
            pos.length - 1
        );
        style.left =
            MAX(pos[index], parent.getBodyWidth() - parent.$cache$bodyWidth - parent._uNext.getWidth()) + 'px';
        UI_TAB_FLUSH_BUTTON(parent);
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_TAB_ITEM_CLASS.$cache = function (style, cacheSize) {
        UI_ITEM_CLASS.$cache.call(this, style, cacheSize);

        this.$cache$marginLeft = toNumber(style.marginLeft);
        this.$cache$marginRight = toNumber(style.marginRight);
    };

    /**
     * 鼠标单击控件事件的默认处理。
     * 选项卡控件点击时将当前选项卡设置成为选中状态，同时取消同一个选项卡控件组的其它控件的选中状态。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_TAB_ITEM_CLASS.$click = function (event) {
        UI_ITEM_CLASS.$click.call(this, event);
        this.getParent().setSelected(this);
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_TAB_ITEM_CLASS.$dispose = function () {
        this._eContent = null;
        UI_ITEM_CLASS.$dispose.call(this);
    };

    /**
     * 直接设置父控件。
     * @protected
     *
     * @param {ecui.ui.Control} parent ECUI 控件对象
     */
    UI_TAB_ITEM_CLASS.$setParent = function (parent) {
        //__gzip_original__el
        var el = this._eContent;

        UI_ITEM_CLASS.$setParent.call(this, parent);
        if (el) {
            if (parent) {
                parent.getBase().appendChild(el);
            }
            else {
                removeDom(el);
            }
        }
    };

    /**
     * 获取选项卡对应的内容元素。
     * @public
     *
     * @return {HTMLElement} 选项卡对应的内容 DOM 元素。
     */
    UI_TAB_ITEM_CLASS.getContent = function () {
        return this._eContent;
    };

    /**
     * 设置选项卡对应的内容元素。
     * @public
     *
     * @param {HTMLElement} el 选项卡对应的内容 DOM 元素。
     */
    UI_TAB_ITEM_CLASS.setContent = function (el) {
        this._eContent = el;
        if (el) {
            this._sContentDisplay = el.style.display;
        }
    };

    /**
     * 选项控件发生变化的处理。
     * 在 选项组接口 中，选项控件发生增加/减少操作时调用此方法。
     * @protected
     */
    UI_TAB_CLASS.$alterItems = function () {
        // 第一次进入时不需要调用$setSize函数，否则将初始化两次
        if (this._aPosition) {
            this.$setSize(this.getWidth());
        }

        for (
            var i = 0,
                list = this.getItems(),
                pos = this._aPosition = [this._uPrev.getWidth()],
                lastItem = {$cache$marginRight: 0},
                o;
            o = list[i++];
            lastItem = o
        ) {
            pos[i] = pos[i - 1] - MAX(lastItem.$cache$marginRight, o.$cache$marginLeft) - o.getWidth();
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
    UI_TAB_CLASS.$cache = function (style, cacheSize) {
        UI_ITEMS.$cache.call(this, style, cacheSize);

        this._uPrev.cache(true, true);
        this._uNext.cache(true, true);

        this.$cache$bodyWidth = this.getBody().offsetWidth;
    };

    /**
     * 获得当前显示的选项卡中左边元素的索引，只在能左右滚动时有效。
     * @protected
     *
     * @return {number} 最左边元素的索引
     */
    UI_TAB_CLASS.$getLeftMostIndex = function () {
        for (var left = toNumber(this.getBody().style.left), pos = this._aPosition, i = pos.length; i--; ) {
            if (left <= pos[i]) {
                return i;
            }
        }
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_TAB_CLASS.$init = function () {
        this._uPrev.$init();
        this._uNext.$init();
        UI_ITEMS.$init.call(this);
        for (var i = 0, list = this.getItems(), o; o = list[i++];) {
            o.$setSize(o.getWidth(), o.getHeight());
        }
        this.setSelected(this._oSelected);
    };

     /**
     * 控件移除子控件事件的默认处理。
     * 选项组移除子选项时需要额外移除引用。
     * @protected
     *
     * @param {ecui.ui.Tab.Item} child 选项控件
     */
    UI_TAB_CLASS.$remove = function (child) {
        if (this._cSelected == child) {
            var list = this.getItems(),
                index = indexOf(list, child);

            // 跳到被删除项的后一项
            this.setSelected(index == list.length - 1 ? index - 1 : index + 1);
        }

        UI_ITEMS.$remove.call(this, child);
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_TAB_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);

        //__gzip_original__prev
        ///__gzip_original__next
        var prev = this._uPrev,
            next = this._uNext,
            style = this.getBody().style;

        width = this.getBodyWidth();
        if (this.$cache$bodyWidth > width) {
            width -= next.getWidth();
            next.getOuter().style.left = width + 'px';

            if (this._bButton) {
                // 缩小后变大，右边的空白自动填补
                width -= this.$cache$bodyWidth;
                if (toNumber(style.left) < width) {
                    style.left = width + 'px';
                }
            }
            else {
                prev.$show();
                next.$show();
                style.left = prev.getWidth() + 'px';
                this._bButton = true;
            }

            UI_TAB_FLUSH_BUTTON(this);
        }
        else if (this._bButton) {
            prev.$hide();
            next.$hide();
            style.left = '0px';
            this._bButton = false;
        }
    };

    /**
     * 获得当前选中的选项卡控件。
     *
     * @return {ecui.ui.Tab.Item} 选中的选项卡控件
     */
    UI_TAB_CLASS.getSelected = function () {
        return this._cSelected;
    };

    /**
     * 设置被选中的选项卡。
     * @public
     *
     * @param {number|ecui.ui.Tab.Item} 选项卡子选项的索引/选项卡子选项控件
     */
    UI_TAB_CLASS.setSelected = function (item) {
        //__gzip_original__prev
        var i = 0,
            list = this.getItems(),
            prev = this._uPrev,
            style = this.getBody().style,
            left = toNumber(style.left),
            o;

        if ('number' == typeof item) {
            item = list[item];
        }
        if (this._cSelected != item) {
            for (; o = list[i++]; ) {
                if (o._eContent) {
                    o._eContent.style.display = o == item ? o._sContentDisplay : 'none';
                }
            }

            if (this._cSelected) {
                this._cSelected.alterClass('selected', true);
            }

            if (item) {
                item.alterClass('selected');
                o = this._aPosition[indexOf(list, item)] - (prev.isShow() ? 0 : prev.getWidth());
                if (left < o) {
                    style.left = o + 'px';
                }
                else {
                    o -= item.getWidth() + prev.getWidth() + this._uNext.getWidth() - this.getBodyWidth();
                    if (left > o) {
                        style.left = o + 'px';
                    }
                }
                UI_TAB_FLUSH_BUTTON(this);
            }

            this._cSelected = item;
            this.change();
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//