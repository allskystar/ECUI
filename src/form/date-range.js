//{if $css}//
ecui.__ControlStyle__('\
.ui-date-range {\
    input {\
        position: relative !important;\
        display: none !important;\
        left: -12px !important;\
        width: 10px !important;\
        opacity: 0 !important;\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:date-range"></div>
@fields
_uText  - 时间区域表示的文本
*/
(function () {
//{if 0}//
    var core = ecui,
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
                        _super.$dateclick(event);
                        if (!event.item.isExtra()) {
                            var calendar = this.getParent();
                            if (calendar._oStart && calendar._oEnd) {
                                calendar.getParent().setValue(
                                    util.formatDate(calendar._oStart, 'yyyy-MM-dd') + ',' + util.formatDate(calendar._oEnd, 'yyyy-MM-dd')
                                );
                                event.start = calendar._oStart;
                                event.end = calendar._oEnd;
                                ecui.dispatchEvent(calendar.getParent(), 'change', event);
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
     * begin 开始时间
     * end 结束时间
     * @control
     */
    ui.DateRange = core.inherits(
        ui.Text,
        'ui-date-range',
        function (el, options) {
            options.inputType = 'text';
            _super(el, options);
            el = this.getMain();
            el.insertAdjacentHTML('beforeEnd', '<div class="' + this.getUnitClass(ui.DateRange, 'text') + '"></div>');
            if (options.begin) {
                this._oBegin = new Date((options.begin === 'TODAY' ? util.formatDate(new Date(), 'yyyy-MM-dd') : options.begin) + ' 00:00:00');
            }
            if (options.end) {
                this._oEnd = new Date((options.end === 'TODAY' ? util.formatDate(new Date(), 'yyyy-MM-dd') : options.end) + ' 00:00:00');
            }
            this._uText = core.$fastCreate(ui.Control, el.lastChild, this);
            this.setPopup(core.getSingleton(RangeCalendar));
            el = options = null;
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
                popup.$getSection('From').setDate();
                popup.$getSection('To').setDate();
                popup.setRange(this._oBegin, this._oEnd);
                popup.setDateRange.apply(popup, popup.getParent().getDate());
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.setValue(this.getValue());
            },

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
            setValue: function (value) {
                _super.setValue(value);
                if (value) {
                    this.alterStatus('-placeholder');
                    this._uText.setContent(value.split(',').join(' 至 '));
                } else {
                    this.alterStatus('+placeholder');
                    this._uText.setContent(this.getInput().getAttribute('placeholder'));
                }
            }
        },
        ui.iPopup
    );
})();
