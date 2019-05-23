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
            function (el, options) {
                dom.addClass(el, 'ui-popup ui-hide');
                _super(el, options);
            },
            {
                /**
                 * @override
                 */
                $dateclick: function (event) {
                    _super.$dateclick(event);
                    var parent = this.getParent();
                    parent.setValue(event.date);
                    core.dispatchEvent(parent, 'input', event);
                    this.hide();
                },

                /**
                 * @override
                 */
                $hide: function (event) {
                    _super.$hide(event);
                    this.$setParent();
                },

                /**
                 * @override
                 */
                $show: function (event) {
                    _super.$show(event);
                    this.$setParent(ui.Popup.getOwner());
                    this.setDate(this.getParent().getDate());
                }
            }
        );

    /**
     * 日历输入框控件。
     * 提供日期的选择输入功能，所有的日历输入框控件共享一个日历选择弹层。
     * @control
     */
    ui.CalendarInput = core.inherits(
        ui.InputControl,
        'ui-calendar-input',
        function (el, options) {
            _super(el, options);
            this.getInput().readOnly = true;
            this.setPopup(core.getSingleton(Calendar));
            dom.insertHTML(el, 'BEFOREEND', '<span class="ui-calendar-input-clear"></span>');
            this.$Clear = core.$fastCreate(this.Clear, dom.last(el), this);
        },
        {
            final: {
                $Clear: undefined
            },

            /**
             * 清除部件。
             * @unit
             */
            Clear: core.inherits(
                ui.Control,
                {
                    onclick: function (event) {
                        this.getParent().setValue('');
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            ),

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
                _super.setValue(value);
            }
        },
        ui.Popup
    );
}());
