/*
@example
<div ui="type:count-down"></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    function formatTime(time) {
        var hours = Math.floor(time / 3600),
            minutes = Math.floor((time % 3600) / 60),
            second = time % 60;

        second = this._bMillisecond ? Math.floor(second * 1000) / 1000 : Math.floor(second);

        return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (second < 10 ? '0' + second : second);
    }

    ui.CountDown = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._nTime = +options.time;
            this._bMillisecond = !!options.millisecond;
            this._bImmediate = !!options.immediate;
            this.setContent(formatTime(this._nTime));
        },
        {
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                if (this._bImmediate) {
                    this.start();
                }
            },

            clear: function () {
                this.stop();
                this.setContent(formatTime(this._nTime));
            },

            setTime: function (time) {
                this._nTime = time;
            },

            start: function (isContinue) {
                if (this._oTimer) {
                    this._oTimer();
                }
                var lastTime = Date.now();
                if (!isContinue) {
                    this._nDown = this._nTime;
                }
                this._oTimer = util.timer(function () {
                    var time = Date.now();
                    this._nDown = Math.max(0, this._nDown + (lastTime - time) / 1000);
                    lastTime = time;
                    this.setContent(formatTime(this._nDown));
                    if (time <= 0) {
                        this._oTimer();
                    }
                }, -100, this);
            },

            stop: function () {
                this._oTimer();
            }
        }
    );
}());
