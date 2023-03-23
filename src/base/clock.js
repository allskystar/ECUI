/*
@example
<div ui="type:clock;id:demo"></div>

@fields
_sFormat        - 显示格式
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 时钟控件。
     * options 属性：
     * format      显示格式，{0}表示时，{1}表示分，{2}表示秒
     * @control
     */
    ui.Clock = core.inherits(
        ui.Control,
        'ui-clock',
        function (el, options) {
            _super(el, options);
            this._sFormat = options.format || this.FORMAT;
        },
        {
            FORMAT: 'HH:mm:ss',

            /**
             * @override
             */
            $dispose: function () {
                this.stop();
                _super.$dispose();
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
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
//{if 0}//
})();
//{/if}//
