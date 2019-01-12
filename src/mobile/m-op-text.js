/*
@example
<div ui="type:MSendText;len:1-20">
    <input maxlength="20" type="text" placeholder="请输入">
    <input disabled />
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 移动端文本操作控件，用于解决普通操作会导致软键盘收起的问题。
     * @control
     */
    ui.MOpText = core.inherits(
        ui.Text,
        'ui-m-op-text',
        function (el, options) {
            ui.Text.call(this, el, options);
            Array.prototype.slice.call(el.getElementsByTagName('INPUT')).forEach(function (item) {
                if (item.disabled) {
                    core.$fastCreate(this.Button, item, this, {focusable: false});
                }
            });
        },
        {
            /**
             * 操作按钮部件。
             * @unit
             */
            Button: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Control.prototype.$click.call(this, event);
                        core.dispatchEvent(this.getParent(), 'buttonclick', event);
                        event.exit();
                    }
                }
            )
        }
    );
}());