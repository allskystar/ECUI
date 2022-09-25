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
_nMin       最小值
_nMax       最大值
_sLastValue 最后一次的合法输入
_oTest      匹配合法性的正则表达式
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 数字输入框控件。
     * options 属性：
     * decimal  小数位数，为正数会自动补齐，为负数有限制但是不自动补齐，为undefined表示不限制
     * min 最小值
     * max 最大值
     * @control
     */
    ui.Number = core.inherits(
        ui.Text,
        'ui-number',
        function (el, options) {
            ui.Text.call(this, el, options);
            this._nDecimal = options.decimal && +options.decimal;

            this._nMin = options.min === undefined ? undefined : (+options.min || 0);
            this._nMax = options.max === undefined ? undefined : (+options.max || 0);
            this._oTest = new RegExp('^-?\\d*' + (this._nDecimal === 0 ? '' : '(\\.\\d' + (this._nDecimal ? '{0,' + Math.abs(this._nDecimal) + '}' : '*') + ')?') + '$');
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
                if (this._oTest && this._oTest.test(value)) {
                    if (!value || ((this._nMin === undefined || (this._nMin < 0 && (value === '-')) || +value >= this._nMin) && (this._nMax === undefined || (this._nMax < 0 && value === '-') || +value <= this._nMax))) {
                        this._sLastValue = value;
                        return;
                    }
                }
                this.setValue(this._sLastValue || '');
            },

            /**
             * @override
             */
            $ready: function () {
                ui.Text.prototype.$ready.call(this);
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
//{if 0}//
})();
//{/if}//
