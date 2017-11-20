/*
calendar - 日历控件。
日历控件，继承自日历视图控件，包含头部展示操作区域、日历展示区域。头部展示操作区域中的四个按钮包含年/月的切换功能，他们继承自button控件。

日历控件直接HTML初始化的例子:
<div ui="type:calendar;year:2009;month:11"></div>

属性
_eTitle        - 日历头部信息提示区
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化日历控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Calendar = core.inherits(
        ui.MonthView,
        'ui-calendar',
        function (el, options) {
            ui.MonthView.call(this, el, options);
            el = this.getMain();

            // 生成日历控件结构
            dom.insertHTML(
                el,
                'AFTERBEGIN',
                '<div class="' + options.classes.join('-header ') + '"><div class="' +
                    options.classes.join('-title ') + '"></div><div class="' +
                    options.classes.join('-prev-year ') + '">&lt;&lt;</div><div class="' +
                    options.classes.join('-prev-month ') + '">&lt;</div><div class="' +
                    options.classes.join('-next-month ') + '">&gt;</div><div class="' +
                    options.classes.join('-next-year ') + '">&gt;&gt;</div></div>'
            );

            // 获取el所有直属节点
            var headers = dom.children(el.firstChild);
            // 定义头部展示区
            this._eTitle = headers[0];
            core.$fastCreate(this.Button, headers[1], this, {move: -12});
            core.$fastCreate(this.Button, headers[2], this, {move: -1});
            core.$fastCreate(this.Button, headers[3], this, {move: 1});
            core.$fastCreate(this.Button, headers[4], this, {move: 12});
        },
        {
            /**
             * 控件头部展示格式。
             */
            TITLEFORMAT: '{0}年{1}月',

            /**
             * 控件的前进后退控制部件。
             * @public
             */
            Button: core.inherits(
                ui.Button,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._nMove = options.move;
                },
                {
                    $click: function (event) {
                        ui.Button.prototype.$click.call(this, event);
                        this.getParent().move(this._nMove);
                    }
                }
            ),

            /**
             * @override
             */
            $change: function (event) {
                ui.MonthView.prototype.$change.call(this, event);
                this._eTitle.innerHTML = util.stringFormat(this.TITLEFORMAT, this.getYear(), this.getMonth());
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eTitle = null;
                ui.MonthView.prototype.$dispose.call(this);
            }
        }
    );
//{if 0}//
}());
//{/if}//
