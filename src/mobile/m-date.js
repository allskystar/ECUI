/*
@example
<div ui="type:m-date;year:2000-2040"></div>

@fields
_uYear   - 年部件
_uMonth  - 月部件
_uDate   - 日部件
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 移动端日历输入控件。
     * options 属性：
     * year   年份选择范围信息，参见MMultiOptions的values属性
     * @control
     */
    ui.MDate = core.inherits(
        ui.MMultiOptions,
        'ui-mobile-date',
        function (el, options) {
            if (!options.year) {
                options.year = '2000-' + new Date().getFullYear();
            }
            el.insertAdjacentHTML('afterBegin', '<div ui="values:' + options.year + ';format:{0}年"></div><div ui="values:1-12|00;format:{0}月"></div><div ui="values:1-31|00;format:{0}日"></div>');
            // if (!options.value) {
            //     options.value = util.formatDate(new Date(), 'yyyy-MM-dd');
            // }
            _super(el, Object.assign({format: this.FORMAT}, options));
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
            $change: function (event) {
                if (event.item && event.item.getParent() === this._uMonth) {
                    this._uDate.preventAlterItems();
                    var days = new Date(+this._uYear.getValue(), +this._uMonth.getValue(), 0).getDate(),
                        selecting = this._uDate.getSelecting();
                    for (var day = 28; day <= 31; day++) {
                        this._uDate.getItem(day - 1)[day <= days ? 'show' : 'hide']();
                    }
                    if (selecting) {
                        this._uDate.setSelected(selecting.isShow() ? selecting : this._uDate.getItem(days - 1));
                    }
                    this._uDate.premitAlterItems();
                    this._uDate.$alterItems();
                }
            }
        }
    );
//{if 0}//
})();
//{/if}//
