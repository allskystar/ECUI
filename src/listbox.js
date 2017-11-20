/*
Listbox - 定义了多项选择的基本操作。
多选框控件，继承自截面控件，实现了选项组接口，多个交换框，可以将选中的选项在互相之间移动。多选框控件也可以单独的使用，选中的选项在表单提交时将被提交。

多选框控件直接HTML初始化的例子:
<div ui="type:listbox;name:test">
    <!-- 这里放选项内容 -->
    <div>选项</div>
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
        ui = core.ui;
//{/if}//
    /**
     * 初始化多选框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Listbox = core.inherits(
        ui.Control,
        'ui-listbox',
        function (el, options) {
            ui.Control.call(this, el, options);

            this._sName = options.name || '';
            this.$initItems();
        },
        {
            /**
             * 初始化多选框控件的选项部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Item: core.inherits(
                ui.Item,
                'ui-listbox-item',
                function (el, options) {
                    ui.Item.call(this, el, options);
                    el.appendChild(this._eInput = dom.setInput(null, options.parent._sName, 'hidden')).value = options.value === undefined ? dom.getText(el) : options.value;
                    this.setSelected(!!options.selected);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Item.prototype.$click.call(this, event);
                        this.setSelected(!this.isSelected());
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._eInput = null;
                        ui.Item.prototype.$dispose.call(this);
                    },

                    /**
                     * @override
                     */
                    $setParent: function (parent) {
                        ui.Item.prototype.$setParent.call(this, parent);

                        if (parent instanceof ui.Listbox) {
                            this._eInput = dom.setInput(this._eInput, parent._sName);
                        }
                    },

                    /**
                     * 判断多选框的选项控件是否被选中。
                     * @public
                     *
                     * @return {boolean} 选项是否被选中
                     */
                    isSelected: function () {
                        return !this._eInput.disabled;
                    },

                    /**
                     * 设置选中状态。
                     * @public
                     *
                     * @param {boolean} status 是否选中，默认为选中
                     */
                    setSelected: function (status) {
                        this.alterClass('selected', this._eInput.disabled = status === false);
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: function () {
                var items = this.getItems(),
                    step = items.length && items[0].getHeight();

                if (step) {
                    this.setItemSize(this.getBodyWidth() - (items.length * step > this.getBodyHeight() ? core.getScrollNarrow() : 0), step);
                }
            },

            /**
             * 获取控件的表单项名称。
             * 多选框控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
             * @public
             *
             * @return {string} 表单项名称
             */
            getName: function () {
                return this._sName;
            },

            /**
             * 获取所有选中的选项。
             * @public
             *
             * @return {Array} 选项数组
             */
            getSelected: function () {
                var result = [];
                this.getItems().forEach(function (item) {
                    if (item.isSelected()) {
                        result.push(item);
                    }
                });
                return result;
            },

            /**
             * 选中所有的选项。
             * 某些场景下，需要多选框控件的内容都可以被提交，可以在表单的 onsubmit 事件中调用 selectAll 方法全部选择。
             * @public
             */
            selectAll: function () {
                this.getItems().forEach(function (item) {
                    item.setSelected();
                });
            },

            /**
             * 设置控件的表单项名称。
             * 多选框控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
             * @public
             *
             * @param {string} name 提交用的名称
             */
            setName: function (name) {
                this.getItems().forEach(function (item) {
                    // 需要将下属所有的输入框名称全部改变
                    item._eInput = dom.setInput(item._eInput, name);
                });
                this._sName = name;
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//