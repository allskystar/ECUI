/*
Label - 定义事件转发的基本操作。
标签控件，继承自基础控件，将事件转发到指定的控件上，通常与 Radio、Checkbox 等控件联合使用，扩大点击响应区域。

标签控件直接HTML初始化的例子:
<div ui="type:label;for:checkbox"></div>

属性
_cFor - 被转发的控件对象
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate', 'keydown', 'keypress', 'keyup', 'mousewheel'];
//{/if}//
    /**
     * 初始化标签控件。
     * options 对象支持的属性如下：
     * for 被转发的控件 id
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Label = core.inherits(
        ui.Control,
        'ui-label',
        function (el, options) {
            ui.Control.call(this, el, options);
            core.delegate(options['for'], this, this.setFor);
        },
        {
            /**
             * 鼠标单击控件事件的默认处理。
             * 将点击事件转发到 setFor 方法指定的控件。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
             * @protected
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);

                var target = this._cFor || core.query(function (item) {
                        return item instanceof ui.InputControl && this.contain(item);
                    }, this)[0];

                if (target && !target.isDisabled() && !target.contain(event.getControl())) {
                    core.triggerEvent(target, 'click', event);
                }
            },

            /**
             * 设置控件的事件转发接收控件。
             * setFor 方法设置事件转发的被动接收者，如果没有设置，则事件不会被转发。
             * @public
             *
             * @param {ecui.ui.Control} control 事件转发接收控件
             */
            setFor: function (control) {
                this._cFor = control;
            }
        }
    );

    // 初始化事件转发信息
    (function () {
        function build(name) {
            ui.Label.prototype['$' + name] = function (event) {
                ui.Control.prototype['$' + name].call(this, event);

                var target = this._cFor || core.query(function (item) {
                        return item instanceof ui.InputControl && this.contain(item);
                    }, this)[0];

                if (target && !target.isDisabled() && !target.contain(event.getControl())) {
                    if (name === 'click') {
                        core.setFocused(target);
                    }

                    core.triggerEvent(target, name, event);
                }
            };
        }

        for (var i = 0; i < 7; ) {
            build(eventNames[i++]);
        }
    }());
//{if 0}//
}());
//{/if}//