/*
clear - 输入框的清除插件，使用ext-clear使用。
@example:
<input ui="type:text;ext-clear">
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        ui = core.ui;
//{/if}//
    var Button = core.inherits(
        ui.Control,
        {
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                var parent = this.getParent();
                if (parent.getValue()) {
                    parent.setValue('');
                    core.dispatchEvent(parent, 'input', event);
                    core.dispatchEvent(parent, 'clear', event);
                }
                event.stopPropagation();
            }
        }
    );
    
    ext.clear = {
    
        /**
         * 清除按钮插件初始化。
         * @public
         */
        constructor: function () {
            var el = this.getMain();
            dom.addClass(el, this.getType() + '-clear ext-clear');
            el = el.appendChild(dom.create('DIV', {className: 'ext-clear-button'}));
            core.$fastCreate(Button, el, this);
        }
    };
}());
