/*
@example
<div ui="type:date;name:calendar;placeholder:请输入"></div>

@field
_oOptions    参数
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    var Calendar = core.inherits(
        ui.Calendar,
        true,
        {
            /**
             * @override
             */
            $dateclick: function (event) {
                _super.$dateclick(event);
                if (event.returnValue !== false) {
                    var owner = this.getParent();
                    owner.setValue(event.date);
                    core.dispatchEvent(owner, 'input', event);
                    this.hide();
                }
            }
        }
    );

    /**
     * 日历输入框控件。
     * 提供日期的选择输入功能，所有的日历输入框控件共享一个日历选择弹层。
     * @control
     */
    ui.Date = core.inherits(
        ui.Text,
        'ui-date',
        function (el, options) {
            options.readOnly = true;
            _super(el, options);
            this._oOptions = {
                extra: options.extra !== 'disable',
                begin: options.begin ? new Date((options.begin === 'TODAY' ? util.formatDate(new Date(), 'yyyy-MM-dd') : options.begin) + ' 00:00:00') : undefined,
                end: options.end ? new Date((options.end === 'TODAY' ? util.formatDate(new Date(), 'yyyy-MM-dd') : options.end) + ' 00:00:00') : undefined
            };
            this.setPopup(core.getSingleton(Calendar));
            el = null;
        },
        {
            PLACEHOLDER: '请选择',
            ERROR_MINLENGTH1: '请选择{Name}',

            /**
             * 初始化弹出层，单例对象一定要做这个操作。
             * @protected
             *
             * @param {ecui.ui.Control} 弹出层控件
             */
            $initPopup: function (popup) {
                popup.setExtraCapture(this._oOptions.extra);
                popup.setRange(this._oOptions.begin, this._oOptions.end);
                popup.setDate(popup.getParent().getDate());
            },

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
                if (typeof value === 'number') {
                    value = new Date(value);
                }
                if (value instanceof Date) {
                    value = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2);
                }
                _super.setValue(value);
            }
        },
        ui.iPopup
    );
})();
