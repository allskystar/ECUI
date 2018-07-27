/*
@example
<input ui="type:number" name="test" />
或:
<div ui="type:number;decimal:2;name:test;value:test">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="test" />
</div>

@fields
_nDecimal   小数位数
_sLastValue 最后一次的合法输入
_oTest      匹配合法性的正则表达式
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 数字输入框控件。
     * options 属性：
     * decimal  小数位数，会自动补齐，如果为负数或者不设置表示不限制
     * @control
     */
    ui.Number = core.inherits(
        ui.Text,
        'ui-number',
        function (el, options) {
            ui.Text.call(this, el, options);
            this._nDecimal = options.decimal === undefined ? -1 : +options.decimal;
            this._oTest = new RegExp('^-?\\d*' + (!this._nDecimal ? '' : '(\\.\\d' + (this._nDecimal > 0 ? '{0,' + options.decimal + '}' : '*') + ')?') + '$');
        },
        {
            /**
             * @override
             */
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                if (this._nDecimal > 0) {
                    if (this._sLastValue === '-' || this._sLastValue === '-.' || !this._sLastValue.length) {
                        this._sLastValue = '0';
                    }

                    var index = this._sLastValue.indexOf('.');
                    if (!index) {
                        this._sLastValue = '0' + this._sLastValue;
                        index++;
                    } else if (index < 0) {
                        index = this._sLastValue.length;
                        this._sLastValue += '.';
                    } else if (index === 1 && this._sLastValue.charAt(0) === '-') {
                        this._sLastValue = '-0' + this._sLastValue.slice(1);
                    }

                    for (index = this._sLastValue.length - index; index <= this._nDecimal; index++) {
                        this._sLastValue += '0';
                    }
                    this.setValue(this._sLastValue);
                }
            },

            /**
             * @override
             */
            $input: function (event) {
                ui.Text.prototype.$input.call(this, event);

                var value = this.getValue();
                if (this._oTest.test(value)) {
                    var min = this.$getMinValue(),
                        max = this.$getMaxValue();

                    if (!value || ((min === undefined || +value >= min) && (max === undefined || +value <= max))) {
                        this._sLastValue = value;
                        return;
                    }
                }
                this.setValue(this._sLastValue);
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.Text.prototype.$ready.call(this, event);
                this._sLastValue = this.getValue();
            },

            /**
             * @override
             */
            $setValue: function (value) {
                ui.Text.prototype.$setValue.call(this, value);
                this._sLastValue = value;
            }
        }
    );
}());
