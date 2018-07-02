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
        dom = core.dom,
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
        },
        {
            /**
             * 获取按钮所处于的表单元素。
             * @public
             *
             * @return {HTMLElement} 表单元素
             */
            getForm: function () {
                var el = this.getMain();
                if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
                    return el.form;
                }
                for (; el; el = dom.parent(el)) {
                    if (el.tagName === 'FORM') {
                        return el;
                    }
                }
                return null;
            }
        }
    );
//{if 0}//
}());
//{/if}//
