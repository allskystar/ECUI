/*
@example
<div ui="type:clock"></div>

@fields
_sFormat        - 显示格式
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 时钟控件。
     * options 属性：
     * format      显示格式，{0}表示时，{1}表示分，{2}表示秒，{3}表示毫秒
     * @control
     */
    ui.Clock = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._sFormat = options.format || this.FORMAT;
            this.start();
        },
        {
            FORMAT: '{0}:{1}:{2}',

            /**
             * @override
             */
            $dispose: function () {
                this.stop();
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 定时器开始。
             * @public
             */
            start: function () {
                this.stop();

                this.stop = util.timer(
                    function () {
                        var date = new Date();
                        this.getBody().innerHTML = util.stringFormat(this._sFormat, ('0' + date.getHours()).slice(-2), ('0' + date.getMinutes()).slice(-2), ('0' + date.getSeconds()).slice(-2), ('000' + date.getMilliseconds()).slice(-4));
                    },
                    -1,
                    this
                );
            },

            /**
             * 定时器终止。
             * @public
             */
            stop: util.blank
        }
    );
}());
