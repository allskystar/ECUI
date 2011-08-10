/*
Listbox - 定义了多项选择的基本操作。
多选框控件，继承自截面控件，实现了选项组接口，扩展了多选的 SelectElement 的功能，允许使用鼠标拖拽进行多项选择，多个交
换框，可以将选中的选项在互相之间移动。多选框控件也可以单独的使用，选中的选项在表单提交时将被提交。

多选框控件直接HTML初始化的例子:
<div ecui="type:listbox;name:test">
    <!-- 这里放选项内容 -->
    <li>选项</li>
    ...
</div>

属性
_sName  - 多选框内所有input的名称

选项属性
_eInput - 选项对应的input，form提交时使用
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        undefined,
        MATH = Math,
        MAX = MATH.max,
        MIN = MATH.min,
        CEIL = MATH.ceil,
        FLOOR = MATH.floor,

        getText = dom.getText,
        setInput = dom.setInput,
        extend = util.extend,
        inherits = util.inherits,

        getMouseY = core.getMouseY,

        UI_PANEL = ui.Panel,
        UI_ITEM = ui.Item,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_ITEMS = ui.Items;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化多选框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_LISTBOX
    //__gzip_original__UI_LISTBOX_ITEM
    var UI_LISTBOX =
        ui.Listbox = function (el, options) {
            options.hScroll = false;
            UI_PANEL.call(this, el, options);
            this._sName = options.name || '';

            this.$initItems();
        },
        UI_LISTBOX_CLASS = inherits(UI_LISTBOX, UI_PANEL),

        /**
         * 初始化多选框控件的选项部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_LISTBOX_ITEM = UI_LISTBOX.Item = function (el, options) {
            UI_ITEM.call(this, el, options);
            el.appendChild(this._eInput = setInput(null, options.parent._sName, 'hidden')).value =
                options.value === undefined ? getText(el) : options.value;
            this.setSelected(!!options.selected);
        },
        UI_LISTBOX_ITEM_CLASS = inherits(UI_LISTBOX_ITEM, UI_ITEM);
//{else}//
    /**
     * 计算当前鼠标移入的选项编号。
     * @private
     *
     * @param {ecui.ui.Item} control 选项控件
     */
    function UI_LISTBOX_OVERED(control) {
        var parent = control.getParent(),
            vscroll = parent.$getSection('VScroll'),
            step = vscroll.getStep(),
            o = getMouseY(parent),
            oldTop = control._nTop;

        control._nTop = o;

        if (o > parent.getHeight()) {
            if (o < oldTop) {
                // 鼠标回退不需要滚动
                o = 0;
            }
            else {
                // 超出控件范围，3像素点对应一个选项
                // 如果不滚动，需要恢复原始的移动距离
                if (o = FLOOR((o - MAX(0, oldTop)) / 3)) {
                    vscroll.skip(o);
                }
                else {
                    control._nTop = oldTop;
                }
            }
            o += control._nLast;
        }
        else if (o < 0) {
            if (o > oldTop) {
                // 鼠标回退不需要滚动
                o = 0;
            }
            else {
                // 超出控件范围，3像素点对应一个选项
                // 如果不滚动，需要恢复原始的移动距离
                if (o = CEIL((o - MIN(0, oldTop)) / 3)) {
                    vscroll.skip(o);
                }
                else {
                    control._nTop = oldTop;
                }
            }
            o += control._nLast;
        }
        else {
            o = FLOOR((parent.getScrollTop() + o) / step);
        }

        return MIN(MAX(0, o), parent.getItems().length - 1);
    }

    extend(UI_LISTBOX_CLASS, UI_ITEMS);

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_LISTBOX_ITEM_CLASS.$dispose = function () {
        this._eInput = null;
        UI_ITEM_CLASS.$dispose.call(this);
    };

    /**
     * 鼠标在滑动块激活开始事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_LISTBOX_ITEM_CLASS.$activate = function (event) {
        UI_ITEM_CLASS.$activate.call(this, event);
        core.select(this, event, 'listbox');
    };

    /**
     * 选择框选中处理事件的默认处理。
     * @protected
     */
    UI_LISTBOX_ITEM_CLASS.$select = function () {
        //__transform__index_o
        //__transform__items_list
        //__gzip_original__startIndex
        var index = UI_LISTBOX_OVERED(this),
            items = this.getParent().getItems(),
            startIndex = this._nStart,
            lastIndex = this._nLast,
            fromCancel = 0,
            toCancel = -1,
            fromSelect = 0,
            toSelect = -1;

        if (index > lastIndex) {
            if (index < startIndex) {
                // index与lastIndex都在负方向
                fromCancel = lastIndex;
                toCancel = index - 1;
            }
            else if (lastIndex < startIndex) {
                // index与lastIndex位于起始选项两边
                fromCancel = lastIndex;
                toCancel = startIndex - 1;
                fromSelect = startIndex + 1;
                toSelect = index;
            }
            else {
                // index与lastIndex都在正方向
                fromSelect = lastIndex + 1;
                toSelect = index;
            }
        }
        else if (index < lastIndex) {
            if (index > startIndex) {
                // index与lastIndex都在正方向
                fromCancel = index + 1;
                toCancel = lastIndex;
            }
            else if (lastIndex > startIndex) {
                // index与lastIndex位于起始选项两边
                fromCancel = startIndex + 1;
                toCancel = lastIndex;
                fromSelect = index;
                toSelect = startIndex - 1;
            }
            else {
                // index与lastIndex都在负方向
                fromSelect = index;
                toSelect = lastIndex - 1;
            }
        }

        this._nLast = index;

        // 恢复之前的选择状态
        for (; fromCancel <= toCancel; ) {
            index = items[fromCancel++];
            index.alterClass('selected', !index.isSelected());
        }

        // 选择框内的全部假选中
        for (; fromSelect <= toSelect; ) {
            items[fromSelect++].alterClass('selected');
        }
    };

    /**
     * 选择框选中结束事件的默认处理。
     * @protected
     */
    UI_LISTBOX_ITEM_CLASS.$selectend = function () {
        //__transform__index_o
        //__transform__items_list
        var index = UI_LISTBOX_OVERED(this),
            items = this.getParent().getItems(),
            startIndex = this._nStart,
            fromIndex = MIN(startIndex, index),
            toIndex = MAX(startIndex, index);

        if (startIndex == index) {
            // 点击的当前条目，进行反选
            this.setSelected(!this.isSelected());
        }
        else {
            // 否则选择框内的全部选中
            for (; fromIndex <= toIndex; ) {
                items[fromIndex++].setSelected();
            }
        }
    };

    /**
     * 选择框选中开始事件的默认处理。
     * @protected
     */
    UI_LISTBOX_ITEM_CLASS.$selectstart = function () {
        this._nStart = this._nLast = UI_LISTBOX_OVERED(this);
        this.alterClass('selected');
    };

    /**
     * 直接设置父控件。
     * @protected
     *
     * @param {ecui.ui.Control} parent ECUI 控件对象
     */
    UI_LISTBOX_ITEM_CLASS.$setParent = function (parent) {
        UI_ITEM_CLASS.$setParent.call(this, parent);

        if (parent instanceof UI_LISTBOX) {
            this._eInput = setInput(this._eInput, parent._sName);
        }
    };

    /**
     * 判断多选框的选项控件是否被选中。
     * @public
     *
     * @return {boolean} 选项是否被选中
     */
    UI_LISTBOX_ITEM_CLASS.isSelected = function () {
        return !this._eInput.disabled;
    };

    /**
     * 设置选中状态。
     * @public
     *
     * @param {boolean} status 是否选中，默认为选中
     */
    UI_LISTBOX_ITEM_CLASS.setSelected = function (status) {
        this.alterClass('selected', this._eInput.disabled = status === false);
    };

    /**
     * 选项控件发生变化的处理。
     * 在 ecui.ui.Items 接口中，选项控件发生增加/减少操作时调用此方法。
     * @protected
     */
    UI_LISTBOX_CLASS.$alterItems = function () {
        //__transform__items_list
        var items = this.getItems(),
            vscroll = this.$getSection('VScroll'),
            step = items.length && items[0].getHeight();

        if (step) {
            vscroll.setStep(step);
            this.setItemSize(
                this.getBodyWidth() - (items.length * step > this.getBodyHeight() ? vscroll.getWidth() : 0),
                step
            );
            this.$setSize(0, this.getHeight());
        }
    };

    /**
     * 获取控件的表单项名称。
     * 多选框控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
     * @public
     *
     * @return {string} 表单项名称
     */
    UI_LISTBOX_CLASS.getName = function () {
        return this._sName;
    };

    /**
     * 获取所有选中的选项。
     * @public
     *
     * @return {Array} 选项数组
     */
    UI_LISTBOX_CLASS.getSelected = function () {
        for (var i = 0, list = this.getItems(), o, result = []; o = list[i++]; ) {
            if (o.isSelected()) {
                result.push(o);
            }
        }
        return result;
    };

    /**
     * 选中所有的选项。
     * 某些场景下，需要多选框控件的内容都可以被提交，可以在表单的 onsubmit 事件中调用 selectAll 方法全部选择。
     * @public
     */
    UI_LISTBOX_CLASS.selectAll = function () {
        for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
            o.setSelected();
        }
    };

    /**
     * 设置控件的表单项名称。
     * 多选框控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
     * @public
     *
     * @param {string} name 提交用的名称
     */
    UI_LISTBOX_CLASS.setName = function (name) {
        for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
            // 需要将下属所有的输入框名称全部改变
            o._eInput = setInput(o._eInput, name);
        }
        this._sName = name;
    };
//{/if}//
//{if 0}//
})();
//{/if}//