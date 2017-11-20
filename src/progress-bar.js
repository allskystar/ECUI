/*
ProgressBar - 使用进度条定义进度。
进度条控件，继承自进度控件，使用进度条显示一个任务执行的程度。

进度条控件直接HTML初始化的例子:
<div ui="type:progress-bar;max:100;value:0"></div>

属性
_eMask   - 完成的进度比例内容区域
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 初始化进度条控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.ProgressBar = core.inherits(
        ui.Progress,
        'ui-progress-bar',
        function (el, options) {
            ui.Progress.call(this, el, options);

            el.innerHTML = '<div class="' + options.classes.join('-mask ') + '"></div>';
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
            $initStructure: function (width, height) {
                ui.Progress.prototype.$initStructure.call(this, width, height);
                this._eMask.style.width = width + 'px';
                this._eMask.style.height = height + 'px';
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
