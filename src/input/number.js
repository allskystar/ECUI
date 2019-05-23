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
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 数字输入框控件。
     * options 属性：
     * decimal  小数位数，为正数会自动补齐，为负数有限制但是不自动补齐，为undefined表示不限制
     * @control
     */
    ui.Number = core.inherits(
        ui.Text,
        'ui-number',
        function (el, options) {
            _super(el, options);
            this._nDecimal = options.decimal && +options.decimal;
            this._oTest = new RegExp('^-?\\d*' + (this._nDecimal === 0 ? '' : '(\\.\\d' + (this._nDecimal ? '{0,' + Math.abs(this._nDecimal) + '}' : '*') + ')?') + '$');
        },
        {
            DEFAULT_OPTIONS: {
                min: function (value) {
                    return value === undefined ? undefined : (+value || 0);
                },
                max: function (value) {
                    return value === undefined ? undefined : (+value || 0);
                }
            },

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
                    if (!value || ((this.min === undefined || (this.min < 0 && (value === '-' || +value >= this.min)) || +value >= 0) && (this.max === undefined || (this.max < 0 && value === '-') || +value <= this.max))) {
                        this._sLastValue = value;
                        return;
                    }
                }
                this.setValue(this._sLastValue);
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
}());
//{/if}//
