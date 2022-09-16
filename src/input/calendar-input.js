/*
@example
<div ui="type:calendar-input;name:calendar;placeholder:请输入"></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var Calendar = core.inherits(
            ui.Calendar,
            true,
            {
                /**
                 * @override
                 */
                $dateclick: function (event) {
                    ui.Calendar.prototype.$dateclick.call(this, event);
                    var parent = this.getParent();
                    parent.setValue(event.date);
                    core.dispatchEvent(parent, 'input', event);
                    this.hide();
                }
            }
        );

    /**
     * 日历输入框控件。
     * 提供日期的选择输入功能，所有的日历输入框控件共享一个日历选择弹层。
     * @control
     */
    ui.CalendarInput = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            ui.Text.call(this, el, options);
            this.getInput().readOnly = true;

            options = Object.assign(
                    {},
                    {
                        extra: options.extra !== 'disable',
                        begin: options.begin ? new Date(options.begin + ' 00:00:00') : undefined,
                        end: options.end ? new Date(options.end + ' 00:00:00') : undefined,
                    }
                );

            this.setPopup(
                core.getSingleton(Calendar),
                function () {
                    this.setExtraCapture(options.extra);
                    this.setRange(options.begin, options.end);
                    this.setDate(this.getParent().getDate());
                }
            );

            el = null;
        },
        {
            /**
             * 获取日期对象。
             * @public
             *
             * @return {Date} 控件对象
             */
            getDate: function () {
                var list = this.getValue().split('-');
                return list.length < 3 ? undefined : new Date(+list[0], +list[1] - 1, +list[2]);
            },

            /**
             * @override
             */
            setValue: function (value) {
                if ('number' === typeof value) {
                    value = new Date(value);
                }
                if (value instanceof Date) {
                    value = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2);
                }
                ui.Text.prototype.setValue.call(this, value);
            }
        },
        ui.Popup
    );
}());
