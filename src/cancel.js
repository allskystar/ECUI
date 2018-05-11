/*
@example
<div ui="type:cancel">确认</div>
或
<button ui="type:cancel">确认</button>
或
<input ui="type:cancel" value="确认" type="button">
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 确认按钮控件。
     * 确认按钮需要置于 Dialog 对话框控件内，用于触发 Dialog 对话框的 submit 事件。
     * @control
     */
    ui.Cancel = core.inherits(
        ui.Button,
        'ui-cancel',
        {
            /**
             * @override
             */
            $click: function (event) {
                ui.Button.prototype.$click.call(this, event);
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof ui.Dialog) {
                        parent.hide();
                        return;
                    }
                }
            }
        }
    );
//{if 0}//
}());
//{/if}//
