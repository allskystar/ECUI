/*
@example
<div ui="type:month-view;date:2009/04/17"></div>
*/
(function () {
//{if 0}//
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
            this.cells = this.$initView();
        },
        {
            DEFAULT_OPTIONS: {
                offset: Number(1),
                weekday: Number(0),
                begin: function (value) {
                    return value ? new Date(value) : undefined;
                },
                end: function (value) {
                    return value ? new Date(value) : undefined;
                },
                date: function (value) {
                    var date = value ? new Date(value) : new Date();
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                },
                extra: function (value) {
                    return value === 'disable';
                }
            },

            'private': {
                cells: undefined,
                first: undefined,
                last: undefined,
                year: undefined,
                month: undefined,

                /**
                 * 选中某个日期单元格。
                 * @private
                 *
                 * @param {ecui.ui.MonthView.Cell} cell 日期单元格对象
                 */
                _setSelected: function (cell) {
                    if (this.selected !== cell) {
                        if (this.selected) {
                            this.selected.alterStatus('-selected');
                        }

                        if (cell) {
                            cell.alterStatus('+selected');
                        }
                        this.selected = cell;
                    }
                }
            },

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
                        event.item = this;
                        event.date = this.date;
                        core.dispatchEvent(this.getParent(), 'dateclick', event);
                    },

                    /**
                     * 获取单元格的日期信息。
                     * @public
                     *
                     * @return {Date} 单元格对应的日期
                     */
                    getDate: function () {
                        return this.date;
                    },

                    /**
                     * 设置单元格的日期信息。
                     * @public
                     *
                     * @param {Date} date 单元格对应的日期
                     */
                    setDate: function (date) {
                        this.date = date;
                        this.getBody().innerHTML = date.getDate();
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
                this.date = event.date;
                this._setSelected(event.item);
            },

            /**
             * 初始化视图区域(子类可以多次初始化)。
             * @protected
             *
             * @return {Array} 视图区域数组，可以在 setView 中使用
             */
            $initView: function () {
                var el = this.getBody();
                dom.insertHTML(el, 'beforeEnd', util.stringFormat(
                    '<table><thead>{1}</thead><tbody>{0}{0}{0}{0}{0}{0}</tbody></table>',
                    util.stringFormat(
                        '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                        '<td class="' + this.getUnitClass(ui.MonthView, 'date') + '"></td>'
                    ),
                    util.stringFormat(
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
                    cells[i].getBody().innerHTML = this.WEEKNAMES[(i + this.weekday) % 7];
                }

                return cells;
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.setView(this.date.getFullYear(), this.date.getMonth() + 1);
            },

            /**
             * 获取有效日期区间的开始。
             * @public
             *
             * @return {Date} 有效日期区间的开始
             */
            getBegin: function () {
                return this.begin;
            },

            /**
             * 获取全部的日期对象。
             * @public
             *
             * @return {Array} 日期对象列表
             */
            getDays: function () {
                return this.cells.slice(7);
            },

            /**
             * 获取当前选择的日期。
             * @public
             *
             * @return {Date} 日期对象
             */
            getDate: function () {
                return this.date;
            },

            /**
             * 获取有效日期区间的结束。
             * @public
             *
             * @return {Date} 有效日期区间的结束
             */
            getEnd: function () {
                return this.end;
            },

            /**
             * 获取日历控件当前月的第一天。
             * @public
             *
             * @return {Date} 第一天的日期对象
             */
            getFirstDay: function () {
                return this.first;
            },

            /**
             * 获取日历控件当前月的最后一天。
             * @public
             *
             * @return {Date} 最后一天的日期对象
             */
            getLastDay: function () {
                return this.last;
            },

            /**
             * 获取日历控件当前显示的月份。
             * @public
             *
             * @return {number} 月份(1-12)
             */
            getMonth: function () {
                return this.month + 1;
            },

            /**
             * 获取日历控件当前选中的项。
             * @public
             *
             * @return {ecui.ui.MonthView.Cell} 选中的控件
             */
            getSelected: function () {
                return this.selected;
            },

            /**
             * 获取日历控件当前显示的年份。
             * @public
             *
             * @return {number} 年份(19xx-20xx)
             */
            getYear: function () {
                return this.year;
            },

            /**
             * 日历显示移动指定的月份数。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {number} offsetMonth 日历移动的月份数
             */
            move: function (offsetMonth) {
                var time = new Date(this.year, this.month + offsetMonth, 1);
                this.setView(time.getFullYear(), time.getMonth() + 1);
            },

            /**
             * 设置当前选择的日期，并切换到对应的月份。
             * @public
             *
             * @param {Date} date 日期
             */
            setDate: function (date) {
                this.date = date ? new Date(date.getTime()) : undefined;
                date = date || new Date();

                var day = date.getDate();
                this.setView(date.getFullYear(), date.getMonth() + (this.offset < 0 ? day < -this.offset ? 1 : 2 : day < this.offset ? 0 : 1));
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
                this.begin = begin;
                this.end = end;
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
                    firstDay = new Date(dateYear, this.offset > 0 ? dateMonth : dateMonth - 1, this.offset > 0 ? this.offset : -this.offset),
                    lastDay = new Date(dateYear, this.offset > 0 ? dateMonth + 1 : dateMonth, this.offset > 0 ? this.offset - 1 : -this.offset - 1),
                    day = -(firstDay.getDay() + 7 - this.weekday) % 7,
                    begin = firstDay,
                    end = lastDay,
                    oldYear = this.year,
                    oldMonth = this.month;

                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                if (this.begin > begin) {
                    begin = this.begin;
                }
                if (this.end < end) {
                    end = this.end;
                }

                this.year = dateYear;
                this.month = dateMonth;
                this.first = firstDay;
                this.last = lastDay;

                this._setSelected();

                (cells || this.cells).slice(7).forEach(
                    function (item, index) {
                        var date = new Date(firstDay.getTime() + (day + index) * 3600000 * 24),
                            el = item.getMain();

                        item.setDate(date);

                        if (date >= begin && date <= end) {
                            if (index && !(index % 7)) {
                                dom.removeClass(dom.parent(el), 'ui-extra');
                            }
                            dom.removeClass(el, 'ui-extra');
                            delete item.extra;
                            if (date - this.date === 0) {
                                this._setSelected(item);
                            }
                            item.enable();
                        } else {
                            if (index && !(index % 7)) {
                                var parent = dom.parent(el);
                                if (!dom.hasClass(parent, 'ui-extra')) {
                                    dom.addClass(parent, 'ui-extra');
                                }
                            }
                            if (!item.extra) {
                                dom.addClass(el, 'ui-extra');
                                item.extra = true;
                            }
                            if (this.extra) {
                                item.disable();
                            }
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
        }
    );
}());
