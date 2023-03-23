/*
@example
<div ui="type:m-multilevel-select">
    <ul name="province"></ul>
    <ul name="city"></ul>
</div>

@fields
_aSelect - 全部的下拉框控件列表
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui;
//{/if}//
    /**
     * 移动端多级联动选择控件。
     * @control
     */
    ui.MCascader = core.inherits(
        ui.Multilevel,
        'ui-mobile-cascader',
        function (el, options) {
            _super(el, options);
            dom.children(el).forEach(
                function (item) {
                    item.className += this.Options.CLASS + ' ui-hide';
                    core.$fastCreate(this.Options, item, this);
                },
                this
            );
        },
        {
            /**
             * 选择框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Options,
                {
                    /**
                     * @override
                     */
                    alterItems: function () {
                        if (this.isInited()) {
                            if (this.getLength()) {
                                if (this.show()) {
                                    effect.grade('this.style.left=#100->0%#', 400, this.getMain());
                                }
                            } else {
                                this.hide();
                            }
                        }
                        _super.alterItems();
                    }
                }
            )
        }
    );
//{if 0}//
})();
//{/if}//
