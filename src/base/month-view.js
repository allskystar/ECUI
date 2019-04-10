/*
@example
<div ui="type:month-view;year:2009;month:11"></div>

@fields
_bExtra     - 扩展的日期是否响应事件
_nYear      - 年份
_nMonth     - 月份(0-11)
_aCells     - 日历控件内的所有单元格，其中第0-6项是日历的头部星期名称
_oBegin     - 开始日期
_oEnd       - 结束日期
_oDate      - 当前选择日期
_cSelected  - 当前选择的日历单元格
_nDay       - 从本月1号开始计算的天数，如果是上个月，是负数，如果是下个月，会大于当月最大的天数
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 选中某个日期单元格。
     * @private
     *
     * @param {ecui.ui.MonthView} view 日历视图对象
     * @param {ecui.ui.MonthView.Cell} cell 日期单元格对象
     */
    function setSelected(view, cell) {
        if (view._cSelected !== cell) {
            if (view._cSelected) {
                view._cSelected.alterStatus('-selected');
            }

            if (cell) {
                cell.alterStatus('+selected');
            }
            view._cSelected = cell;
        }
    }

    /**
     * 月视图控件。
     * 提供指定月份的日历信息。
     * options 属性：
     * year    年份
     * month   月份(1-12)
     * begin   开始日期，小于这个日期的日历单元格会被disabled
     * end     结束日期，大于这个日期的日历单元格会被disabled
     * date    初始选中的日期，默认是今日
     * extra   扩展的日期是否响应事件，默认为enable，如果需要响应事件设置成disable
     * @control
     */
    ui.MonthView = core.inherits(
        ui.Control,
        'ui-monthview',
        function (el, options) {
            ui.Control.call(this, el, options);

            this._aCells = this.$initView(options);

            this._bExtra = options.extra === 'disable';
            if (options.begin) {
                this._oBegin = new Date(options.begin);
            }
            if (options.end) {
                this._oEnd = new Date(options.end);
            }
            this._nOffset = +options.offset || 1;
            this._oDate = options.date ? new Date(options.date) : new Date();
        },
        {
            WEEKNAMES: ['一', '二', '三', '四', '五', '六', '日'],

            /**
             * 日期部件。
             * @unit
             */
            Cell: core.inherits(
                ui.Control,
                {
                    /**
                     * 点击时，根据单元格类型触发相应的事件。
                     * @override
                     */
                    $click: function (event) {
                        event.item = this;
                        event.date = new Date(this._nYear, this._nMonth, this._nDay);
                        core.dispatchEvent(this.getParent(), 'dateclick', event);
                    },

                    /**
                     * 获取单元格天的信息。
                     * @public
                     *
                     * @return {number} 一个月中的第几天
                     */
                    getDay: function () {
                        return this._nDay;
                    }
                }
            ),

            /**
             * 日期选择改变事件。
             * @event
             */
            $change: util.blank,

            /**
             * 日期点击事件。
             * event 属性
             * date  点击的日期
             * @event
             */
            $dateclick: function (event) {
                this._oDate = event.date;
                setSelected(this, event.item);
            },

            /**
             * 初始化视图区域(子类可以多次初始化)。
             * @protected
             *
             * @param {Object} options 参数化参数
             * @return {Array} 视图区域数组，可以在 setView 中使用
             */
            $initView: function (options) {
                var el = this.getBody();
                dom.insertHTML(el, 'beforeEnd', util.stringFormat(
                    '<table><thead>{1}</thead><tbody>{0}{0}{0}{0}{0}{0}</tbody></table>',
                    util.stringFormat(
                        '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                        '<td class="' + options.classes.join('-date ') + '"></td>'
                    ),
                    util.stringFormat(
                        '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                        '<td class="' + options.classes.join('-title ') + '"></td>'
                    )
                ));

                var cells = dom.toArray(el.lastChild.getElementsByTagName('TD')).map(function (item, index) {
                    return core.$fastCreate(index < 7 ? ui.Control : this.Cell, item, this);
                }, this);

                this.WEEKNAMES.forEach(function (item, index) {
                    cells[index].getBody().innerHTML = item;
                }, this);

                return cells;
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                this.setView(this._oDate.getFullYear(), this._oDate.getMonth() + 1);
            },

            /**
             * 获取有效日期区间的开始。
             * @public
             *
             * @return {Date} 有效日期区间的开始
             */
            getBegin: function () {
                return this._oBegin;
            },

            /**
             * 获取全部的日期对象。
             * @public
             *
             * @return {Array} 日期对象列表
             */
            getDays: function () {
                return this._aCells.slice(7);
            },

            /**
             * 获取当前选择的日期。
             * @public
             *
             * @return {Date} 日期对象
             */
            getDate: function () {
                return this._oDate;
            },

            /**
             * 获取有效日期区间的结束。
             * @public
             *
             * @return {Date} 有效日期区间的结束
             */
            getEnd: function () {
                return this._oEnd;
            },

            /**
             * 获取日历控件当前显示的月份。
             * @public
             *
             * @return {number} 月份(1-12)
             */
            getMonth: function () {
                return this._nMonth + 1;
            },

            /**
             * 获取日历控件当前选中的项。
             * @public
             *
             * @return {ecui.ui.MonthView.Cell} 选中的控件
             */
            getSelected: function () {
                return this._cSelected;
            },

            /**
             * 获取日历控件当前显示的年份。
             * @public
             *
             * @return {number} 年份(19xx-20xx)
             */
            getYear: function () {
                return this._nYear;
            },

            /**
             * 日历显示移动指定的月份数。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {number} offsetMonth 日历移动的月份数
             */
            move: function (offsetMonth) {
                var time = new Date(this._nYear, this._nMonth + offsetMonth, 1);
                this.setView(time.getFullYear(), time.getMonth() + 1);
            },

            /**
             * 设置当前选择的日期，并切换到对应的月份。
             * @public
             *
             * @param {Date} date 日期
             */
            setDate: function (date) {
                this._oDate = date ? new Date(date.getTime()) : undefined;
                date = date || new Date();
                this.setView(date.getFullYear(), date.getMonth() + 1);
            },

            /**
             * 设置日历控件的有效日期范围。
             * 不在有效日期范围的时间单无格都会处于 disabled 状态。
             * @public
             *
             * @param {Date} begin 开始日期，默认表示不限制开始日期
             * @param {Date} end 结束日期，默认表示不限制结束日期
             */
            setRange: function (begin, end) {
                this._oBegin = begin;
                this._oEnd = end;
                this.setView(this.getYear(), this.getMonth());
            },

            /**
             * 设置日历控件当前显示的月份。
             * @public
             *
             * @param {number} year 年份(19xx-20xx)，如果省略使用浏览器的当前年份
             * @param {number} month 月份(1-12)，如果省略使用浏览器的当前月份
             * @param {Array} cells 填充的区域，默认是主区域
             */
            setView: function (year, month, cells) {
                var today = new Date(),
                    dateYear = year || today.getFullYear(),
                    dateMonth = month !== undefined ? month - 1 : today.getMonth(),
                    firstDay = new Date(dateYear, this._nOffset > 0 ? dateMonth : dateMonth - 1, this._nOffset > 0 ? this._nOffset : -this._nOffset),
                    lastDay = new Date(dateYear, this._nOffset > 0 ? dateMonth + 1 : dateMonth, this._nOffset > 0 ? this._nOffset - 1 : -this._nOffset - 1),
                    day = -(firstDay.getDay() + 6) % 7,
                    begin = firstDay,
                    end = lastDay,
                    oldYear = this._nYear,
                    oldMonth = this._nMonth;

                today = new Date(dateYear, dateMonth, today.getDate());

                if (this._oBegin > begin) {
                    begin = this._oBegin;
                }
                if (this._oEnd < end) {
                    end = this._oEnd;
                }

                this._nYear = dateYear;
                this._nMonth = dateMonth;

                setSelected(this);

                (cells || this._aCells).slice(7).forEach(function (item, index) {
                    var date = new Date(firstDay.getTime() + (day + index) * 3600000 * 24),
                        el = item.getOuter();

                    item._nYear = date.getYear();
                    item._nMonth = date.getMonth();
                    item.getBody().innerHTML = item._nDay = date.getDate();

                    if (date >= begin && date <= end) {
                        if (!(index % 7)) {
                            dom.removeClass(dom.parent(el), 'ui-extra');
                        }
                        dom.removeClass(el, 'ui-extra');
                        if (date === this._oDate) {
                            setSelected(this, item);
                        }
                        item.enable();
                    } else {
                        if (!(index % 7)) {
                            dom.addClass(dom.parent(el), 'ui-extra');
                        }
                        dom.addClass(el, 'ui-extra');
                        if (this._bExtra) {
                            item.disable();
                        }
                    }

                    if (date - today) {
                        dom.removeClass(el, 'ui-today');
                    } else {
                        dom.addClass(el, 'ui-today');
                    }
                }, this);

                if (oldYear !== dateYear || oldMonth !== dateMonth) {
                    core.dispatchEvent(this, 'change');
                }
            }
        }
    );
}());
