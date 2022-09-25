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
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    function setSelection(input, pos) {
        pos = Math.max(pos, 0);
        if (input.getValue().length - (input._nDecimal ? input._nDecimal + 1 : 0) - pos < 0) {
            pos = Math.min(pos, input.getValue().length);
            input.setSelection(pos - 1, pos);
        } else {
            input.setSelection(pos);
        }
    }

    /**
     * 金融数字输入框控件(带千分位符号)。
     * options 属性：
     * decimal  小数位数，默认2位小数，如果没有小数设置为0
     * @control
     */
    ui.Finance = core.inherits(
        ui.Text,
        function (el, options) {
            ui.Text.call(this, el, options);
            this._nDecimal = options.decimal ? +options.decimal : 2;
        },
        {
            /**
             * @override
             */
            $click: function (event) {
                ui.Text.prototype.$click.call(this, event);

                var start = this.getSelectionStart();
                if ((this.getValue().length - (this._nDecimal ? this._nDecimal + 1 : 0) - start + 4) % 4 === 3) {
                    start--;
                }
                setSelection(this, start);
            },

            /**
             * @override
             */
            $keydown: function (event) {
                ui.Text.prototype.$keydown.call(this, event);

                var el = this.getInput(),
                    value = el.value,
                    start = this.getSelectionStart(),
                    end = this.getSelectionEnd();

                switch (event.which) {
                case 8:
                    this.setValue(value.substring(0, start - (start !== end ? 0 : (value.length - start) % 4 === 2 ? 2 : 1)) + value.substring(end));
                    setSelection(this, el.value.length - value.length + end);
                    event.preventDefault();
                    break;
                case 37:
                    value = value.length - (this._nDecimal ? this._nDecimal + 1 : 0) - start;
                    setSelection(this, start - (value < -1 ? 0 : value % 4 === 2 ? 2 : 1));
                    event.preventDefault();
                    break;
                case 38:
                    setSelection(this, 0);
                    event.preventDefault();
                    break;
                case 39:
                    setSelection(this, end + ((value.length - (this._nDecimal ? this._nDecimal + 1 : 0) - end) % 4 ? 1 : 2));
                    event.preventDefault();
                    break;
                case 40:
                    setSelection(this, value.length);
                    event.preventDefault();
                    break;
                case 190:
                    var s = value.substring(end);
                    if (s.indexOf('.') >= 0) {
                        this.setValue(value.substring(0, start) + '.' + s.replace(/[.,]/g, '').substring(0, this._nDecimal));
                        setSelection(this, el.value.length + 1 - this._nDecimal);
                    }
                    event.preventDefault();
                    break;
                default:
                    if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
                        this.setValue(value.substring(0, start) + (event.which % 48) + value.substring(end));
                        setSelection(this, el.value.length - value.length + end + 1);
                    }
                    event.preventDefault();
                }

                if (!event.ctrlKey && !event.altKey) {
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function () {
                ui.Text.prototype.$ready.call(this);
                this.setValue(this.getValue());
            },

            /**
             * @override
             */
            getFormValue: function (useDefault) {
                return this[useDefault ? 'getDefaultValue' : 'getValue']().replace(/,/g, '');
            },

            /**
             * @override
             */
            setValue: function (value) {
                ui.Text.prototype.setValue.call(this, util.formatFinance((+value.replace(/,/g, '')).toFixed(this._nDecimal)));
            }
        }
    );
})();
