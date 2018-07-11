/*
@example
<div ui="type:m-calendar">
    <div ui="values:2000-2040;format:{0}年"></div>
    <div ui="values:1-12;format:{0}月"></div>
    <div ui="values:1-31"></div>
</div>

@fields
_uYear   - 年部件
_uMonth  - 月部件
_uDate   - 日部件
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 移动端日历输入控件控件。
     * @control
     */
    ui.MCalendar = core.inherits(
        ui.MMultiOptions,
        'ui-mobile-calendar',
        function (el, options) {
            ui.MMultiOptions.call(this, el, options);

            this._uYear = this.getOptions(0);
            this._uMonth = this.getOptions(1);
            this._uDate = this.getOptions(2);
        },
        {
            /**
             * 选项改变事件的默认处理。
             * @event
             */
            $change: function () {
                var days = new Date(+this._uYear.getValue(), +this._uMonth.getValue(), 0).getDate();
                if (this._uDate.getValue() > days) {
                    this._uDate.setValue(days);
                }
                for (var day = 28; day <= 31; day++) {
                    this._uDate._aItems[day - 1][day <= days ? 'show' : 'hide']();
                }
                this._uDate.$alterItems();
            },

            /**
             * @override
             */
            $click: function (event) {
                ui.MMultiOptions.prototype.$click.call(this, event);
                var value = this.getValue();
                if (value) {
                    value = value.split('-');
                    this._uYear.setValue(value[0]);
                    this._uMonth.setValue(+value[1]);
                    this._uDate.setValue(+value[2]);
                } else {
                    value = new Date();
                    this._uYear.setValue(value.getFullYear());
                    this._uMonth.setValue(value.getMonth() + 1);
                    this._uDate.setValue(value.getDate());
                }
                core.dispatchEvent(this, 'change');
            },

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                var month = this._uMonth.getValue(),
                    date = this._uDate.getValue();

                this.setValue(this._uYear.getValue() + '-' + (+month < 10 ? '0' + month : month) + '-' + (+date < 10 ? '0' + date : date));
            }
        }
    );
//{if 0}//
}());
//{/if}//
