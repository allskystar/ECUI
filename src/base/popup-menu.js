/*
@example
<ul ui="type:menu">
    <li>选项一</li>
    <li>选项二</li>
    <ul>
        <li>子选项组名</li>
        <li>子选项一</li>
        <li>子选项二</li>
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
        {
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
                        this.setPopup(core.$fastCreate(ui.PopupMenu, popup, this));
                    }
                },
                {
                    $mouseout: function (event) {
                        ui.Item.prototype.$mouseout.call(this, event);
                        if (this._cPopup) {
                            this._cPopup.hide();
                        }
                    },

                    $mouseover: function (event) {
                        ui.Item.prototype.$mouseover.call(this, event);
                        if (this._cPopup) {
                            this._cPopup.show();
                            this._cPopup.assignTo(this);
                        }
                    },

                    setPopup: function (popup) {
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

            $alterItems: util.blank,

            assignTo: function (control) {
                var pos = dom.getPosition(control.getMain()),
                    height  = this.getHeight(),
                    view = util.getView();

                this.setPosition(Math.min(pos.left + control.getWidth() - 4, view.right - this.getWidth()), Math.max(0, Math.min(pos.top - Math.round((height - control.getHeight()) / 2), view.bottom - height)));
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//
