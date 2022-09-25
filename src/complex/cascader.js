/*
@example
<div ui="type:cascader">
    <div name="province"></div>
    <div name="city"></div>
</div>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 级联(层叠)选择控件。
     * @control
     */
    ui.Cascader = core.inherits(
        ui.Multilevel,
        'ui-cascader',
        function (el, options) {
            dom.children(el).forEach(function (el) {
                dom.addClass(el, this.getUnitClass(ui.Cascader, 'options'));
                core.$fastCreate(this.Options, el, this);
            }, this);

            ui.Multilevel.call(this, el, options);
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Options,
                {
                    /**
                     * @override
                     */
                    add: function (item, index) {
                        ui.Options.prototype.add.call(this, item, index);
                        dom.removeClass(this.getMain(), 'ui-hide');
                    },

                    /**
                     * @override
                     */
                    removeAll: function (dispose) {
                        ui.Options.prototype.removeAll.call(this, dispose);
                        dom.addClass(this.getMain(), 'ui-hide');
                    }
                }
            )
        },
        ui.Popup
    );
//{if 0}//
})();
//{/if}//
