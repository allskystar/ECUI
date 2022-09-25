/*
@example
<div ui="type:clock;id:demo"></div>

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
            this._sFormat = options.format || this.FORMAT;
            ui.Control.call(this, el, options);
        },
        {
            FORMAT: 'HH:mm:ss',

            /**
             * @override
             */
            $dispose: function () {
                this.stop();
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            init: function () {
                ui.Control.prototype.init.call(this);
                this.start();
            },

            /**
             * 定时器开始。
             * @public
             */
            start: function () {
                this.stop();

                this.stop = util.timer(
                    function () {
                        this.setContent(util.formatDate(new Date(), this._sFormat));
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
})();
