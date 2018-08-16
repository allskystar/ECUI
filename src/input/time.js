/*
@example
<input ui="type:time" name="test" />
或:
<div ui="type:time;name:test;value:00:00:00">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="00:00:00" />
</div>

@fields
_sLastValue 最后一次的合法输入
_oTest      匹配合法性的正则表达式
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    function setSelection(time, pos, fix) {
        if (pos === 2 || pos === 5) {
            pos += fix || 1;
        }
        pos = Math.max(0, Math.min(time.getValue().length - 1, pos));
        time.setSelection(pos, pos + 1);
    }

    /**
     * 数字输入框控件。
     * options 属性：
     * second   是否精确到秒，默认可以输入
     * @control
     */
    ui.Time = core.inherits(
        ui.Text,
        'ui-time',
        function (el, options) {
            ui.Text.call(this, el, options);
            this._oTest = new RegExp('^([0-1]\\d|2[0-3]):[0-5]\\d' + (options.second !== false ? ':[0-5]\\d' : '') + '$');
        },
        {
            /**
             * @override
             */
            $click: function (event) {
                ui.Text.prototype.$click.call(this, event);
                util.timer(function () {
                    setSelection(this, this.getSelectionStart());
                }.bind(this));
            },

            /**
             * @override
             */
            $input: function (event) {
                ui.Text.prototype.$input.call(this, event);

                var value = this.getValue(),
                    pos = this.getSelectionStart();
                if (this._oTest.test(value)) {
                    this._sLastValue = value;
                    setSelection(this, pos);
                } else {
                    this.setValue(this._sLastValue);
                    setSelection(this, pos - 1);
                }
            },

            /**
             * @override
             */
            $keyup: function (event) {
                ui.Text.prototype.$keyup.call(this, event);
                var fix = event.which === 37 ? -1 : 0;
                setSelection(this, this.getSelectionStart() + fix, fix);
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.Text.prototype.$ready.call(this, event);
                this._sLastValue = this.getValue();
                if (!this._sLastValue) {
                    this.setValue(event.options.second !== false ? '00:00:00' : '00:00');
                }
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
