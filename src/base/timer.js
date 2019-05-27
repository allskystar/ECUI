/*
@example
<div ui="type:timer;time:200;residual"></div>

@fields
time          - 倒计时的基础时长，单位毫秒
residual          - 倒计时的剩余时长，单位毫秒
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 计时器控件。
     * options 属性：
     * time        倒计时的时长，默认单位秒，允许使用ms后缀表示毫秒
     * format      显示格式，{0}表示时，{1}表示分，{2}表示秒，{3}表示毫秒
     * @control
     */
    ui.Timer = core.inherits(
        ui.Control,
        function (el, options) {
            _super(el, options);
            this.reset();

            if (options.immediate) {
                this.start();
            }
        },
        {
            DEFAULT_OPTIONS: {
                format: '{0}:{1}:{2}',
                time: function (value) {
                    return (value.endsWith('ms') ? +value.slice(0, -2) : +value * 1000) || 0;
                }
            },

            private: {
                residual: undefined,

                /**
                 * 格式化时间。
                 * @private
                 */
                _refresh: function () {
                    var hours = Math.floor(this.residual / 3600000),
                        minutes = Math.floor((this.residual % 3600000) / 60000),
                        second = Math.floor((this.residual % 60000) / 1000),
                        msecond = this.residual % 1000;

                    this.getBody().innerHTML = util.stringFormat(this.format, ('0' + hours).slice(-2), ('0' + minutes).slice(-2), ('0' + second).slice(-2), ('000' + msecond).slice(-4));
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this.stop();
                _super.$dispose();
            },

            /**
             * 复位定时器。
             * @public
             */
            reset: function () {
                this.stop();
                this.residual = this.time;
                this._refresh();
            },

            /**
             * 设置定时器时间。
             * @public
             *
             * @param {number} time 定时器时间，单位毫秒
             */
            setTime: function (time) {
                this.residual = time;
            },

            /**
             * 定时器开始。
             * @public
             */
            start: function () {
                this.stop();

                var lastTime = Date.now();
                this.stop = util.timer(
                    function () {
                        var time = Date.now();
                        this.residual = Math.max(0, this.residual + lastTime - time);
                        lastTime = time;
                        this._refresh();
                        if (this.residual <= 0) {
                            this.stop();
                        }
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
