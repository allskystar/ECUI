/*
Button - 定义按钮的基本操作。
按钮控件，继承自基础控件，屏蔽了激活状态的向上冒泡，并且在激活(active)状态下鼠标移出控件区域会失去激活样式，移入控件区域再次获得激活样式，按钮控件中的文字不可以被选中。

按钮控件直接HTML初始化的例子:
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

属性
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化按钮。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
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
