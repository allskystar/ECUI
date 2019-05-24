/*
@example
<div ui="type:MSendText;len:1-20">
    <input maxlength="20" type="text" placeholder="请输入">
    <input />
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,

        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined;
//{/if}//
    /**
     * 移动端文本操作控件，用于解决普通操作会导致软键盘收起的问题。
     * @control
     */
    ui.MOpText = core.inherits(
        ui.Text,
        'ui-m-op-text',
        function (el, options) {
            _super(el, options);
            var input = this.getInput();
            Array.prototype.slice.call(el.getElementsByTagName('INPUT')).forEach(
                function (item) {
                    if (item !== input) {
                        item.disabled = !!iosVersion;
                        core.$fastCreate(this.Button, item, this, {focusable: false});
                    }
                },
                this
            );
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
                        _super.$click(event);
                        core.dispatchEvent(this.getParent(), 'buttonclick', event);
                        event.exit();
                    },

                    /**
                     * @override
                     */
                    $mousedown: function (event) {
                        _super.$mousedown(event);
                        event.preventDefault();
                    }
                }
            )
        }
    );
}());