/*
Label - 定义事件转发的基本操作。
标签控件，继承自基础控件，将事件转发到指定的控件上，通常与 Radio、Checkbox 等控件联合使用，扩大点击响应区域。

标签控件直接HTML初始化的例子:
<div ecui="type:label;for:checkbox"></div>

属性
_cFor - 被转发的控件对象
*/
//{if 0}//
(function () {

    var core = ecui,
        ui = core.ui,
        util = core.util,

        inherits = util.inherits,

        $connect = core.$connect,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化标签控件。
     * options 对象支持的属性如下：
     * for 被转发的控件 id
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_LABEL
    var UI_LABEL =
        ui.Label = function (el, options) {
            UI_CONTROL.call(this, el, options);

            $connect(this, this.setFor, options['for']);
        },
        UI_LABEL_CLASS = inherits(UI_LABEL, UI_CONTROL);
//{else}//
    /**
     * 鼠标单击控件事件的默认处理。
     * 将点击事件转发到 setFor 方法指定的控件。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     */
    UI_LABEL_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);

        //__gzip_original__control
        var control = this._cFor;
        if (control) {
            control.click(event);
        }
    };

    /**
     * 设置控件的事件转发接收控件。
     * setFor 方法设置事件转发的被动接收者，如果没有设置，则事件不会被转发。
     * @public
     *
     * @param {ecui.ui.Control} control 事件转发接收控件
     */
    UI_LABEL_CLASS.setFor = function (control) {
        this._cFor = control;
    };
//{/if}//
//{if 0}//
})();
//{/if}//