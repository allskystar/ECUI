/*
Button - 定义按钮的基本操作。
按钮控件在激活(active)状态下鼠标移出控件区域会失去激活样式，移入控件区域再次获得激活样式。

按钮控件直接HTML初始化的例子，id指定名称，可以通过ecui.get(id)的方式访问控件:
<div ecui="type:button;id:demo">
    <!-- 这里放按钮的文字 -->
    ...
</div>

属性
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,

        setText = dom.setText,

        inheritsControl = core.inherits,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    ///__gzip_original__UI_BUTTON
    ///__gzip_original__UI_BUTTON_CLASS
    /**
     * 初始化基础控件。
     * options 对象支持的属性如下：
     * text 按钮的文字
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_BUTTON = ui.Button =
        inheritsControl(
            UI_CONTROL,
            'ui-button',
            function (el, options) {
                if (options.text) {
                    this.setText(options.text);
                }
            }
        ),
        UI_BUTTON_CLASS = UI_BUTTON.prototype;
//{else}//
    /**
     * 按钮控件获得激活时需要阻止事件的冒泡。
     * @override
     */
    UI_BUTTON_CLASS.$activate = function (event) {
        UI_CONTROL_CLASS.$activate.call(this, event);
        event.stopPropagation();
    };

    /**
     * 如果控件处于激活状态，移除状态样式 -active，移除状态样式不失去激活状态。
     * @override
     */
    UI_BUTTON_CLASS.$mouseout = function (event) {
        UI_CONTROL_CLASS.$mouseout.call(this, event);
        if (this.isActived()) {
            this.alterClass('-active', true);
        }
    };

    /**
     * 如果控件处于激活状态，添加状态样式 -active。
     * @override
     */
    UI_BUTTON_CLASS.$mouseover = function (event) {
        UI_CONTROL_CLASS.$mouseover.call(this, event);
        if (this.isActived()) {
            this.alterClass('+active');
        }
    };

    /**
     * 设置控件的文字。
     * @public
     *
     * @param {string} text 控件的文字
     */
    UI_BUTTON_CLASS.setText = function (text) {
        setText(this.getBody(), text);
    };
//{/if}//
//{if 0}//
})();
//{/if}//