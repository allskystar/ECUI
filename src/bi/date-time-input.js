/*
@example
<input ui="type:b-i-date-time;" value="2018-12-04 12:00:00" />
或
<div ui="type:b-i-date-time;value:2018-12-04 12:00:00" ></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        util = core.util,
        ui = core.ui;
//{/if}//
    var safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;

    /**
     * 日历输入框控件。
     * 提供日期的选择输入功能，所有的日历输入框控件共享一个日历选择弹层。
     * @control
     */
    ui.BDateTime = core.inherits(
        ui.Text,
        'ui-date-time-input',
        function (el, options) {
            options = Object.assign(options, { 'readOnly': true });

            ui.Text.call(this, el, options);

            this._bRequired = !!options.required;
            this._sValue = options.value || this.getInput().value;
            var optionsEl = dom.create('DIV', {className: this.getUnitClass(ui.BDateTime, 'options ') + 'ui-popup ui-hide'});
            this._uOptions = ecui.$fastCreate(this.Options, optionsEl, this, { focusable: false, value: this._sValue});
            this.setPopup(this._uOptions);
        },
        {
            FORMAT: 'yyyy-MM-dd HH:mm:ss',
            Options: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);

                    this._uCalendar = ecui.$fastCreate(this.Calendar, el.appendChild(dom.create('DIV', {className: ui.Calendar.CLASS})), this, { extra: 'disable', date: options.value.split(' ')[0] });
                    this._uTimeCalendar = ecui.$fastCreate(this.TimeCalendar, el.appendChild(dom.create('DIV', {className: ' ui-time-calendar ui-hide'})), this, { value: options.value });
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
                    Calendar: ecui.inherits(
                        ui.Calendar,
                        {
                            /**
                             * 日期点击事件。
                             * event 属性
                             * date  点击的日期
                             * @event
                             */
                            ondateclick: function (event) {
                                ecui.dispatchEvent(this.getParent()._uSwitch, 'click');
                            },
                            onshow: function () {
                                this.show();
                            }
                        }
                    ),
                    TimeCalendar: ecui.inherits(
                        ui.Control,
                        'ui-time-calendar',
                        function (el, options) {
                            ui.Control.call(this, el, options);

                            var houer = [], minute = [], second = [], item;
                            for (var i = 0; i < 24; i++) {
                                item = ('0' + i).slice(-2);
                                houer.push({ code: item, value: item });
                                if (i * this.RANGE <= 60) {
                                    item = ('0' + i * this.RANGE).slice(-2);
                                    if (item === '60') {
                                        item = '59';
                                    }
                                    minute.push({ code: item, value: item });
                                    second.push({ code: item, value: item });
                                }
                            }
                            function amend(numStr, RANGE) {
                                var num = +numStr % RANGE;
                                return num ? ('0' + (+numStr - num)).slice(-2) : numStr;
                            }
                            // replace(' ', 'T')处理是为了兼容 safari 浏览器上 new Date('2019-04-04 00:00:00') 不生效的问题
                            var date = options.value ? new Date(safariVersion ? options.value.replace(' ', 'T') : options.value) : new Date();
                            // 生成日历控件结构
                            dom.insertHTML(
                                el,
                                'AFTERBEGIN',
                                '<div class="' + this.getClass() + '-header "><div class="">时间</div></div>'
                            );

                            this._uHouer = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: houer.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this,
                                {
                                    value: date ? util.formatDate(date, 'HH') : '00'
                                }
                            );
                            this._uMinute = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: minute.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this,
                                {
                                    value: date ? amend(util.formatDate(date, 'mm'), this.RANGE) : '00'
                                }
                            );
                            this._uSecond = ecui.$fastCreate(
                                this.Listbox,
                                el.appendChild(dom.create('div', {
                                    className: 'ui-listbox',
                                    innerHTML: second.map(function (item) { return '<div ui="value:' + item.value + '">' + item.code + '</div>'; }).join('')
                                })),
                                this,
                                {
                                    value: date ? amend(util.formatDate(date, 'ss'), this.RANGE) : '00'
                                }
                            );
                        },
                        {
                            RANGE: 5,
                            Listbox: ecui.inherits(
                                ui.Listbox,
                                function (el, options) {
                                    ui.Listbox.call(this, el, options);
                                    this._sValue = options.value;
                                },
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
                                    onready: function () {
                                        var hasValue = false;
                                        this.getItems().forEach(function (item) {
                                            if (item.getValue() === this._sValue) {
                                                hasValue = true;
                                                this.setSelected(item);
                                            }
                                        }.bind(this));

                                        if (!hasValue) {
                                            this.setSelected(this.getItem(0));
                                        }
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
                            ),
                            /**
                             * @override
                             */
                            $ready: function (event) {
                                ui.Control.prototype.$ready.call(this, event);

                                core.dispatchEvent(this._uHouer, 'ready', event);
                                core.dispatchEvent(this._uMinute, 'ready', event);
                                core.dispatchEvent(this._uSecond, 'ready', event);
                            }
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
                                if (parent._uCalendar._cSelected) {
                                    parent._uCalendar._cSelected.alterStatus('-selected');
                                }
                                parent._uCalendar._cSelected = null;
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
                                    uCalendar = uParent._uCalendar,
                                    uTimeCalendar = uParent._uTimeCalendar,
                                    uTimePicker = uParent.getParent(),
                                    date = uCalendar.getDate(),
                                    hour = uTimeCalendar._uHouer.getSelected().getValue(),
                                    minute = uTimeCalendar._uMinute.getSelected().getValue(),
                                    second = uTimeCalendar._uSecond.getSelected().getValue();

                                date = new Date(date.setHours(hour, minute, second));
                                uTimePicker.setValue(uCalendar.getSelected() ? util.formatDate(date, uTimePicker.FORMAT) : '');
                                ecui.dispatchEvent(uTimePicker, 'input', event);
                                this.getParent().hide();
                            }
                        }
                    ),
                    /**
                     * @override
                     */
                    $ready: function (event) {
                        ui.Control.prototype.$ready.call(this, event);

                        core.dispatchEvent(this._uCalendar, 'ready', event);
                        core.dispatchEvent(this._uTimeCalendar, 'ready', event);
                    },
                    $show: function (event) {
                        ui.Control.prototype.$show.call(this, event);
                        ecui.dispatchEvent(this._uCalendar, 'show', event);
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
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);

                core.dispatchEvent(this._uOptions, 'ready', event);
            },
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
            $validate: function () {
                ui.Text.prototype.$validate.call(this);
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
            }
        },
        ui.Popup
    );
}());