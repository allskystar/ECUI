/*
MConfirm - 确认按钮插件。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var SubmitButton = core.inherits(
            ui.Control,
            {
                onclick: function () {
                    var popup = this.getParent();
                    core.dispatchEvent(popup.getParent(), 'confirm');
                    popup.hide();
                }
            }
        );

    /**
     * 锚点插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    ui.MConfirm = _interface('$MConfirm', {
        constructor: function (el) {
            var title = dom.create({
                    className: 'ui-mobile-confirm-title',
                    innerHTML: '<div class="confirm-cancel">取消</div><div class="confirm-title">title</div><div class="confirm-sure">确定</div>'
                }),
                layout = dom.create({
                    className: 'ui-mobile-confirm-layout'
                });
            for (; el.firstChild; ) {
                layout.appendChild(el.firstChild);
            }
            el.appendChild(layout);
            el.appendChild(title);
            dom.addClass(el, 'ui-mobile-confirm');
            if (el === this.getBody()) {
                this.$setBody(layout);
            }
            this._eTitle = title;
            core.$fastCreate(SubmitButton, title.lastChild, this, {focusable: false});
        },
        setTitle: function (title) {
            dom.children(this._eTitle)[1].innerHTML = title;
        }
    });
}());
