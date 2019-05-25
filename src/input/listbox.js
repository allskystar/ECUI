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
        ui.InputControl,
        'ui-listbox',
        function (el, options) {
            _super(el, options);
            this.getInput().disabled = true;
        },
        {
            SUPER_OPTIONS: {
                inputType: 'hidden'
            },

            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                'ui-listbox-item',
                {
                    DEFAULT_OPTIONS: {
                        value: '',
                        selected: Boolean(false)
                    },

                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        this.setSelected(!this.isSelected());
                    },

                    /**
                     * 获取选项的值。
                     * @public
                     *
                     * @return {string} 选项的值
                     */
                    getValue: function () {
                        return this.value;
                    },

                    /**
                     * 判断多选框的选项控件是否被选中。
                     * @public
                     *
                     * @return {boolean} 选项是否被选中
                     */
                    isSelected: function () {
                        return this.selected;
                    },

                    /**
                     * 设置选中状态。
                     * @public
                     *
                     * @param {boolean} status 是否选中，默认为选中
                     */
                    setSelected: function (status) {
                        this.selected = status;
                        this.alterStatus(status ? '+selected' : '-selected');
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * @override
             */
            $submit: function (event) {
                _super.$submit(event);

                var name = this.getName(),
                    input = this.getInput(),
                    list = [];

                this.getItems().forEach(function (item) {
                    if (item.isSelected()) {
                        list.push(dom.insertBefore(
                            dom.create(
                                'INPUT',
                                {
                                    name: name,
                                    value: item.getValue()
                                }
                            ),
                            input
                        ));
                    }
                });

                util.timer(function () {
                    list.forEach(function (el) {
                        dom.remove(el);
                    });
                });
            },

            /**
             * @override
             */
            getValue: function () {
                return this.getItems().filter(function (item) {
                    return item.isSelected();
                });
            },

            /**
             * 选中所有的选项。
             * 某些场景下，需要多选框控件的内容都可以被提交，可以在表单的 onsubmit 事件中调用 selectAll 方法全部选择。
             * @public
             *
             * @param {boolean} status 全部选择的状态，true是选中，false是取消
             */
            selectAll: function (status) {
                this.getItems().forEach(function (item) {
                    item.setSelected(status);
                });
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//