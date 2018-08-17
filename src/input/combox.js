/*
@example
<select ui="type:combox" name="age">
    <option value="20">20</option>
    <option value="21" selected="selected">21</option>
    <option value="22">22</option>
</select>
或
<div ui="type:combox;name:age;value:21">
    <!-- 这里可以放input元素，如果没有自动生成 -->
    <div ui="value:20">20</div>
    <div ui="value:21">21</div>
    <div ui="value:22">22</div>
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    function refresh(combox) {
        var text = ui.Select.prototype.getValue.call(combox);

        combox.preventAlterItems();
        combox.getItems().forEach(function (item) {
            if (item.getContent().indexOf(text) < 0) {
                item.hide();
            } else {
                item.show();
            }
        });
        combox.premitAlterItems();
        combox.alterItems();
    }

    /**
     * 组合框控件。
     * 组合框可以在下拉选项中选择，也可以输入内容。
     * @control
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            util.setDefault(options, 'readOnly', false);
            ui.Select.call(this, el, options);
        },
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Select.prototype.Item,
                'ui-combox-item'
            ),

            /**
             * @override
             */
            $click: function (event) {
                if (!this.$getSection('Options').isShow()) {
                    ui.Select.prototype.$click.call(this, event);
                }
            },

            /**
             * @override
             */
            $disable: function () {
                ui.Select.prototype.$disable.call(this);
                this.getInput().style.display = 'none';
            },

            /**
             * @override
             */
            $enable: function () {
                ui.Select.prototype.$enable.call(this);
                this.getInput().style.display = '';
            },

            /**
             * @override
             */
            $input: function (event) {
                ui.Select.prototype.$input.call(this, event);
                this.$click(event);
                this.$selectText(ui.Select.prototype.getValue.call(this));
            },

            /**
             * 根据文本值选择选项，如果有重复文本选择最后一项
             * @public
             *
             * @param {string} text 文本
             */
            $selectText: function (text) {
                var selected;
                this.getItems().forEach(function (item) {
                    if (item.getContent() === text) {
                        selected = item;
                    }
                });
                this.setSelected(selected);
                if (!selected) {
                    this.$setValue(text);
                }
                refresh(this);
                this.alterStatus(text ? '-placeholder' : '+placeholder');
            },

            /**
             * @override
             */
            getValue: function () {
                var item = this.getSelected();
                return item ? item.getValue() : '';
            },

            /**
             * @override
             */
            setSelected: function (item) {
                ui.Select.prototype.setSelected.call(this, item);

                item = this.getSelected();
                if (item) {
                    this.$setValue(item.getContent());
                }

                refresh(this);
            }
        }
    );
}());
