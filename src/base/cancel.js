/*
@example
<div ui="type:cancel">取消</div>
或
<button ui="type:cancel">取消</button>
或
<input ui="type:cancel" type="button" value="取消">
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
                _super.$click(event);
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (ui.Dialog.isInstance(parent)) {
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
