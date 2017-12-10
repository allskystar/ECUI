/*
@example
<div ui="type:button">
    <!-- 这里放按钮的文字 -->
    ...
</div>
或
<button ui="type:button">
    <!-- 这里放按钮的文字 -->
    ...
</button>
或
<input ui="type:button" value="按钮文字" type="button">
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 按钮控件。
     * 缺省设置不可选中内容。
     * @control
     */
    ui.Button = core.inherits(
        ui.Control,
        'ui-button',
        function (el, options) {
            util.setDefault(options, 'userSelect', false);
            ui.Control.call(this, el, options);
        }
    );
//{if 0}//
}());
//{/if}//
