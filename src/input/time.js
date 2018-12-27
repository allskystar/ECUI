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
            this._oTest = new RegExp('^[0-2]\\d:[0-5]\\d' + (options.second !== false ? ':[0-5]\\d' : '') + '$');
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
            $keydown: function (event) {
                ui.Text.prototype.$keydown.call(this, event);

                switch (event.which) {
                case 8:
                    var value = this.getValue(),
                        pos = this.getSelectionStart();

                    this.setValue(value.slice(0, pos) + '0' + value.slice(this.getSelectionEnd()));
                    setSelection(this, pos - 1, -1);
                    event.preventDefault();
                    break;
                case 37:
                    setSelection(this, this.getSelectionStart() - 1, -1);
                    event.preventDefault();
                    break;
                case 38:
                    setSelection(this, 0);
                    event.preventDefault();
                    break;
                case 39:
                    setSelection(this, this.getSelectionStart() + 1);
                    event.preventDefault();
                    break;
                case 40:
                    setSelection(this, 8);
                    event.preventDefault();
                    break;
                default:
                    if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
                        value = this.getValue();
                        pos = this.getSelectionEnd();

                        value = value.slice(0, this.getSelectionStart()) + (event.which % 48) + value.slice(pos);
                        if (this._oTest.test(value)) {
                            if (+value.slice(0, 2) > 23) {
                                value = '23' + value.slice(2);
                            }
                            this.setValue(value);
                            setSelection(this, pos);
                        }
                        event.preventDefault();
                    }
                }

                var natived = event.getNative();
                if (!natived.metaKey && !natived.ctrlKey && !natived.altKey) {
                    event.preventDefault();
                }
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
