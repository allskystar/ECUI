/*
@example
<div ui="type:range-calendar"></div>
@fields
_oStart - 选中区域的开始时间
_oEnd   - 选中区域的结束时间
_uTitle - 标题栏控件
_uPrev  - 后退一个月按钮控件
_uNext  - 前进一个月按钮控件
_uFrom  - 开始月视图控件
_uTo    - 下一个月视图控件
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 月视图控件刷新，改变选中区域的样式。
     * @private
     *
     * @param {ecui.ui.MonthView} monthview 月视图控件
     * @param {Date} start 选中区域的开始时间，如果为空表示没有选中区域
     * @param {Date} end 选中区域的结束时间，如果为空表示没有选中区域
     */
    function refresh(monthview, start, end) {
        monthview._aCells.slice(7).forEach(function (item) {
            if (!item.isExtra()) {
                var el = item.getMain(),
                    type = item.getClass(),
                    date = item.getDate();

                dom.removeClass(el, type + '-start ' + type + '-end ' + type + '-mid');
                if (end - start > 0) {
                    // TDOD 重复代码待优化
                    if (date - start > 0 && date - end < 0) {
                        dom.addClass(el, type + '-mid');
                    } else if (date - start === 0) {
                        dom.addClass(el, type + '-start');
                    } else if (date - end === 0) {
                        dom.addClass(el, type + '-end');
                    }
                }
            }
        });
    }

    /**
     * 范围日历控件。
     * 实现了一个范围日历，是相邻的两个月份。
     * @control
     */
    ui.RangeCalendar = core.inherits(
        ui.Control,
        'ui-range-calendar',
        function (el, options) {
            ui.Control.call(this, el, options);
            var html = '<div class="' + this.getUnitClass(ui.RangeCalendar, 'monthview') + this.MonthView.CLASS + '"></div>';
            el.innerHTML =
                '<div class="' + this.getUnitClass(ui.RangeCalendar, 'header') + '">' +
                    '<div class="' + this.getUnitClass(ui.RangeCalendar, 'title') + '"></div>' +
                    '<div class="' + this.getUnitClass(ui.RangeCalendar, 'prev') + ui.Button.CLASS + '">上个月</div>' +
                    '<div class="' + this.getUnitClass(ui.RangeCalendar, 'next') + ui.Button.CLASS + '">下个月</div>' +
                '</div>' + html + html;

            this._uTitle = core.$fastCreate(ui.Control, el.firstChild.firstChild, this);
            this._uPrev = core.$fastCreate(this.Button, el.firstChild.firstChild.nextSibling, this, { move: -1 });
            this._uNext = core.$fastCreate(this.Button, el.firstChild.lastChild, this, { move: 1 });
            this._uFrom = core.$fastCreate(this.MonthView, el.firstChild.nextSibling, this);
            this._uTo = core.$fastCreate(this.MonthView, el.lastChild, this);
        },
        {
            /**
             * 日历前进后退部件。
             * options 属性：
             * move    前进后退月份的偏移值，需要改变一年设置为12
             * @unit
             */
            Button: core.inherits(
                ui.Button,
                function (el, options) {
                    this._nMove = +options.move;
                    ui.Button.call(this, el, options);
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
             * 月视图部件。
             * @control
             */
            MonthView: core.inherits(
                ui.MonthView,
                {
                    /**
                     * 单元格部件。
                     * @control
                     */
                    Cell: core.inherits(ui.MonthView.prototype.Cell, {
                        /**
                         * @override
                         */
                        $mouseover: function (event) {
                            ui.MonthView.prototype.Cell.prototype.$mouseover.call(this, event);
                            var calendar = this.getParent().getParent();
                            if (this.isExtra()) {
                                // 扩展日期区域直接使用系统的区域设定
                                refresh(calendar._uFrom, calendar._oStart, calendar._oEnd);
                                refresh(calendar._uTo, calendar._oStart, calendar._oEnd);
                            } else if (calendar._oStart && !calendar._oEnd) {
                                // 选择了开始日期没有选择结束日期，动态调整区域
                                var date = this.getDate(),
                                    start = Math.min(calendar._oStart, date),
                                    end = Math.max(calendar._oStart, date);
                                refresh(calendar._uFrom, start, end);
                                refresh(calendar._uTo, start, end);
                            }
                            // 如果区域已经选择或者没有选择开始区域，不需要处理
                        }
                    }),

                    /**
                     * @override
                     */
                    $dateclick: function (event) {
                        if (!event.item.isExtra()) {
                            ui.MonthView.prototype.$dateclick.call(this, event);
                            var calendar = this.getParent();
                            if (calendar._oStart && calendar._oEnd) {
                                // 时间区域已经选择，清空之前的选择
                                calendar._oStart = calendar._oEnd = null;
                                refresh(calendar._uFrom);
                                refresh(calendar._uTo);
                            }

                            if (calendar._oStart) {
                                // 未选择结束时间，选择后根据情况处理是否与开始时间交换
                                var date = event.item.getDate();
                                if (calendar._oStart <= date) {
                                    calendar._oEnd = date;
                                } else {
                                    calendar._oEnd = calendar._oStart;
                                    calendar._oStart = date;
                                }
                            } else {
                                // 选择开始时间，清空另一个月视图的日期选择信息
                                calendar._oStart = event.item.getDate();
                                calendar[this === calendar._uFrom ? '_uTo' : '_uFrom'].setDate();
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    setView: function (year, month) {
                        ui.MonthView.prototype.setView.call(this, year, month);
                        var calendar = this.getParent();
                        refresh(this, calendar._oStart, calendar._oEnd);
                    }
                }
            ),

            /**
             * 日历显示移动指定的月份数。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {number} offsetMonth 日历移动的月份数
             */
            move: function (offsetMonth) {
                if (offsetMonth) {
                    this._uFrom.move(offsetMonth);
                    this._uTo.move(offsetMonth);
                }
                this._uTitle.setContent(this._uFrom.getYear() + '年' + this._uFrom.getMonth() + '月 至 ' + this._uTo.getYear() + '年' + this._uTo.getMonth() + '月');
            },

            /**
             * 设置日期区域。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {Date} start 开始时间
             * @param {Date} end 结束时间
             */
            setDateRange: function (start, end) {
                if (start && end) {
                    this._oStart = start;
                    this._oEnd = end;
                } else {
                    start = new Date();
                    this._oStart = this._oEnd = null;
                }
                var year = start.getFullYear(),
                    month = start.getMonth() + 1;

                this._uFrom.setView(year, month);
                this._uTo.setView(year, month + 1);
                this.move(0);
            }
        }
    );
})();
