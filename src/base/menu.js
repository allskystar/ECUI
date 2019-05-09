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
    ui.Menu = core.inherits(
        ui.Control,
        'ui-menu',
        {
            Item: core.inherits(
                ui.Item,
                'ui-menu-item',
                function (el, options) {
                    if (el.tagName === 'UL') {
                        var popup = el;
                        el = dom.insertBefore(dom.first(el), popup);
                        document.body.appendChild(popup);
                        dom.addClass(popup, 'ui-menu ui-hide');
                    }

                    ui.Item.call(this, el, options);

                    if (popup) {
                        this.setPopup(core.$fastCreate(ui.Menu, popup, this));
                    }
                },
                {
                    $mouseover: function (event) {
                        ui.Item.prototype.$mouseover.call(this, event);
                        if (this._cPopup) {
                            this._cPopup.show();
                            var pos = dom.getPosition(this.getMain()),
                                height = this._cPopup.getHeight();
                            this._cPopup.setPosition(pos.left + this.getWidth() - 4, pos.top - Math.round((height - this.getHeight()) / 2));
                        }
                    },

                    $mouseout: function (event) {
                        ui.Item.prototype.$mouseout.call(this, event);
                        if (this._cPopup) {
                            this._cPopup.hide();
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

            $alterItems: util.blank
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//
