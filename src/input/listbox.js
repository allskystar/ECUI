/*
@example
<div ui="type:listbox;name:test">
    <div>选项一</div>
    <div>选项二</div>
    <div>选项三</div>
</div>

@fields
_sName  - 多选框内所有input的名称
_eInput - 选项对应的input，form提交时使用
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 多选框控件。
     * 类似<select>的复选模式，可以选择多项数据。
     * @control
     */
    ui.Listbox = core.inherits(
        ui.Control,
        'ui-listbox',
        function (el, options) {
            _super(el, options);
            this._sName = options.name || '';
        },
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                'ui-listbox-item',
                function (el, options) {
                    _super(el, options);
                    dom.insertHTML(el, 'beforeEnd', '<input type="hidden" name="' + options.parent._sName + '">');

                    this._eInput = el.lastChild;
                    el.lastChild.value = options.value === undefined ? dom.getText(el) : options.value;
                    this.setSelected(!!options.selected);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        this.setSelected(!this.isSelected());
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._eInput = null;
                        _super.$dispose();
                    },

                    /**
                     * @override
                     */
                    $setParent: function (parent) {
                        _super.$setParent(parent);

                        if (parent instanceof ui.Listbox) {
                            this._eInput.name = parent._sName;
                        }
                    },

                    /**
                     * 获取选项的值。
                     * @public
                     *
                     * @return {string} 选项的值
                     */
                    getValue: function () {
                        return this._eInput.value;
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
                        this._eInput.disabled = status === false;
                        this.alterStatus(status !== false ? '+selected' : '-selected');
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

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
                    item._eInput.name = name;
                });
                this._sName = name;
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//