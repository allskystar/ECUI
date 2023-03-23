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
        ui = core.ui,
        util = core.util;
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
            this._nDecimal = options.decimal ? +options.decimal : undefined;
            if (this._nDecimal !== 0) {
                options.once = '.';
            }
            options.filter = '\\d';
            options.pattern = (this._nMin >= 0 ? '' : '-?') + '\\d*' + (this._nDecimal === 0 ? '' : '(\\.\\d' + (this._nDecimal ? '{0,' + Math.abs(this._nDecimal) + '}' : '*') + ')?');
            _super(el, options);
            this._nMin = options.min === undefined ? undefined : (+options.min || 0);
            var maxLength = this.getMaxLength();
            if (options.max !== undefined) {
                this._nMax = (+options.max || 0);
            } else if (maxLength && this._nDecimal !== undefined) {
                this._nMax = +('1E' + (this._nDecimal ? maxLength - this._nDecimal - 1 : maxLength));
                this.ERROR_MAXLENGTH = util.formatString(this.ERROR_NUMBER_LENGTH, this._nMax);
            }

            el = this.getInput();
            if (el.getAttribute('placeholder') === null) {
                el.setAttribute('placeholder', util.formatString(
                    this._nMin !== undefined && this._nMax !== undefined ? this.PLACEHOLDER_RANGE :
                        this._nMin !== undefined ? this.PLACEHOLDER_MINVALUE :
                            this._nMax !== undefined ? this.PLACEHOLDER_MAXVALUE :
                                this.PLACEHOLDER_EMPTY,
                    this._nMin, this._nMax));
            }
            el.setAttribute('placeholder', el.getAttribute('placeholder') + (this._nDecimal !== undefined ? util.formatString(this.PLACEHOLDER_DECIMAL, this._nDecimal) : ''))
        },
        {
            PLACEHOLDER_EMPTY: '请输入数字',
            PLACEHOLDER_MINVALUE: '请输入不小于{0}的数字',
            PLACEHOLDER_MAXVALUE: '请输入不大于{1}的数字',
            PLACEHOLDER_RANGE: '请输入{0}-{1}之间的数字',
            PLACEHOLDER_MAXLENGTH: '请输入{0}位以内的数字',
            PLACEHOLDER_LENGTH2: '请输入{0}位的数字',
            PLACEHOLDER_DECIMAL: '(含{0}位小数)',
            ERROR_MINVALUE: '{Name}不能小于{0}',
            ERROR_MAXVALUE: '{Name}不能大于{0}',
            ERROR_NUMBER_LENGTH: '{Name}必须小于{0}',
            ERROR_DECIMAL: '小数超过{0}位',

            /**
             * 屏蔽非数值输入。
             * @override
             */
            $keydown: function (event) {
                var value = this.getValue(),
                    start = this.getSelectionStart(),
                    end = this.getSelectionEnd();

                if (!start && !end && value.charAt(0) === '-' && ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105))) {
                    event.preventDefault();
                    return;
                }
                if (!(this._nMin >= 0) && event.which === 189 && !start && value.charAt(end) !== '-') {
                    return;
                }
                _super.$keydown(event);
            },

            /**
             * @override
             */
            $validate: function (event) {
                var result = _super.$validate(event);
                if (result === false) {
                    return result;
                }

                var value = parseFloat(this.getFormValue());
                if (!isNaN(value)) {
                    if (value < this._nMin) {
                        event.addError(util.formatString(this.ERROR_MINVALUE, this._nMin));
                        return false;
                    }
                    if (value > this._nMax) {
                        event.addError(util.formatString(this.ERROR_MAXVALUE, this._nMax));
                        return false;
                    }
                    value = this.getValue();
                    var index = value.lastIndexOf('.');
                    if (index >= 0 && value.length - index - 1 > this._nDecimal) {
                        event.addError(util.formatString(this.ERROR_DECIMAL, this._nDecimal));
                        return false;
                    }
                }
            },

            /**
             * @override
             */
            getFormValue: function (useDefault) {
                var value = _super.getFormValue(useDefault);
                if (value && this._nDecimal !== undefined) {
                    value = (+value).toFixed(this._nDecimal);
                }
                return value;
            }
        }
    );
//{if 0}//
})();
//{/if}//
