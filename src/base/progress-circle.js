//{if $css}//
ecui.__ControlStyle__('\
.ui-progress-circle {\
    position: relative;\
    svg {\
        position: absolute !important;\
        top: 0 !important;\
        left: 0 !important;\
        width: 100% !important;\
        height: 100% !important;\
        opacity: 0.5;\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:progress-circle;id:test" style="width:100px;height:100px"><img width="100%" height="100%" src="images/ecui/fail.png"></div>
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 进度圆控件。
     * 使用进度圆显示一个任务执行的程度。
     * @control
     */
    ui.ProgressCircle = core.inherits(
        ui.Progress,
        'ui-progress-circle',
        function (el, options) {
            _super(el, options);

            el.insertAdjacentHTML('beforeEnd', '<svg><path fill="#000"></path></svg>');
            this._ePath = el.lastChild.lastChild;
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._ePath = null;
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                _super.$initStructure(width, height);
                var el = this._ePath.parentElement;
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
})();
//{/if}//
