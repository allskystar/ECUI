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
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
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
                this.setValue(ui.Select.prototype.getValue.call(this));
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
            },

            /**
             * @override
             */
            setValue: function (value) {
                var selected;

                this.preventAlterItems();
                this.getItems().forEach(function (item) {
                    var text = item.getContent();
                    if (text.indexOf(value) < 0) {
                        item.hide();
                    } else {
                        if (text === value) {
                            selected = item;
                        }
                        item.show();
                    }
                });
                this.premitAlterItems();
                this.alterItems();

                this.setSelected(selected);

                this.alterStatus(value ? '-placeholder' : '+placeholder');
                this.$setValue(value);
            }
        }
    );
//{if 0}//
}());
//{/if}//
