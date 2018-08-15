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
     * 获取匹配的日期。
     * @private
     *
     * @param {Date} date 原始日期对象
     * @param {number} year 匹配的年份
     * @param {number} month 匹配的月份
     * @param {number} day 当年月无法匹配时的返回值
     * @return {number} 年月可以匹配时返回日期
     */
    function getDay(date, year, month, day) {
        return date && date.getFullYear() === year && date.getMonth() === month ? date.getDate() : day;
    }

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
            el.innerHTML = util.stringFormat(
                '<table><thead>{1}</thead><tbody>{0}{0}{0}{0}{0}{0}</tbody></table>',
                util.stringFormat(
                    '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                    '<td class="' + options.classes.join('-date ') + '"></td>'
                ),
                util.stringFormat(
                    '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                    '<td class="' + options.classes.join('-title ') + '"></td>'
                )
            );

            ui.Control.call(this, el, options);

            this._aCells = Array.prototype.slice.call(el.getElementsByTagName('TD')).map(function (item, index) {
                return core.$fastCreate(index < 7 ? ui.Control : this.Date, item, this);
            }, this);

            this.WEEKNAMES.forEach(function (item, index) {
                this._aCells[index].getBody().innerHTML = item;
            }, this);

            this._bExtra = options.extra === 'disable';
            this._oBegin = new Date(options.begin);
            this._oEnd = new Date(options.end);
            this._oDate = options.date ? new Date(options.date) : new Date();
        },
        {
            WEEKNAMES: ['一', '二', '三', '四', '五', '六', '日'],

            /**
             * 日期部件。
             * @unit
             */
            Date: core.inherits(
                ui.Control,
                {
                    /**
                     * 点击时，根据单元格类型触发相应的事件。
                     * @override
                     */
                    $click: function (event) {
                        var parent = this.getParent();

                        event.date = new Date(parent._nYear, parent._nMonth, this._nDay);
                        if (core.dispatchEvent(parent, 'dateclick', event)) {
                            parent._oDate = event.date;
                            setSelected(parent, this);
                        }
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
            $dateclick: util.blank,

            /**
             * @override
             */
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                this.setView(this._oDate.getFullYear(), this._oDate.getMonth() + 1);
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
             * 获取日历控件当前显示的月份。
             * @public
             *
             * @return {number} 月份(1-12)
             */
            getMonth: function () {
                return this._nMonth + 1;
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
             */
            setView: function (year, month) {
                var today = new Date(),
                    dateYear = year || today.getFullYear(),
                    dateMonth = month !== undefined ? month - 1 : today.getMonth(),
                    // 得到上个月的最后几天的信息，用于补齐当前月日历的上月信息位置
                    date = new Date(dateYear, dateMonth, 0),
                    day = 1 - date.getDay(),
                    lastDayOfLastMonth = date.getDate();

                // 得到当前月的天数
                date = new Date(dateYear, dateMonth + 1, 0);
                var lastDayOfCurrMonth = date.getDate(),
                    begin = getDay(this._oBegin, dateYear, dateMonth, 1),
                    end = getDay(this._oEnd, dateYear, dateMonth, lastDayOfCurrMonth),
                    selected = getDay(this._oDate, dateYear, dateMonth, 0),
                    now = getDay(today, dateYear, dateMonth, 0),
                    oldYear = this._nYear,
                    oldMonth = this._nMonth;

                this._nYear = date.getFullYear();
                this._nMonth = date.getMonth();

                setSelected(this);

                this._aCells.forEach(function (item, index) {
                    if (index > 6) {
                        var el = item.getOuter();
                        if (month = day >= begin && day <= end) {
                            if (index === 35 || index === 42) {
                                dom.removeClass(dom.parent(el), 'ui-extra');
                            }
                            dom.removeClass(el, 'ui-extra');
                            // 恢复选择的日期
                            if (day === selected) {
                                setSelected(this, item);
                            }
                            item.enable();
                        } else {
                            if (index === 35 || index === 42) {
                                dom.addClass(dom.parent(el), 'ui-extra');
                            }
                            dom.addClass(el, 'ui-extra');
                            if (this._bExtra) {
                                item.disable();
                            }
                        }

                        if (day === now && now > 0) {
                            dom.addClass(el, 'ui-today');
                        } else {
                            dom.removeClass(el, 'ui-today');
                        }

                        item.getBody().innerHTML = month ? day : day > lastDayOfCurrMonth ? day - lastDayOfCurrMonth : lastDayOfLastMonth + day;
                        item._nDay = day++;
                    }
                }, this);

                if (oldYear !== dateYear || oldMonth !== dateMonth) {
                    core.dispatchEvent(this, 'change');
                }
            }
        }
    );
}());
