/*
@example
<div ui="type:label;for:checkbox"></div>
或
<div ui="type:label">
    <input ui="type:text" />
</div>

@fields
_cFor - 被转发的控件对象
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 标签控件。
     * 将事件转发到指定的控件上，通常与 Radio、Checkbox 等控件联合使用，扩大点击响应区域。
     * options 属性：
     * for     被转发的控件 id
     * @control
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
             * @event
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);

                var target = this._cFor ||
                        core.query(
                            function (item) {
                                return item instanceof ui.InputControl && this.contain(item);
                            },
                            this
                        )[0];

                if (target && !target.isDisabled() && !target.contain(event.getControl())) {
                    core.setFocused(target);
                    core.dispatchEvent(target, 'click', event);
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
//{if 0}//
}());
//{/if}//