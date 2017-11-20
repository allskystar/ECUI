/*
Combox - 定义可输入下拉框行为的基本操作。
可输入下拉框控件，继承自下拉框控件，在下拉框控件的基础上允许选项框可输入内容。

可输入下拉框控件直接HTML初始化的例子:
<select ui="type:combox" name="age">
  <option value="20">20</option>
  <option value="21" selected="selected">21</option>
  <option value="22">22</option>
</select>
或
<div ui="type:combox;name:age;value:21">
  <div ui="value:20">20</div>
  <div ui="value:21">21</div>
  <div ui="value:22">22</div>
</div>

如果需要自定义特殊的选项效果，请按下列方法初始化:
<div ui="type:combox">
    <!-- 如果ec中不指定name，也可以在input中指定 -->
    <input name="test" />
    <!-- 这里放选项内容 -->
    <div value="值">文本</div>
    ...
</div>

属性
_sInputWidth   - INPUT对象初始宽度
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化可输入下拉框控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
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
             * 初始化可输入下拉框控件的选项部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Item: core.inherits(
                ui.Select.prototype.Item,
                'ui-combox-item'
            ),

            /**
             * 控件失效，阻止输入框提交
             * @override
             */
            $disable: function () {
                ui.Select.prototype.$disable.call(this);
                this.getInput().style.display = 'none';
            },

            /**
             * 控件解除失效，需要将输入框设置为可提交
             * @override
             */
            $enable: function () {
                ui.Select.prototype.$enable.call(this);
                this.getInput().style.display = '';
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Select.prototype.$initStructure.call(this, width, height);

                var el = this.getInput();
                el.style.width = width + 'px';
                el.style.height = height + 'px';
            },

            /**
             * @override
             */
            $input: function () {
                ui.Select.prototype.$input.call(this);
                this.setValue(this.getValue());
            },

            /**
             * @override
             */
            setValue: function (value) {
                ui.Select.prototype.setValue.call(this, value);
                this.$setValue(value);
            }
        }
    );
//{if 0}//
}());
//{/if}//
