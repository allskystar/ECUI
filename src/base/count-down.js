/*
@example
<div ui="type:count-down;time:200"></div>

@fields
_bMillisecond   - 是否精确到毫秒，默认精确到秒
_bImmediate     - 是否直接开始倒计时
_nTime          - 倒计时的时长，单位秒
_nDown          - 倒计时剩余的时长，单位秒
_oTimer         - 定时器
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 格式化时间。
     * @private
     *
     * @param {number} time 剩余的时间，单位秒
     */
    function formatTime(time) {
        var hours = Math.floor(time / 3600),
            minutes = Math.floor((time % 3600) / 60),
            second = time % 60;

        second = this._bMillisecond ? Math.floor(second * 1000) / 1000 : Math.floor(second);

        return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (second < 10 ? '0' + second : second);
    }

    /**
     * 计时器控件。
     * options 属性：
     * time        倒计时的时长
     * millisecond 倒计时是否以毫秒为单位，默认为false
     * immediate   是否直接开始倒计时，默认为false
     * @control
     */
    ui.CountDown = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._nTime = +options.time;
            this._bMillisecond = !!options.millisecond;
            this._bImmediate = !!options.immediate;
            this.getBody().innerHTML = formatTime(this._nTime);
        },
        {
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
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                if (this._bImmediate) {
                    this.start();
                }
            },

            /**
             * 复位定时器。
             * @public
             */
            reset: function () {
                this.stop();
                this.getBody().innerHTML = formatTime(this._nTime);
            },

            /**
             * 设置定时器时间。
             * @public
             *
             * @param {number} time 定时器时间
             */
            setTime: function (time) {
                this._nTime = time;
            },

            /**
             * 定时器开始。
             * @public
             *
             * @param {boolean} isContinue 是否从终止状态继续，否则重新计时
             */
            start: function (isContinue) {
                if (this._oTimer) {
                    this._oTimer();
                }
                var lastTime = Date.now();
                if (!isContinue) {
                    this._nDown = this._nTime;
                }
                this._oTimer = util.timer(
                    function () {
                        var time = Date.now();
                        this._nDown = Math.max(0, this._nDown + (lastTime - time) / 1000);
                        lastTime = time;
                        this.getBody().innerHTML = formatTime(this._nDown);
                        if (this._nDown <= 0) {
                            this._oTimer();
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
            stop: function () {
                this._oTimer();
            }
        }
    );
}());
