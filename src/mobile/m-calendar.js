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
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 移动端日历输入控件。
     * @control
     */
    ui.MCalendar = core.inherits(
        ui.MMultiOptions,
        'ui-mobile-calendar',
        function (el, options) {
            ui.MMultiOptions.call(this, el, Object.assign({format: this.FORMAT}, options));

            this._uYear = this.getOptions(0);
            this._uMonth = this.getOptions(1);
            this._uDate = this.getOptions(2);
        },
        {
            // 默认的输出格式
            FORMAT: '{0}-{1}-{2}',

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
                    this._uDate.getItem(day - 1)[day <= days ? 'show' : 'hide']();
                }
                this._uDate.$alterItems();
            },

            /**
             * @override
             */
            $click: function (event) {
                ui.MMultiOptions.prototype.$click.call(this, event);
                if (dom.contain(this.getMain(), event.target)) {
                    var date = new Date();
                    if (!this._uYear.getValue()) {
                        this._uYear.setValue(date.getFullYear());
                    }
                    if (!this._uMonth.getValue()) {
                        this._uMonth.setValue(date.getMonth() + 1);
                    }
                    if (!this._uDate.getValue()) {
                        this._uDate.setValue(date.getDate());
                    }
                }
            }
        }
    );
//{if 0}//
}());
//{/if}//
