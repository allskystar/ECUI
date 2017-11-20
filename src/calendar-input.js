/*
calendar - 日历输入框控件。
日历输入框控件，继承自文本输入框控件，提供日期的选择输入功能。

日历视图控件直接HTML初始化的例子:
<div ui="type:calendar-input"></div>

属性
_eTitle        - 日历头部信息提示区

子控件属性
_uCalendar     - 日历控件
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var Calendar = core.inherits(
            ui.Calendar,
            {
                /**
                 * @override
                 */
                $dateclick: function (event, date) {
                    ui.Calendar.prototype.$dateclick.call(this, event, date);
                    this.getParent().setValue(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
                    this.hide();
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
                    var list = this.getParent().getValue().split('-');
                    this.setDate(list.length < 3 ? undefined : new Date(+list[0], +list[1] - 1, +list[2]));
                }
            }
        ),
        singleton = core.$fastCreate(Calendar, dom.create({className: Calendar.CLASS + 'ui-popup ui-hide'}));

    /**
     * 初始化日历输入框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.CalendarInput = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            ui.InputControl.call(this, el, options);
            this.getInput().readOnly = true;
            this.setPopup(singleton);
        },
        ui.Popup
    );
}());
