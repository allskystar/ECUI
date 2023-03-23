/*
@example
<input ui="type:finance" name="test" />
或:
<div ui="type:finance;name:test;value:1157.36">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="1157.36" />
</div>

@fields
_nDecimal   小数位数
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 金融数字输入框控件(带千分位符号)。
     * options 属性：
     * @control
     */
    ui.Finance = core.inherits(
        ui.Number,
        'ui-finance',
        function (el, options) {
            options.format = ',';
            _super(el, options);
        },
        {
            /**
             * @override
             */
            $input: function (event) {
                _super.$input(event);
                var value = this.getValue(),
                    start = this.getSelectionStart();
                this.setValue(value);
                this.setSelection(start - /^0*/.exec(value)[0].length);
            },

            /**
             * @override
             */
            getDefaultValue: function () {
                return _super.getDefaultValue().replace(/,/g, '');
            },

            /**
             * @override
             */
            getSelectionEnd: function () {
                return _super.getValue().substring(0, _super.getSelectionEnd()).replace(/,/g, '').length;
            },

            /**
             * @override
             */
            getSelectionStart: function () {
                return _super.getValue().substring(0, _super.getSelectionStart()).replace(/,/g, '').length;
            },

            /**
             * @override
             */
            getValue: function () {
                return _super.getValue().replace(/,/g, '');
            },

            /**
             * @override
             */
            setSelection: function (startPos, endPos) {
                endPos = endPos === undefined ? startPos : Math.max(startPos, endPos);

                var value = this.getValue(),
                    index = value.indexOf('.');
                if (index > 0) {
                    value = value.substring(0, index);
                }
                var minus = value.charAt(0) === '-' ? 1 : 0,
                    total = Math.max(0, Math.floor((value.length - minus - 1) / 3)),
                    offset = startPos === endPos ? 0 : 1;
                _super.setSelection(
                    Math.max(Math.min(startPos, minus), startPos + total - Math.max(0, Math.floor((value.length - Math.max(minus, startPos) - offset) / 3))),
                    Math.max(Math.min(endPos, minus), endPos + total - Math.max(0, Math.floor((value.length - Math.max(minus, endPos)) / 3)))
                );
            },

            /**
             * @override
             */
            setValue: function (value) {
                _super.setValue(util.formatFinance(value.replace(/,/g, '')));
            }
        }
    );
//{if 0}//
})();
//{/if}//
