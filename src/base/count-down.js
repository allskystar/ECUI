/*
@example
<div ui="type:count-down;time:200;immediate"></div>

@fields
_bImmediate     - 是否直接开始倒计时
_nBase          - 倒计时的基础时长，单位毫秒
_nTime          - 倒计时的剩余时长，单位毫秒
_sFormat        - 显示格式
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
     * @param {ecui.ui.CountDown} countDown 计时器控件
     */
    function refresh(countDown) {
        var hours = Math.floor(countDown._nTime / 3600000),
            minutes = Math.floor((countDown._nTime % 3600000) / 60000),
            second = Math.floor((countDown._nTime % 60000) / 1000),
            msecond = countDown._nTime % 1000;

        countDown.getBody().innerHTML = util.stringFormat(countDown._sFormat, ('0' + hours).slice(-2), ('0' + minutes).slice(-2), ('0' + second).slice(-2), ('000' + msecond).slice(-4));
    }

    /**
     * 计时器控件。
     * options 属性：
     * time        倒计时的时长，默认单位秒，允许使用ms后缀表示毫秒
     * immediate   是否直接开始倒计时，默认为false
     * format      显示格式，{0}表示时，{1}表示分，{2}表示秒，{3}表示毫秒
     * @control
     */
    ui.CountDown = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._nBase = options.time.endsWith('ms') ? +options.time.slice(0, -2) : +options.time * 1000;
            this._bImmediate = !!options.immediate;
            this._sFormat = options.format || this.FORMAT;
            this.reset();
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
                this._nTime = this._nBase;
                refresh(this);
            },

            /**
             * 设置定时器时间。
             * @public
             *
             * @param {number} time 定时器时间，单位毫秒
             */
            setTime: function (time) {
                this._nTime = time;
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
                        this._nTime = Math.max(0, this._nTime + lastTime - time);
                        lastTime = time;
                        refresh(this);
                        if (this._nTime <= 0) {
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
