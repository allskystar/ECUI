/*
@example
<div ui="type:timer;time:200;immediate"></div>

@fields
_bImmediate     - 是否直接开始倒计时
_nTime          - 倒计时的基础时长，单位毫秒
_nResidual      - 倒计时的剩余时长，单位毫秒
_sFormat        - 显示格式
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    var offset = new Date().getTimezoneOffset() * 60000;

    /**
     * 格式化时间。
     * @private
     */
    function refresh(timer) {
        timer.getBody().innerHTML = util.formatDate(new Date(timer._nResidual + offset), timer._sFormat.replace('/{\$}/g', Math.floor(timer._nResidual / 1000)));
    }

    /**
     * 计时器控件。
     * options 属性：
     * time        倒计时的时长，默认单位秒，允许使用ms后缀表示毫秒
     * immediate   是否直接开始倒计时，默认为false
     * format      显示格式，日期格式，其中{$}表示全部的秒
     * @control
     */
    ui.Timer = core.inherits(
        ui.Control,
        'ui-timer',
        function (el, options) {
            _super(el, options);
            this._nTime = (options.time.endsWith('ms') ? +options.time.slice(0, -2) : +options.time * 1000) || 0;
            this._sFormat = options.format || this.FORMAT;
            this.reset();
            if (options.immediate) {
                this.start();
            }
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
             * 复位定时器。
             * @public
             */
            reset: function () {
                this.stop();
                this._nResidual = this._nTime;
                refresh(this);
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
                        refresh(this);
                        if (this._nResidual <= 0) {
                            core.dispatchEvent(this, 'finish');
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
})();
