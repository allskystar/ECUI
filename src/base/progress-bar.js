//{if $css}//
ecui.__ControlStyle__('\
.ui-progress-bar {\
    position: relative;\
    .ui-progress-bar-mask {\
        position: absolute !important;\
        top: 0px !important;\
        left: 0px !important;\
        width: 100% !important;\
        height: 100% !important;\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:progress-bar;max:100;value:35"></div>

@fields
_eMask   - 完成的进度比例内容区域
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 进度条控件。
     * 使用进度条显示一个任务执行的程度。
     * @control
     */
    ui.ProgressBar = core.inherits(
        ui.Progress,
        'ui-progress-bar',
        function (el, options) {
            _super(el, options);

            this._sFormat = el.innerHTML;
            el.innerHTML = '<div class="' + this.getUnitClass(ui.ProgressBar, 'text') + '">' + this._sFormat + '</div><div class="' + this.getUnitClass(ui.ProgressBar, 'mask') + '"></div>';
            this._eText = el.firstChild;
            this._eMask = el.lastChild;
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._eText = this._eMask = null;
            },

            /**
             * @override
             */
            $progress: function () {
                var value = this.getValue() / this.getMax() * 100;
                this.setText(this._sFormat.replace(/{\d+}/g, function (match) {
                    return value.toFixed(+match.slice(1, -1));
                }));
                this._eMask.style.clip = 'rect(0px,' + Math.round(this.getValue() * this.getWidth() / this.getMax()) + 'px,' + this.getHeight() + 'px,0px)';
            },

            /**
             * 设置进度条文本。
             * @public
             *
             * @param text 进度条显示文本
             */
            setText: function (text) {
                this._eText.innerHTML = text;
                this._eMask.innerHTML = text;
            }
        }
    );
//{if 0}//
})();
//{/if}//
