/*
@example
<div ui="type:calendar;year:2009;month:11"></div>

@fields
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
     * 日历控件。
     * 提供日期的选择功能，通过改变年月改变月视图选择指定的日期。
     * options 属性：
     * year    初始的年份
     * month   初始的月份
     * @control
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
                    options.classes.join('-prev-year ') + ui.Button.CLASS + '">&lt;&lt;</div><div class="' +
                    options.classes.join('-prev-month ') + ui.Button.CLASS + '">&lt;</div><div class="' +
                    options.classes.join('-next-month ') + ui.Button.CLASS + '">&gt;</div><div class="' +
                    options.classes.join('-next-year ') + ui.Button.CLASS + '">&gt;&gt;</div></div>'
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
             * 日历前进后退部件。
             * options 属性：
             * move    前进后退月份的偏移值，需要改变一年设置为12
             * @unit
             */
            Button: core.inherits(
                ui.Button,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._nMove = options.move;
                },
                {
                    /**
                     * @override
                     */
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
                this.setTitle(this.getYear(), this.getMonth());
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eTitle = null;
                ui.MonthView.prototype.$dispose.call(this);
            },

            /**
             * 获取 title 元素。
             * @public
             *
             * @return {HTMLElement} title 元素
             */
            getTitle: function () {
                return this._eTitle;
            },

            /**
             * 设置 title。
             * @public
             *
             * @param {number} year 年
             * @param {number} month 月(1-12)
             */
            setTitle: function (year, month) {
                this._eTitle.innerHTML = util.stringFormat(this.TITLEFORMAT, year, month);
            }
        }
    );
//{if 0}//
}());
//{/if}//
