/*
@example
<div ui="type:month-view;date:2009/04/17"></div>

@fields
_bExtra     - 扩展的日期是否响应事件
_bRowExtra  - 当前是否有行扩展
_nOffset    - 月份开始的偏移值，-26表示当前月的第一天是上个月的26号，默认是1
_nYear      - 年份
_nMonth     - 月份(0-11)
_nWeekday   - 从周几开始显示，0表示周日
_aCells     - 日历控件内的所有单元格，其中第0-6项是日历的头部星期名称
_oBegin     - 开始日期
_oEnd       - 结束日期
_oDate      - 当前选择日期
_cSelected  - 当前选择的日历单元格
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 月视图控件。
     * 提供指定月份的日历信息。
     * options 属性：
     * begin   开始日期，小于这个日期的日历单元格会被disabled
     * end     结束日期，大于这个日期的日历单元格会被disabled
     * date    初始选中的日期，默认是今日
     * extra   扩展的日期是否响应事件，默认为enable，如果需要响应事件设置成disable
     * weekday 从周几开始进行控制，默认是周日(0)
     * offset  每月的开始时间，默认是1,如果从上个月延续，取负值，如-26表示这个月的开始是上个月的26号
     * @control
     */
    ui.MonthView = core.inherits(
        ui.Control,
        'ui-monthview',
        function (el, options) {
            _super(el, options);

            this._bExtra = options.extra !== 'disable';
            if (options.begin) {
                this._oBegin = new Date((options.begin === 'TODAY' ? util.formatDate(new Date(), 'yyyy-MM-dd') : options.begin) + ' 00:00:00');
            }
            if (options.end) {
                this._oEnd = new Date((options.end === 'TODAY' ? util.formatDate(new Date(), 'yyyy-MM-dd') : options.end) + ' 00:00:00');
            }
            this._nOffset = +options.offset || 1;
            this._nWeekday = +options.weekday || 0;

            if (options.date) {
                this._oDate = new Date(options.date + ' 00:00:00');
            }

            this._aCells = this.$initView();
        },
        {
            WEEKNAMES: ['日', '一', '二', '三', '四', '五', '六'],

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
                        _super.$click(event);
                        event.item = this;
                        event.date = this._oDate;
                        core.dispatchEvent(this.getParent(), 'dateclick', event);
                    },

                    /**
                     * 获取单元格的日期信息。
                     * @public
                     *
                     * @return {Date} 单元格对应的日期
                     */
                    getDate: function () {
                        return this._oDate;
                    },

                    /**
                     * 是否扩展日期(非本月的日期)。
                     * @public
                     *
                     * @return {boolean} true 扩展日期 / false 普通日期
                     */
                    isExtra: function () {
                        return this._bExtra;
                    },

                    /**
                     * 设置单元格的日期信息。
                     * @public
                     *
                     * @param {Date} date 单元格对应的日期
                     */
                    setDate: function (date) {
                        this._oDate = date;
                        this.getBody().innerHTML = '<div>' + date.getDate() + '</div>';
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
                if ((this._oBegin && event.date < this._oBegin) || (this._oEnd && event.date > this._oEnd)) {
                    event.preventDefault();
                    return;
                }
                this._oDate = event.date;
                this.setSelected(event.item);
            },

            /**
             * 初始化视图区域(子类可以多次初始化)。
             * @protected
             *
             * @return {Array} 视图区域数组，可以在 setView 中使用
             */
            $initView: function () {
                var el = this.getBody();
                el.insertAdjacentHTML('beforeEnd', util.formatString(
                    '<table><thead>{1}</thead><tbody>{0}{0}{0}{0}{0}{0}</tbody></table>',
                    util.formatString(
                        '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                        '<td class="' + this.getUnitClass(ui.MonthView, 'date') + '"></td>'
                    ),
                    util.formatString(
                        '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                        '<td class="' + this.getUnitClass(ui.MonthView, 'title') + '"></td>'
                    )
                ));

                var cells = dom.toArray(el.lastChild.getElementsByTagName('TD')).map(
                    function (item, index) {
                        return core.$fastCreate(index < 7 ? ui.Control : this.Cell, item, this);
                    },
                    this
                );

                for (var i = 0; i < 7; i++) {
                    cells[i].getBody().innerHTML = this.WEEKNAMES[(i + this._nWeekday) % 7];
                }

                return cells;
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                var date = this._oDate || new Date();
                this.setView(date.getFullYear(), date.getMonth() + 1);
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
             * 获取日历控件当前月的第一天。
             * @public
             *
             * @return {Date} 第一天的日期对象
             */
            getFirstDay: function () {
                return this._oFirst;
            },

            /**
             * 获取日历控件当前月的最后一天。
             * @public
             *
             * @return {Date} 最后一天的日期对象
             */
            getLastDay: function () {
                return this._oLast;
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
                this._oDate = date;
                if (!date) {
                    this.setSelected();
                    date = new Date();
                }
                var day = date.getDate();
                this.setView(date.getFullYear(), date.getMonth() + (this._nOffset < 0 ? day < -this._nOffset ? 1 : 2 : day < this._nOffset ? 0 : 1));
            },

            /**
             * 设置扩展日期是否响应事件。
             * @public
             *
             * @param {boolean} isCaptured true 响应事件 / false 不响应事件
             */
            setExtraCapture: function (isCaptured) {
                this._bExtra = isCaptured;
                // this.setView(this.getYear(), this.getMonth());
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
                // this.setView(this.getYear(), this.getMonth());
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
                var date = new Date(year, month - 1, 1);
                year = date.getFullYear();
                month = date.getMonth() + 1;
                var today = new Date(),
                    dateYear = year || today.getFullYear(),
                    dateMonth = month !== undefined ? month - 1 : today.getMonth(),
                    firstDay = new Date(dateYear, this._nOffset > 0 ? dateMonth : dateMonth - 1, this._nOffset > 0 ? this._nOffset : -this._nOffset),
                    lastDay = new Date(dateYear, this._nOffset > 0 ? dateMonth + 1 : dateMonth, this._nOffset > 0 ? this._nOffset - 1 : -this._nOffset - 1),
                    day = -(firstDay.getDay() + 7 - this._nWeekday) % 7,
                    begin = firstDay,
                    end = lastDay,
                    oldYear = this._nYear,
                    oldMonth = this._nMonth;

                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                if (this._oBegin > begin) {
                    begin = this._oBegin;
                }
                if (this._oEnd < end) {
                    end = this._oEnd;
                }

                this._nYear = dateYear;
                this._nMonth = dateMonth;
                this._oFirst = firstDay;
                this._oLast = lastDay;

                this.setSelected();

                (cells || this._aCells).slice(7).forEach(
                    function (item, index) {
                        var el = item.getMain();
                        date = new Date(firstDay.getTime() + (day + index) * 3600000 * 24);
                        item.setDate(date);

                        if (date >= begin && date <= end) {
                            if (index && !(index % 7)) {
                                dom.removeClass(el.parentElement, 'ui-extra');
                            }
                            dom.removeClass(el, 'ui-extra');
                            delete item._bExtra;
                            if (date - this._oDate === 0) {
                                this.setSelected(item);
                            }
                            item.setCapturableStatus(true);
                        } else {
                            if (index && !(index % 7)) {
                                var parent = el.parentElement;
                                if (!parent.classList.contains('ui-extra')) {
                                    dom.addClass(parent, 'ui-extra');
                                }
                            }
                            if (!item._bExtra) {
                                dom.addClass(el, 'ui-extra');
                                item._bExtra = true;
                            }
                            item.setCapturableStatus(this._bExtra);
                        }

                        if (date - today) {
                            dom.removeClass(el, 'ui-today');
                        } else {
                            dom.addClass(el, 'ui-today');
                        }
                    },
                    this
                );

                if (oldYear !== dateYear || oldMonth !== dateMonth) {
                    core.dispatchEvent(this, 'change');
                }
            }
        },
        ui.Control.defineProperty('selected')
    );
//{if 0}//
})();
//{/if}//
