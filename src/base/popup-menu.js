//{if $css}//
ecui.__ControlStyle__('\
.ui-popupmenu {\
    position: absolute;\
}\
');
//{/if}//
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

@field
Item._cChildMenu 子弹出菜单
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
        'ui-popupmenu',
        {
            /**
             * 菜单项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                'ui-popupmenu-item',
                function (el, options) {
                    if (el.tagName === 'UL') {
                        var popup = el;
                        el = dom.insertBefore(el.firstElementChild, popup);
                        document.body.appendChild(popup);
                        dom.addClass(popup, 'ui-popupmenu ui-hide');
                    }

                    _super(el, options);

                    if (popup) {
                        this.setChildMenu(core.$fastCreate(ui.PopupMenu, popup, this));
                    }
                },
                {
                    /**
                     * @override
                     */
                    $mouseout: function (event) {
                        _super.$mouseout(event);
                        if (this._cChildMenu) {
                            this._cChildMenu.hide();
                        }
                    },

                    /**
                     * @override
                     */
                    $mouseover: function (event) {
                        _super.$mouseover(event);
                        if (this._cChildMenu) {
                            this._cChildMenu.show();
                            this._cChildMenu.assignTo(this);
                        }
                    },

                    /**
                     * 设置子菜单。
                     * @public
                     *
                     * @param {ecui.ui.iPopupMenu} popupMenu 弹出菜单控件
                     */
                    setChildMenu: function (popupMenu) {
                        if (this._cChildMenu !== popupMenu) {
                            if (this._cChildMenu) {
                                this._cChildMenu.hide();
                            }
                            if (!this._cChildMenu ^ !popupMenu) {
                                if (this._cChildMenu) {
                                    this.alterStatus('-group');
                                } else {
                                    this.alterStatus('+group');
                                }
                            }
                            this._cChildMenu = popupMenu || null;
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * 节点移除时清理自身。
             * @override
             */
            $dispose: function () {
                dom.remove(this.getMain());
                _super.$dispose();
            },

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
                    height = this.getHeight(),
                    view = dom.getView(),
                    x;

                x = pos.left + controlWidth - 4;
                if (x > view.right - width) {
                    x = pos.left - width + 4;
                }

                this.setPosition(Math.max(view.left, Math.min(x, view.right - width)), Math.max(view.top, Math.min(pos.top - Math.round((height - control.getHeight()) / 2), view.bottom - height)));
            }
        },
        ui.iItems
    );
//{if 0}//
})();
//{/if}//
