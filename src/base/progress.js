//{if $css}//
ecui.__ControlStyle__('\
.ui-progress {\
    position: relative;\
    overflow: hidden !important;\
    padding: 0px !important;\
}\
');
//{/if}//
/*
@example
<div ui="type:progress;max:100;value:0"></div>

@fields
_nValue  - 进度值
_nMax    - 进度最大值
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 进度控件。
     * options 属性：
     * max   最大值
     * value 当前值
     * @control
     */
    ui.Progress = core.inherits(
        ui.Control,
        function (el, options) {
            _super(el, options);
            this._nMax = options.max || 100;
            this._nValue = options.value || 0;
        },
        {
            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.setValue(this._nValue);
            },

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
                    core.dispatchEvent(this, 'progress');
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
                this._nValue = value;
                core.dispatchEvent(this, 'progress');
            }
        }
    );
//{if 0}//
})();
//{/if}//
