/*
@example
<div ui="type:date-range"></div>
@fields
_uText  - 时间区域表示的文本
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var RangeCalendar = core.inherits(
        ui.RangeCalendar,
        true,
        {
            MonthView: core.inherits(
                ui.RangeCalendar.prototype.MonthView,
                {
                    /**
                     * @override
                     */
                    $dateclick: function (event) {
                        ui.RangeCalendar.prototype.MonthView.prototype.$dateclick.call(this, event);
                        if (!event.item.isExtra()) {
                            var calendar = this.getParent();
                            if (calendar._oStart && calendar._oEnd) {
                                calendar.getParent().setValue(
                                    util.formatDate(calendar._oStart, 'yyyy-MM-dd') + ',' + util.formatDate(calendar._oEnd, 'yyyy-MM-dd')
                                );
                                calendar.hide();
                            }
                        }
                    }
                }
            )
        }
    );

    /**
     * 范围日期选择控件。控件的值是开始时间与结束时间，中间使用,号分隔，时间格式为yyyy-MM-dd。
     *
     * options 属性：
     * @control
     */
    ui.DateRange = core.inherits(
        ui.InputControl,
        'ui-date-range',
        function (el, options) {
            options.inputType = 'hidden';

            ui.InputControl.call(this, el, options);

            el = this.getMain();
            dom.insertHTML(el, 'beforeEnd', '<div class="' + this.getUnitClass(ui.DateRange, 'text') + '"></div>');

            this._uText = core.$fastCreate(ui.Control, el.lastChild, this);

            this.setPopup(
                core.getSingleton(RangeCalendar),
                function () {
                    this._uFrom.setDate();
                    this._uTo.setDate();
                    this.setDateRange.apply(this, this.getParent().getDate());
                }
            );

            el = options = null;
        },
        {
            /**
             * 获取日期区域。
             * @public
             *
             * @return {Array} 日期数组，分别是开始时间与结束时间的日期对象
             */
            getDate: function () {
                var value = this.getValue();
                if (value) {
                    value = value.split(',');
                    return [
                        new Date(value[0] + 'T00:00:00'),
                        new Date(value[1] + 'T00:00:00')
                    ];
                }
                return [];
            },

            /**
             * @override
             */
            init: function () {
                ui.InputControl.prototype.init.call(this);
                this.setValue(this.getInput().value);
            },

            /**
             * @override
             */
            setValue: function (value) {
                ui.InputControl.prototype.setValue.call(this, value);
                if (value) {
                    this.alterStatus('-placeholder');
                    this._uText.setContent(value.split(',').join(' 至 '));
                } else {
                    this.alterStatus('+placeholder');
                    this._uText.setContent(dom.getAttribute(this.getInput(), 'placeholder'));
                }
            }
        },
        ui.Popup
    );
//{if 0}//
})();
//{/if}//
