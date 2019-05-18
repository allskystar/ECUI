/*
@example
<div ui="type:calendar;year:2009;month:11"></div>
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
        {
            'private': {
                title: undefined
            },

            'protected': {
                /**
                 * @override
                 */
                $initView: function () {
                    var cells = _super.$initView(),
                        el = this.getMain();

                    // 生成日历控件结构
                    dom.insertHTML(
                        el,
                        'AFTERBEGIN',
                        '<div class="' + this.getUnitClass(ui.Calendar, 'header') + '"><div class="' +
                            this.getUnitClass(ui.Calendar, 'title') + '"></div><div class="' +
                            this.getUnitClass(ui.Calendar, 'prev-year') + this.Button.CLASS + '">&lt;&lt;</div><div class="' +
                            this.getUnitClass(ui.Calendar, 'prev-month') + this.Button.CLASS + '">&lt;</div><div class="' +
                            this.getUnitClass(ui.Calendar, 'next-month') + this.Button.CLASS + '">&gt;</div><div class="' +
                            this.getUnitClass(ui.Calendar, 'next-year') + this.Button.CLASS + '">&gt;&gt;</div></div>'
                    );

                    // 获取el所有直属节点
                    var headers = dom.children(el.firstChild);
                    // 定义头部展示区
                    this.title = headers[0];
                    core.$fastCreate(this.Button, headers[1], this, {move: -12});
                    core.$fastCreate(this.Button, headers[2], this, {move: -1});
                    core.$fastCreate(this.Button, headers[3], this, {move: 1});
                    core.$fastCreate(this.Button, headers[4], this, {move: 12});

                    return cells;
                }
            },

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
                {
                    DEFAULT_OPTIONS: {
                        move: Number(0)
                    },

                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Button.prototype.$click.call(this, event);
                        this.getParent().move(this.move);
                    }
                }
            ),

            /**
             * @override
             */
            $change: function (event) {
                _super.$change(event);
                this.setTitle(this.getYear(), this.getMonth());
            },

            /**
             * @override
             */
            $dispose: function () {
                this.title = null;
                _super.$dispose();
            },

            /**
             * 获取 title 元素。
             * @public
             *
             * @return {HTMLElement} title 元素
             */
            getTitle: function () {
                return this.title;
            },

            /**
             * 设置 title。
             * @public
             *
             * @param {number} year 年
             * @param {number} month 月(1-12)
             */
            setTitle: function (year, month) {
                this.title.innerHTML = util.stringFormat(this.TITLEFORMAT, year, month);
            }
        }
    );
//{if 0}//
}());
//{/if}//
