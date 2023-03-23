//{if $css}//
ecui.__ControlStyle__('\
.ui-calendar {\
    .ui-calendar-header {\
        .ui-calendar-next-month,\
        .ui-calendar-prev-month {\
            display: none;\
        }\
        .ui-calendar-title {\
            .ui-calendar-year,\
            .ui-calendar-month {\
                display: inline-block;\
                vertical-align: middle;\
                cursor: pointer;\
            }\
            .ui-calendar-month {\
                display: none;\
            }\
        }\
    }\
    .ui-year-group,\
    .ui-year,\
    .ui-month,\
    .ui-monthview {\
        display: none;\
    }\
    &.ui-calendar-year-group .ui-year-group,\
    &.ui-calendar-year .ui-year,\
    &.ui-calendar-month .ui-month,\
    &.ui-calendar-monthview .ui-monthview {\
        display: block;\
    }\
    &.ui-calendar-monthview {\
        .ui-calendar-next-month,\
        .ui-calendar-prev-month {\
            display: inline-block;\
        }\
        .ui-calendar-title {\
            .ui-calendar-month {\
                display: inline-block;\
            }\
        }\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:calendar;year:2009;month:11"></div>

@fields
_sFormat       - 表头定义
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
    var Select = core.inherits(
        ui.Control,
        'ui-select',
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                function (el, options) {
                    _super(el, options);
                    this._sValue = options.value;
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        var parent = this.getParent();
                        parent.setSelected(this);
                        event.view = parent;
                        core.dispatchEvent(parent, 'change', event);
                    },
                    getValue: function () {
                        return this._sValue;
                    }
                }
            ),
            $alterItems: util.blank,

            /**
             * 日期选择改变事件。
             * @event
             */
            $change: function (event) {
                core.dispatchEvent(this.getParent(), 'changeview', event);
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

            getValue: function () {
                return this.getSelected() ? this.getSelected().getValue() : '';
            },

            /**
             * 设置扩展日期是否响应事件。
             * @public
             *
             * @param {boolean} isCaptured true 响应事件 / false 不响应事件
             */
            setExtraCapture: function (isCaptured) {
                this._bExtra = isCaptured;
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
            },

            setValue: function (value) {
                this.setSelected(this.getItems().find(function (item) { return item._sValue === value.toString(); }));
            },

            setView: function (year, month) {
                var parent = this.getParent();
                parent.setYear(year);
                parent.setMonth(month ? month - 1 : 0);
            }
        },
        ui.iItems,
        ui.Control.defineProperty('selected')
    );
    /**
     * 月视图控件。
     * 提供指定月份的日历信息。
     * options 属性：
     * begin   开始日期，小于这个日期的日历单元格会被disabled
     * end     结束日期，大于这个日期的日历单元格会被disabled
     * date    初始选中的日期，默认是今日
     * extra   扩展的日期是否响应事件，默认为enable，如果需要响应事件设置成disable
     * @control
     */
    ui.YearGroup = core.inherits(
        Select,
        'ui-year-group',
        {
            setView: function (year, month) {
                Select.prototype.setView.call(this, year, month);
                var start = Math.floor(year / 100) * 100,
                    years = [],
                    oBegin = this._oBegin ? new Date(this._oBegin.getFullYear()) : null,
                    oEnd = this._oEnd ? new Date(this._oEnd.getFullYear()) : null;

                for (var i = -1; i < 11; i++) {
                    var extra = '',
                        capturable = '',
                        _start = start + 10 * i,
                        _end = start + 10 * i + 9;

                    if ((i === -1 || i === 10) || ((oBegin && new Date(_end) < oBegin) || (oEnd && new Date(_start) > oEnd))) {
                        extra = 'ui-extra';
                        capturable = this._bExtra ? '' : 'capturable:false';
                    }
                    years.push(util.formatString('<div class="{1}" ui="value:{0};{2}"><div class="ui-cell">{0}</div></div>', util.formatString('{0}-{1}', _start, _end), extra, capturable));
                }
                var el = dom.create({ innerHTML: years.join('') });
                this.removeAll(true);
                this.add(dom.children(el));
            }
        },
        ui.iItems,
        ui.Control.defineProperty('selected')
    );
    /**
     * 月视图控件。
     * 提供指定月份的日历信息。
     * options 属性：
     * begin   开始日期，小于这个日期的日历单元格会被disabled
     * end     结束日期，大于这个日期的日历单元格会被disabled
     * date    初始选中的日期，默认是今日
     * extra   扩展的日期是否响应事件，默认为enable，如果需要响应事件设置成disable
     * @control
     */
    ui.Year = core.inherits(
        Select,
        'ui-year',
        {
            setView: function (year, month) {
                Select.prototype.setView.call(this, year, month);
                var start = Math.floor(year / 10) * 10,
                    end = start + 10,
                    years = [],
                    oBegin = this._oBegin ? new Date(this._oBegin.getFullYear()) : null,
                    oEnd = this._oEnd ? new Date(this._oEnd.getFullYear()) : null;

                for (var i = start - 1; i <= end; i++) {
                    var extra = '',
                        capturable = '';
                    if ((i === start - 1 || i === end) || ((oBegin && new Date(i) < oBegin) || (oEnd && new Date(i) > oEnd))) {
                        extra = 'ui-extra';
                        capturable = this._bExtra ? '' : 'capturable:false';
                    }
                    years.push(util.formatString('<div class="{1}" ui="value:{0};{2}"><div class="ui-cell">{0}</div></div>', i, extra, capturable));
                }
                var el = dom.create({ innerHTML: years.join('') });
                this.removeAll(true);
                this.add(dom.children(el));
            }
        },
        ui.iItems,
        ui.Control.defineProperty('selected')
    );

    /**
     * 月视图控件。
     * 提供指定月份的日历信息。
     * options 属性：
     * begin   开始日期，小于这个日期的日历单元格会被disabled
     * end     结束日期，大于这个日期的日历单元格会被disabled
     * @control
     */
    ui.Month = core.inherits(
        Select,
        'ui-month',
        {
            MONTHUpper: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],

            setView: function (year, month) {
                Select.prototype.setView.call(this, year, month);
                var months = [],
                    parent = this.getParent(),
                    _year = parent.getYear(),
                    oBegin = this._oBegin ? new Date(this._oBegin.getFullYear(), this._oBegin.getMonth()) : null,
                    oEnd = this._oEnd ? new Date(this._oEnd.getFullYear(), this._oEnd.getMonth()) : null;

                for (var i = 1; i <= 12; i++) {
                    var extra = '',
                        capturable = '';
                    if ((oBegin && new Date(_year, i - 1) < oBegin) || (oEnd && new Date(_year, i - 1) > oEnd)) {
                        extra = 'ui-extra';
                        capturable = this._bExtra ? '' : 'capturable:false';
                    }
                    months.push(util.formatString('<div class="{2}" ui="value:{0};{3}"><div class="ui-cell">{1}</div></div>', i, i + '月', extra, capturable));
                }
                var el = dom.create({ innerHTML: months.join('') });
                this.removeAll(true);
                this.add(dom.children(el));
            }
        },
        ui.iItems,
        ui.Control.defineProperty('selected')
    );
    var MonthView = core.inherits(
        ui.MonthView,
        {
            /**
             * 日期选择改变事件。
             * @event
             */
            $dateclick: function (event) {
                _super.$dateclick(event);
                core.dispatchEvent(this.getParent(), 'dateclick', event);
            }
        }
    );
    /**
     * 日历控件。
     * 提供日期的选择功能，通过改变年月改变月视图选择指定的日期。
     * options 属性：
     * year    初始的年份
     * month   初始的月份
     * @control
     */
    ui.Calendar = core.inherits(
        ui.Control,
        'ui-calendar',
        function (el, options) {
            _super(el, options);
            this._sFormat = options.format || this.FORMAT;

            // 生成日历控件结构
            el.insertAdjacentHTML(
                'afterBegin',
                '<div class="' + this.getUnitClass(ui.Calendar, 'header') + '">' +
                    '<div class="' + this.getUnitClass(ui.Calendar, 'title') + '"><div class="ui-calendar-year"></div><div class="ui-calendar-month"></div></div>' +
                    '<div class="' + this.getUnitClass(ui.Calendar, 'prev-year') + this.Button.CLASS + '"></div>' +
                    '<div class="' + this.getUnitClass(ui.Calendar, 'prev-month') + this.Button.CLASS + '"></div>' +
                    '<div class="' + this.getUnitClass(ui.Calendar, 'next-month') + this.Button.CLASS + '"></div>' +
                    '<div class="' + this.getUnitClass(ui.Calendar, 'next-year') + this.Button.CLASS + '"></div>' +
                '</div>' +
                '<div class="' + this.getUnitClass(ui.Calendar, 'body') + '">' +
                    '<div class="ui-year-group"></div>' +
                    '<div class="ui-year"></div>' +
                    '<div class="ui-month"></div>' +
                    '<div class="ui-monthview"></div>' +
                '</div>' +
                '<div class="' + this.getUnitClass(ui.Calendar, 'operate') + '"><span class="ui-today">今天</span></div>'
            );
            var children = dom.children(el),
                headers = dom.children(children[0]),
                operates = dom.children(children[2]),
                titles = dom.children(headers[0]);


            this._uYearTitle = core.$fastCreate(this.Title, titles[0], this, {operate: 'year'});
            this._uMonthTitle = core.$fastCreate(this.Title, titles[1], this, {operate: 'month'});

            this._uPrevYear = core.$fastCreate(this.Button, headers[1], this, {move: -12});
            this._uPrevMonth = core.$fastCreate(this.Button, headers[2], this, {move: -1});
            this._uNextMonth = core.$fastCreate(this.Button, headers[3], this, {move: 1});
            this._uNextYear = core.$fastCreate(this.Button, headers[4], this, {move: 12});

            children = dom.children(children[1]);
            this._uYearGroup = core.$fastCreate(ui.YearGroup, children[0], this, options);
            this._uYear = core.$fastCreate(ui.Year, children[1], this, options);
            this._uMonth = core.$fastCreate(ui.Month, children[2], this, options);
            this._uMonthView = core.$fastCreate(MonthView, children[3], this, options);

            this._uToday = core.$fastCreate(this.Operate, operates[0], this, Object.assign(options, {operate: 'today'}));
        },
        {
            // 0 - 年份组； 1 - 年份； 2 - 月份； 3 - 日期
            _nViewState: 3,
            FORMAT: '{0}年{1}月',

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
                    _super(el, options);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        this.getParent().move(this._nMove);
                    }
                }
            ),

            /**
             * 日历前进后退部件。
             * options 属性：
             * move    前进后退月份的偏移值，需要改变一年设置为12
             * @unit
             */
            Operate: core.inherits(
                ui.Button,
                function (el, options) {
                    this._sOperate = options.operate;
                    _super(el, options);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        event.operate = this._sOperate;
                        core.dispatchEvent(this.getParent(), 'operateclick', event);
                    }
                }
            ),

            /**
             * 日历前进后退部件。
             * options 属性：
             * move    前进后退月份的偏移值，需要改变一年设置为12
             * @unit
             */
            Title: core.inherits(
                ui.Button,
                function (el, options) {
                    this._sOperate = options.operate;
                    _super(el, options);
                },
                {
                    setText: function (text) {
                        this.getMain().innerHTML = text;
                    },
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        var parent = this.getParent();
                        if (this._sOperate === 'year') {
                            if (parent.getViewState() !== 0) {
                                parent.setViewState(parent.getViewState() === 3 ? 1 : parent.getViewState() - 1);
                            }
                        } else {
                            parent.setViewState(2);
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $change: function (event) {
                _super.$change(event);
                this._eTitle.innerHTML = util.formatString(this._sFormat, this.getYear(), this.getMonth());
            },

            /**
             * 日期选择改变事件。
             * @event
             */
            $dateclick: util.blank,

            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._eTitle = null;
            },

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
                return this._nMonth;
            },

            getViewState: function () {
                return this._nViewState;
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
             * 获取日历控件当前显示的年份。
             * @public
             *
             * @return {number} 年份(19xx-20xx)
             */
            getYear: function () {
                return this._nYear;
            },

            /**
             * 日历显示移动指定的偏移量。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {number} offset 日历移动的偏移量
             */
            move: function (offset) {
                // 设置头
                var items = this._uYearGroup.getItems();
                var yearGroup = this._uYearGroup.getValue();
                var year = +this._uYear.getValue();
                var month = +this._uMonth.getValue();
                if (this._nViewState === 0) {
                    year = +items[1].getValue().split('-')[0] + offset / 12 * 100;
                    this._uYearTitle.setText(year + '-' + (year + 99));
                    this.setView(year, month || 0);
                } else if (this._nViewState === 1) {
                    year = +yearGroup.split('-')[0] + offset / 12 * 10;
                    this._uYearTitle.setText(year + '-' + (year + 9));
                    this.setView(year, month || 0);
                } else if (this._nViewState === 2) {
                    year = year + offset / 12;
                    this._uYearTitle.setText(year + '年');
                    this.setView(year, month || 0);
                } else if (this._nViewState === 3) {
                    if (Math.abs(offset) === 12) {
                        year = year + offset / 12;
                    } else {
                        month = +month + offset;
                        if (month === 0) {
                            year = year - 1;
                            month = 12;
                        } else if (month === 13) {
                            year = year + 1;
                            month = 1;
                        }
                    }
                    this._uYearTitle.setText(year + '年');
                    this._uMonthTitle.setText(month + '月');
                    this.setView(year, month);
                }
            },

            onchangeview: function (event) {
                var yearGroup = this._uYearGroup.getValue();
                var year = this._uYear.getValue();
                var month = this._uMonth.getValue();
                if (event.view === this._uYearGroup) {
                    this.setViewState(1);
                    this._uYear.setView(+yearGroup.split('-')[0]);
                } else if (event.view === this._uYear) {
                    this.setViewState(2);
                    this._uMonth.setView(+year);
                } else if (event.view === this._uMonth) {
                    this.setViewState(3);
                    this._uMonthView.setView(+year, +month);
                }
            },

            onoperateclick: function (event) {
                if (event.operate === 'today') {
                    var now = new Date();
                    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    this.setDate(today);
                    core.dispatchEvent(this._uMonthView.getSelected(), 'click');
                }
            },

            /**
             * 设置扩展日期是否响应事件。
             * @public
             *
             * @param {boolean} isCaptured true 响应事件 / false 不响应事件
             */
            setExtraCapture: function (isCaptured) {
                this._bExtra = isCaptured;
                this.viewCaller('setExtraCapture', isCaptured);
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
                this.viewCaller('setRange', this._oBegin, this._oEnd);
            },

            /**
             * 设置日历控件的有效日期范围。
             * 不在有效日期范围的时间单无格都会处于 disabled 状态。
             * @public
             *
             * @param {Date} begin 开始日期，默认表示不限制开始日期
             * @param {Date} end 结束日期，默认表示不限制结束日期
             */
            setDate: function (date) {
                this._oDate = date = date || new Date();
                this._uMonthView.setDate(date);
                this.setView(date.getFullYear(), date.getMonth() + 1);
                this.setViewState(3);
            },

            /**
             * 获取日历控件当前显示的月份。
             * @public
             *
             * @return {number} 月份(1-12)
             */
            setMonth: function (month) {
                this._nMonth = month;
            },


            setView: function (year, month) {
                this._nYear = year;
                this._nMonth = month;
                var yearGroup = Math.floor(year / 10) * 10 + '-' + (Math.floor(year / 10) * 10 + 9);
                this.viewCaller('setView', year, month);
                this._uYearGroup.setValue(yearGroup);
                this._uYear.setValue(year);
                this._uMonth.setValue(month);
            },

            setViewState: function (state) {
                this._nViewState = state;
                var states = ['ui-calendar-year-group', 'ui-calendar-year', 'ui-calendar-month', 'ui-calendar-monthview'];
                dom.removeClass(this.getMain(), states.join(' '));
                dom.addClass(this.getMain(), states[state]);
                // 设置头
                var items = this._uYearGroup.getItems();
                var yearGroup = this._uYearGroup.getValue();
                var year = this._uYear.getValue();
                var month = this._uMonth.getValue();
                if (this._nViewState === 0) {
                    this._uYearTitle.setText(items[1].getValue().split('-')[0] + '-' + items[items.length - 2].getValue().split('-')[1]);
                } else if (this._nViewState === 1) {
                    this._uYearTitle.setText(yearGroup);
                } else if (this._nViewState === 2) {
                    this._uYearTitle.setText(year + '年');
                } else if (this._nViewState === 3) {
                    this._uYearTitle.setText(year + '年');
                    this._uMonthTitle.setText(month + '月');
                }
            },
            /**
             * 获取日历控件当前显示的年份。
             * @public
             *
             * @return {number} 年份(19xx-20xx)
             */
            setYear: function (year) {
                this._nYear = year;
            },

            viewCaller: function (fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                var views = [this._uYearGroup, this._uYear, this._uMonth, this._uMonthView];
                views.forEach(function (item) {
                    item[fn].apply(item, args);
                });
            }
        }
    );
//{if 0}//
})();
//{/if}//
