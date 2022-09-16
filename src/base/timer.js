/*
@example
<div ui="type:timer;time:200;immediate"></div>
*/
/*ignore*/
/*
@fields
_bImmediate     - 是否直接开始倒计时
_nTime          - 倒计时的基础时长，单位毫秒
_nResidual      - 倒计时的剩余时长，单位毫秒
_sFormat        - 显示格式
*/
/*end*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 格式化时间。
     * @private
     */
    function refresh() {
        var hours = Math.floor(this._nResidual / 3600000),
            minutes = Math.floor((this._nResidual % 3600000) / 60000),
            second = Math.floor((this._nResidual % 60000) / 1000),
            msecond = this._nResidual % 1000;

        this.getBody().innerHTML = util.formatString(this._sFormat, ('0' + hours).slice(-2), ('0' + minutes).slice(-2), ('0' + second).slice(-2), ('000' + msecond).slice(-4));
    }

    /**
     * 计时器控件。
     * options 属性：
     * time        倒计时的时长，默认单位秒，允许使用ms后缀表示毫秒
     * immediate   是否直接开始倒计时，默认为false
     * format      显示格式，{0}表示时，{1}表示分，{2}表示秒，{3}表示毫秒
     * @control
     */
    ui.Timer = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._nTime = (options.time.endsWith('ms') ? +options.time.slice(0, -2) : +options.time * 1000) || 0;
            this.reset();
            this._sFormat = options.format || '{0}:{1}:{2}';
            if (options.immediate) {
                this.start();
            }
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
             * 复位定时器。
             * @public
             */
            reset: function () {
                this.stop();
                this._nResidual = this._nTime;
                refresh.call(this);
            },

            /**
             * 设置定时器时间。
             * @public
             *
             * @param {number} time 定时器时间，单位毫秒
             */
            setTime: function (time) {
                this._nResidual = time;
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
                        this._nResidual = Math.max(0, this._nResidual + lastTime - time);
                        lastTime = time;
                        refresh.call(this);
                        if (this._nResidual <= 0) {
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
