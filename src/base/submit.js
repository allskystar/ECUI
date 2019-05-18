/*
@example
<div ui="type:submit">确认</div>
或
<button ui="type:submit">确认</button>
或
<input ui="type:submit" type="button" value="确认">
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
    ui.Submit = core.inherits(
        ui.Button,
        'ui-submit',
        {
            /**
             * @override
             */
            $click: function (event) {
                _super.$click(event);
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof ui.Dialog) {
                        core.dispatchEvent(parent, 'submit', event);
                        return;
                    }
                }
            }
        }
    );
//{if 0}//
}());
//{/if}//
