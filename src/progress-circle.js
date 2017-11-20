/*
ProgressCircle - 使用进度圆定义进度。
进度圆控件，继承自进度控件，使用进度圆显示一个任务执行的程度。

进度圆控件直接HTML初始化的例子:
<div ui="type:progress-circle;max:100;value:0"></div>

属性
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 初始化进度条控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.ProgressCircle = core.inherits(
        ui.Progress,
        'ui-progress-circle',
        function (el, options) {
            ui.Progress.call(this, el, options);

            el.innerHTML = '<svg><path fill="#000"></path></svg>';
            this._ePath = el.lastChild.lastChild;
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                this._ePath = null;
                ui.Progress.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Progress.prototype.$initStructure.call(this, width, height);
                var el = dom.getParent(this._ePath);
                el.style.width = width + 'px';
                el.style.height = height + 'px';
            },

            /**
             * @override
             */
            $progress: function () {
                var x = this.getWidth() / 2,
                    y = this.getHeight() / 2,
                    radius = x + y,
                    value = this.getValue(),
                    max = this.getMax(),
                    radian = value * Math.PI * 2 / max,
                    x2 = Math.round(Math.sin(radian) * radius),
                    y2 = Math.round(Math.cos(radian) * radius);

                if (value < max && !x2 && y2 > 0) {
                    this._ePath.setAttribute('d', 'M 0 0 V ' + (radius * 2) + ' H ' + (radius * 2) + ' V 0');
                } else {
                    this._ePath.setAttribute('d', 'M ' + x + ' ' + y + ' V ' + (y - radius) + ' A ' + radius + ' ' + radius + ' 0 ' + (x2 > 0 ? '1 0 ' : '0 0 ') + (x + x2) + ' ' + (y - y2));
                }
            }
        }
    );
//{if 0}//
}());
//{/if}//
