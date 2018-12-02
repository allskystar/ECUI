/*
@example
<input ui="type:BI-month-input" value="2018-10" name="time" />
或
<div ui="type:BI-month-input;value:2018-10;name:time"></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        util = core.util,
        FORMAT = 'yyyy-MM-dd HH:mm',
        ui = core.ui;
//{/if}//

    function addZero(number) {
        return number < 10 ? '0' + number : number;
    }
    /**
     * 转换成时间字符串。
     * @public
     * @override
     */
    function toDateString(date) {
        if ('number' === typeof date) {
            date = new Date(date);
        }
        if (date instanceof Date) {
            date = date.pattern(FORMAT);
        }
        return date;
    }
    /**
     * 日历输入框控件。
     * 提供日期的选择输入功能，所有的日历输入框控件共享一个日历选择弹层。
     * @control
     */
    ui.BIDateTime = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            ui.Text.call(this, el, options);
            this.getInput().readOnly = true;
            this._bRequired = !!options.required;
            this._sValue = options.value;
            var optionsEl = ecui.dom.create('DIV', {className: options.classes.join('-options ') + 'ui-popup ui-hide'});
            this._uOptions = ecui.$fastCreate(this.Options, optionsEl, this, {focusable: false});
            this.setPopup(this._uOptions);
        },
        {
            FORMAT: 'yyyy-MM-dd HH:mm',
            Options: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._uCalendar = ecui.$fastCreate(this.Calendar, el.appendChild(ecui.dom.create('DIV', {className: ui.Calendar.CLASS})), this);
                    this._uTimeCalendar = ecui.$fastCreate(this.TimeCalendar, el.appendChild(ecui.dom.create('DIV', {className: ' ui-time-calendar ui-hide'})), this, {value: '00:00'});

                    var calendarHandle = ecui.dom.create('DIV', {className: 'options-content'});
                    calendarHandle.innerHTML = '<div class="time-box">' +
                                                    '<div class="time-title">选择时间</div>' +
                                                '</div>' +
                                                '<div class="handle-box">' +
                                                    '<div class="select-today">清除</div>' +
                                                    '<div class="handle-submit">确定</div>' +
                                                '</div>';
                    this._uSwitch =  ecui.$fastCreate(this.Switch, dom.first(dom.first(calendarHandle)), this, {value: '00:00:00'});
                    ecui.$fastCreate(this.SelectToday, dom.first(dom.last(calendarHandle)), this);
                    ecui.$fastCreate(this.CalendarSubmit, dom.last(dom.last(calendarHandle)), this);
                    el.appendChild(calendarHandle);
                },
                {
                    Calendar: ecui.inherits(
                        ui.Calendar,
                        {
                            /**
                             * 日期点击事件。
                             * event 属性
                             * date  点击的日期
                             * @event
                             */
                            $dateclick: function (event) {
                                // 解除起始时间的选中效果
                                if (this._sSelected) {
                                    this._sSelected.alterStatus('-selected');
                                }
                                this._sDate = this._oDate;
                                this._sSelected = this._cSelected;

                                // 添加当前选中时间的选中效果
                                this._oDate = event.date;
                                if (this._cSelected !== event.item) {
                                    // if (this._cSelected) {
                                    //     this._cSelected.alterStatus('-selected');
                                    // }

                                    if (event.item) {
                                        event.item.alterStatus('+selected');
                                    }
                                    this._cSelected = event.item;
                                }
                            },
                            getSDate: function () {
                                return this._sDate || this._oDate;
                            },
                            /**
                             * @override
                             */
                            $hide: function (event) {
                                ui.Calendar.prototype.$hide.call(this, event);
                                this.$setParent();
                            },

                            /**
                             * @override
                             */
                            $show: function (event) {
                                ui.Calendar.prototype.$show.call(this, event);
                                this.$setParent(ui.Popup.getOwner());
                                this.setDate(this.getParent().getDate());

                            }
                        }
                    ),
                    TimeCalendar: ecui.inherits(
                        ui.Control,
                        'ui-time-calendar',
                        function (el, options) {
                            ui.Control.call(this, el, options);

                            var houer = [], minute = [], item;
                            for (var i = 0; i < 24; i++) {
                                item = ('0' + i).slice(-2);
                                houer.push({ code: item, value: item });
                                if (i * this.RANGE <= 60) {
                                    item = ('0' + i * this.RANGE).slice(-2);
                                    minute.push({ code: item, value: item });
                                }
                            }
                            // 生成日历控件结构
                            dom.insertHTML(
                                el,
                                'AFTERBEGIN',
                                '<div class="' + options.classes.join('-header ') + '"><div class="">开始时间</div><div class="">结束时间</div></div>'
                            );
                            this._uStartHouer = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: houer.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this
                            );
                            this._uStartMinute = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: houer.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this
                            );
                            this._uEndHouer = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: houer.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this
                            );
                            this._uEndMinute = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: houer.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this
                            );
                        },
                        {
                            RANGE: 5,
                            Listbox: ecui.inherits(
                                ui.Listbox,
                                {
                                    Item: ecui.inherits(
                                        ecui.ui.Listbox.prototype.Item,
                                        {
                                            $click: function (event) {
                                                var parent = this.getParent();
                                                ui.Item.prototype.$click.call(this, event);
                                                parent.setSelected(this);
                                                core.dispatchEvent(parent, 'change', event);
                                            }
                                        }
                                    ),
                                    $change: function (event) {
                                        // console.log(event);
                                    },
                                    onready: function () {
                                        this.setSelected(this.getItem(0));
                                    },

                                    /**
                                     * 改变下拉框当前选中的项。
                                     * @private
                                     *
                                     * @param {ecui.ui.Select.Item} item 新选中的项
                                     */
                                    setSelected: function (item) {
                                        item = item || null;
                                        if (item !== this._cSelected) {
                                            if (this._cSelected) {
                                                this._cSelected.alterStatus('-selected');
                                            }
                                            if (item) {
                                                item.alterStatus('+selected');
                                            }
                                            this._cSelected = item;
                                        }
                                    },
                                    getSelected: function () {
                                        return this._cSelected;
                                    }
                                }
                            )
                        }
                    ),
                    Switch: ecui.inherits(
                        ui.Control,
                        {
                            status: 'date',
                            onclick: function () {
                                var parent = this.getParent();
                                if (this.status === 'date') {
                                    this.status = 'time';
                                    parent._uCalendar.hide();
                                    parent._uTimeCalendar.show();
                                } else {
                                    this.status = 'date';
                                    parent._uCalendar.show();
                                    parent._uTimeCalendar.hide();
                                }
                            }
                        }
                    ),
                    SelectToday: ecui.inherits(
                        ui.Control,
                        function (el, options) {
                            ui.Control.call(this, el, options);
                        },
                        {
                            onclick: function () {
                                var parent = this.getParent();
                                parent._uCalendar.setDate(new Date());
                            }
                        }
                    ),
                    CalendarSubmit: ecui.inherits(
                        ui.Control,
                        function (el, options) {
                            ui.Control.call(this, el, options);
                        },
                        {
                            onclick: function (event) {
                                var uParent = this.getParent(),
                                    uTimePicker = uParent.getParent(),
                                    uCalendar = uParent._uCalendar,
                                    uTimeCalendar = uParent._uTimeCalendar,
                                    sdate = uCalendar.getSDate() || uCalendar.getDate() || new Date(),
                                    date = uCalendar.getDate() || new Date(),
                                    shour = uTimeCalendar._uStartHouer.getSelected().getValue(),
                                    sminute = uTimeCalendar._uStartMinute.getSelected().getValue(),
                                    hour = uTimeCalendar._uEndHouer.getSelected().getValue(),
                                    minute = uTimeCalendar._uEndMinute.getSelected().getValue();
                                sdate.setHours(shour, sminute, 0);
                                date.setHours(hour, minute, 0);
                                uTimePicker.setValue(toDateString(sdate) + ' - ' + toDateString(date));
                                ecui.dispatchEvent(uTimePicker, 'input', event);
                                this.getParent().hide();
                                uTimeCalendar.hide();
                            }
                        }
                    ),
                    $show: function (event) {
                        ui.Text.prototype.$show.call(this, event);
                        ecui.dispatchEvent(this._uCalendar, 'show', event);
                        // ecui.dispatchEvent(this._uTime, 'show', event);
                    }
                }
            ),
            /**
             * @override
             */
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                this.getPopup().hide();
            },
            /**
             * @override
             */
            $ready: function (options) {
                ui.Text.prototype.$ready.call(this, options);
                if (this._sValue) {
                    this.setValue(+this._sValue);
                }
            },
            /**
             * @override
             */
            $validate: function () {
                ui.InputControl.prototype.$validate.call(this);
                if (!this.getDate() && this._bRequired) {
                    ecui.dispatchEvent(this, 'error');
                    return false;
                }
            },
            /**
             * 获取日期对象。
             * @public
             *
             * @return {Date} 时间对象
             */
            getDate: function () {
                var list = this.getValue().split(' ')[0].split('-');
                return list.length < 3 ? undefined : new Date(+list[0], +list[1] - 1, +list[2]);
            },
            /**
             * 获取时间。
             * @public
             *
             * @return {Date} 控件对象
             */
            getTime: function () {
                return this.getValue().split(' ')[1];
            },
            /**
             * 设置起始时间。
             * @public
             * @override
             */
            setDate: function (sdate, date) {
                if ('number' === typeof sdate) {
                    sdate = new Date(sdate);
                }
                if (sdate instanceof Date) {
                    sdate = sdate.pattern(this.FORMAT);
                }
                if ('number' === typeof date) {
                    date = new Date(date);
                }
                if (date instanceof Date) {
                    date = date.pattern(this.FORMAT);
                }
                ui.Text.prototype.setValue.call(this, sdate + ' - ' + date);
            },
            /**
             * @override
             */
            setValue: function (value) {
                ui.Text.prototype.setValue.call(this, value);
            }
        },
        ui.Popup
    );
}());