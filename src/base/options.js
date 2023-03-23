/*
@example
<div ui="type:options">
    <div>选项一</div>
    <div>选项二</div>
    <div>选项三</div>
</div>

@fields
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 选项框控件。
     * @control
     */
    ui.Options = core.inherits(
        ui.Control,
        'ui-options',
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        var parent = this.getParent();
                        if (parent.getSelected() !== this) {
                            parent.setSelected(this);
                            core.dispatchEvent(parent, 'change', event);
                        }
                    }
                }
            ),
            $alterItems: util.blank
        },
        ui.iItems,
        ui.Control.defineProperty('selected')
    );
//{if 0}//
})();
//{/if}//
