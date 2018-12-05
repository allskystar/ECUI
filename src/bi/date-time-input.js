/*
@example
<input ui="type:b-i-date-time;name:startTime,endTime;" value="2018-12-04 12:00 - 2018-12-04 16:00" />
或
<div ui="type:BI-month-input;value:2018-10;name:time"></div>
<input ui="type:b-i-date-time;name:startTime,endTime;" value="2018-12-04 12:00 - 2018-12-04 16:00" />
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        util = core.util,
        ui = core.ui;
//{/if}//
    var FORMAT = 'yyyy-MM-dd HH:mm:ss';
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
        'ui-double-calendar-input',
        function (el, options) {
            ui.Text.call(this, el, options);
            this.getInput().readOnly = true;
            var names = (options.name || 'startTime,endTime').split(',');
            this._eStartInput = dom.insertAfter(dom.create('input', { name: names[0], readOnly: true, className: ' ui-hide' }), this.getInput());
            this._eEndInput = dom.insertAfter(dom.create('input', { name: names[1], readOnly: true, className: ' ui-hide' }), this.getInput());
            this._bRequired = !!options.required;
            this._sValue = options.value || this.getInput().value;
            var optionsEl = dom.create('DIV', {className: options.classes.join('-options ') + 'ui-popup ui-hide'});
            this._uOptions = ecui.$fastCreate(this.Options, optionsEl, this, {focusable: false});
            this.setPopup(this._uOptions);
        },
        {
            FORMAT: 'yyyy-MM-dd HH:mm:ss',
            Options: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._uCalendar = ecui.$fastCreate(this.DoubleCalendar, el.appendChild(dom.create('DIV', {className: ui.Calendar.CLASS})), this, { extra: 'disable' });
                    this._uTimeCalendar = ecui.$fastCreate(this.TimeCalendar, el.appendChild(dom.create('DIV', {className: ' ui-time-calendar ui-hide'})), this, {value: '00:00'});

                    var calendarHandle = dom.create('DIV', {className: 'options-content'});
                    calendarHandle.innerHTML = '<div class="time-box">' +
                                                    '<div class="toggle-btn">选择时间</div>' +
                                                '</div>' +
                                                '<div class="handle-box">' +
                                                    '<div class="clear">清除</div>' +
                                                    '<div class="submit">确定</div>' +
                                                '</div>';
                    this._uSwitch =  ecui.$fastCreate(this.Switch, dom.first(dom.first(calendarHandle)), this, {value: '00:00:00'});
                    ecui.$fastCreate(this.Clear, dom.first(dom.last(calendarHandle)), this);
                    ecui.$fastCreate(this.CalendarSubmit, dom.last(dom.last(calendarHandle)), this);
                    el.appendChild(calendarHandle);
                },
                {
                    DoubleCalendar: ecui.inherits(
                        ui.Calendar,
                        function (el, options) {
                            ui.Calendar.call(this, el, options);
                            this._aNextCells = this.$initView(options);
                        },
                        {
                            /**
                             * 日期点击事件。
                             * event 属性
                             * date  点击的日期
                             * @event
                             */
                            $dateclick: function (event) {
                                if (this._cSelected !== event.item && this._eSelected !== event.item) {
                                    if (this._cSelected && this._eSelected) {
                                        if (event.date < this._oDate) {
                                            this._eSelected.alterStatus('-selected');
                                            // 设置结束时间 = 起始时间
                                            this._eDate = this._oDate;
                                            this._eSelected = this._cSelected;
                                            // 设置起始时间 = 当前选中时间
                                            this._oDate = event.date;
                                            this._cSelected = event.item;

                                        } else if (event.date > this._eDate) {
                                            this._cSelected.alterStatus('-selected');
                                            // 设置起始时间 = 结束时间
                                            this._oDate = this._eDate;
                                            this._cSelected = this._eSelected;
                                            // 设置起始时间 = 当前选中时间
                                            this._eDate = event.date;
                                            this._eSelected = event.item;

                                        } else {
                                            if (this._eDate - event.date > event.date - this._oDate) { // 当前时间 离开始时间近
                                                // 去掉结束时间
                                                this._eSelected.alterStatus('-selected');
                                                // 设置起始时间 = 当前选中时间
                                                this._eDate = event.date;
                                                this._eSelected = event.item;

                                            } else { // 当前时间 离结束时间近
                                                // 去掉开始时间
                                                this._cSelected.alterStatus('-selected');
                                                // 设置起始时间 = 当前选中时间
                                                this._oDate = event.date;
                                                this._cSelected = event.item;

                                            }
                                        }


                                    } else if (this._cSelected) { // 起始时间存在，结束时间为null
                                        this._eSelected = event.item;
                                        this._eDate =  event.date;
                                    } else { // 起始时间为null，结束时间为null
                                        this._cSelected = event.item;
                                        this._oDate =  event.date;
                                    }
                                    // 添加当前时间的选中效果
                                    event.item.alterStatus('+selected');
                                }
                            },
                            getEndDate: function () {
                                return this._eDate || this._oDate;
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
                                var start = this.getParent()._eStartInput.value;
                                this.setDate(start ? new Date(start.replace(' ', 'T')) : new Date());

                            },
                            setTitle: function (year, month) {
                                var next = new Date(year, month, 1);
                                this.getTitle().innerHTML = '<span>' + util.stringFormat(this.TITLEFORMAT, year, month) + '</span><span>' + util.stringFormat(this.TITLEFORMAT, next.getFullYear(), next.getMonth() + 1) + '</span>';
                            },
                            setView: function (year, month) {
                                ui.Calendar.prototype.setView.call(this, year, month + 1, this._aNextCells);
                                ui.Calendar.prototype.setView.call(this, year, month);
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
                                    innerHTML: minute.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
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
                                    innerHTML: minute.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
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
                                    this.getMain().innerHTML = '选择日期';
                                } else {
                                    this.status = 'date';
                                    parent._uCalendar.show();
                                    parent._uTimeCalendar.hide();
                                    this.getMain().innerHTML = '选择时间';
                                }
                            },
                            /**
                             * 设置按钮状态。
                             * @public
                             *
                             */
                            setStatus: function (status) {
                                this.status = status;
                                this.getMain().innerHTML = (status === 'date' ? '选择时间' : '选择日期');
                            }
                        }
                    ),
                    Clear: ecui.inherits(
                        ui.Control,
                        function (el, options) {
                            ui.Control.call(this, el, options);
                        },
                        {
                            onclick: function () {
                                var parent = this.getParent();
                                parent.getParent().setValue('');
                                parent._uCalendar._cSelected.alterStatus('-selected');
                                parent._uCalendar._eSelected.alterStatus('-selected');
                                parent._uCalendar._oDate = null;
                                parent._uCalendar._eDate = null;
                                parent._uCalendar._cSelected = null;
                                parent._uCalendar._eSelected = null;
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
                                    date = uCalendar.getDate() || new Date(),
                                    endDate = uCalendar.getEndDate() || uCalendar.getDate() || new Date(),
                                    hour = uTimeCalendar._uStartHouer.getSelected().getValue(),
                                    minute = uTimeCalendar._uStartMinute.getSelected().getValue(),
                                    ehour = uTimeCalendar._uEndHouer.getSelected().getValue(),
                                    eminute = uTimeCalendar._uEndMinute.getSelected().getValue();
                                date = new Date(date.setHours(hour, minute, 0));
                                endDate = new Date(endDate.setHours(ehour, eminute, 0));
                                uTimePicker.setValue(toDateString(date) + ' - ' + toDateString(endDate));
                                ecui.dispatchEvent(uTimePicker, 'input', event);
                                this.getParent().hide();
                            }
                        }
                    ),
                    $show: function (event) {
                        ui.Control.prototype.$show.call(this, event);
                        ecui.dispatchEvent(this._uCalendar, 'show', event);
                        // ecui.dispatchEvent(this._uTime, 'show', event);
                    },
                    /**
                     * @override
                     */
                    $hide: function (event) {
                        ui.Control.prototype.$hide.call(this, event);
                        this._uTimeCalendar.hide();
                        this._uSwitch.setStatus('date');
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
                    this.setValue(this._sValue);
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
                this.setValue(this, sdate + ' - ' + date);
            },
            /**
             * @override
             */
            setValue: function (value) {
                ui.Text.prototype.setValue.call(this, value);
                this._eStartInput.value = value.split(' - ')[0];
                this._eEndInput.value = value.split(' - ')[1];
            }
        },
        ui.Popup
    );
}());