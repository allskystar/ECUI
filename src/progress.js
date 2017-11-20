/*
Progress - 定义进度显示的基本操作，不建议直接初始化。
进度控件，继承自基础控件，面向用户显示一个任务执行的程度。

进度控件直接HTML初始化的例子:
<div ui="type:progress;max:100;value:0"></div>

属性
_nValue  - 进度值
_nMax    - 进度最大值
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化进度控件。
     * options 对象支持的属性如下：
     * max 最大值
     * value 当前值
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Progress = core.inherits(
        ui.Control,
        'ui-progress',
        function (el, options) {
            ui.Control.call(this, el, options);

            el.innerHTML = '<div class="' + options.classes.join('-text ') + '"></div><div class="' + options.classes.join('-mask ') + '"></div>';
            this._eText = el.firstChild;
            this._eMask = el.lastChild;

            this._sFormat = options.format;
            this._nMax = options.max || 100;
            this._nValue = options.value || 0;
        },
        {
            /**
             * 进度变化的默认处理。
             * @protected
             */
            $progress: util.blank,

            /**
             * 获取进度的最大值。
             * @public
             *
             * @return {number} 进度的最大值
             */
            getMax: function () {
                return this._nMax;
            },

            /**
             * 获取进度的当前值。
             * @public
             *
             * @return {number} 进度的当前值
             */
            getValue: function () {
                return this._nValue;
            },

            /**
             * @override
             */
            init: function (options) {
                ui.Control.prototype.init.call(this, options);
                core.triggerEvent(this, 'progress');
            },

            /**
             * 设置进度的最大值。
             * @public
             *
             * @param {number} max 进度的最大值
             */
            setMax: function (max) {
                max = Math.max(1, max);
                if (this._nMax !== max) {
                    this._nMax = max;
                    this._nValue = Math.min(this._nValue, this._nMax);
                    core.triggerEvent(this, 'progress');
                }
            },

            /**
             * 设置进度的当前值。
             * @public
             *
             * @param {number} value 进度的当前值
             */
            setValue: function (value) {
                value = Math.max(Math.min(this._nMax, value), 0);
                if (this._nValue !== value) {
                    this._nValue = value;
                    core.triggerEvent(this, 'progress');
                }
            }
        }
    );
//{if 0}//
}());
//{/if}//
