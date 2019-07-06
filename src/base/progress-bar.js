/*
@example
<div ui="type:progress-bar;max:100;value:35"></div>
*/
/*ignore*/
/*
@fields
_eMask   - 完成的进度比例内容区域
*/
/*end*/
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
            ui.Progress.call(this, el, options);

            el.innerHTML = '<div class="' + this.getUnitClass(ui.ProgressBar, 'mask') + '"></div>';
            this._eMask = el.lastChild;
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                this._eMask = null;
                ui.Progress.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $progress: function () {
                this._eMask.style.clip = 'rect(0px,' + Math.round(this.getValue() * this.getWidth() / this.getMax()) + 'px,' + this.getHeight() + 'px,0px)';
            }
        }
    );
//{if 0}//
}());
//{/if}//
