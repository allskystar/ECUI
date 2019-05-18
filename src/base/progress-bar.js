/*
@example
<div ui="type:progress-bar;max:100;value:35"></div>

@fields
mask   - 完成的进度比例内容区域
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

            el.innerHTML = '<div class="' + this.getUnitClass(ui.ProgressBar, 'mask') + '"></div>';
            this.mask = el.lastChild;
        },
        {
            'private': {
                mask: undefined
            },

            /**
             * @override
             */
            $dispose: function () {
                this.mask = null;
                _super.$dispose();
            },

            /**
             * @override
             */
            $progress: function () {
                this.mask.style.clip = 'rect(0px,' + Math.round(this.getValue() * this.getWidth() / this.getMax()) + 'px,' + this.getHeight() + 'px,0px)';
            }
        }
    );
//{if 0}//
}());
//{/if}//
