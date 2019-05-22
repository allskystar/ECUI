/*
@example
<ul ui="type:popup-menu">
    <li>选项一</li>
    <li>选项二</li>
    <ul>
        <li>子选项组名</li>
        <li>子选项一</li>
        <li>子选项二</li>
        <ul>
            <li>孙选项组名</li>
            <li>孙选项一</li>
            <li>孙选项二</li>
        </ul>
    </ul>
</ul>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 菜单控件。
     * @control
     */
    ui.PopupMenu = core.inherits(
        ui.Control,
        'ui-popup-menu',
        function (el, options) {
            ui.Control.call(this, el, options);
            this.left = true;
        },
        {
            /**
             * 菜单项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                'ui-popup-menu-item',
                function (el, options) {
                    if (el.tagName === 'UL') {
                        var popup = el;
                        el = dom.insertBefore(dom.first(el), popup);
                        document.body.appendChild(popup);
                        dom.addClass(popup, 'ui-popup-menu ui-hide');
                    }

                    ui.Item.call(this, el, options);

                    if (popup) {
                        this.setChildMenu(core.$fastCreate(ui.PopupMenu, popup, this));
                    }
                },
                {
                    /**
                     * @override
                     */
                    $mouseout: function (event) {
                        ui.Item.prototype.$mouseout.call(this, event);
                        if (this._cPopup) {
                            this._cPopup.hide();
                        }
                    },

                    /**
                     * @override
                     */
                    $mouseover: function (event) {
                        ui.Item.prototype.$mouseover.call(this, event);
                        if (this._cPopup) {
                            this._cPopup.show();
                            this._cPopup.assignTo(this);
                        }
                    },

                    /**
                     * 设置子菜单。
                     * @public
                     *
                     * @param {ecui.ui.PopupMenu} popup 弹出菜单控件
                     */
                    setChildMenu: function (popup) {
                        if (this._cPopup !== popup) {
                            if (this._cPopup) {
                                this._cPopup.hide();
                            }
                            if (!this._cPopup ^ !popup) {
                                if (this._cPopup) {
                                    this.alterStatus('-group');
                                } else {
                                    this.alterStatus('+group');
                                }
                            }
                            this._cPopup = popup || null;
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * 菜单自动对齐。
             * @public
             *
             * @param {ecui.ui.Control} control 需要对齐的控件
             */
            assignTo: function (control) {
                var pos = dom.getPosition(control.getMain()),
                    controlWidth = control.getWidth(),
                    width = this.getWidth(),
                    height  = this.getHeight(),
                    view = util.getView(),
                    x;

                if (this.left) {
                    x = pos.left + controlWidth - 4;
                    if (x > view.right - width) {
                        this.left = false;
                        x = pos.left - width + 4;
                    }
                } else {
                    x = pos.left - width + 4;
                    if (x < view.left) {
                        this.left = true;
                        x = pos.left + controlWidth - 4;
                    }
                }

                this.setPosition(Math.max(view.left, Math.min(x, view.right - width)), Math.max(view.top, Math.min(pos.top - Math.round((height - control.getHeight()) / 2), view.bottom - height)));
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//
