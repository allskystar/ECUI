/*
@example
<input ui="type:time" name="test" />
或:
<div ui="type:time;name:test;value:00:00:00">
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
     * 时间输入框控件。
     * options 属性：
     * second   是否精确到秒，默认可以输入
     * @control
     */
    ui.Time = core.inherits(
        ui.Text,
        'ui-time',
        function (el, options) {
            _super(el, options);
            this._oTest = new RegExp('^[0-2]\\d:[0-5]\\d' + (options.second !== false ? ':[0-5]\\d' : '') + '$');
            this._sFormat = options.second !== false ? '00:00:00' : '00:00';
        },
        {
            /**
             * @override
             */
            $click: function (event) {
                _super.$click(event);
                util.timer(
                    function () {
                        setSelection(this, this.getSelectionStart());
                    },
                    0,
                    this
                );
            },

            /**
             * @override
             */
            $keydown: function (event) {
                _super.$keydown(event);

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
                    if (event.which >= 48 && event.which <= 57) {
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

                if (!event.ctrlKey && !event.altKey) {
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                if (!this.getValue()) {
                    this.setValue(this._sFormat);
                }
            }
        }
    );
})();
