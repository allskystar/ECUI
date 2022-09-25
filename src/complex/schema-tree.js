(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function refresh(control) {
        var upLeft = window.parseInt(dom.first(control._uUp._aFloors[0]).style.marginLeft),
            downLeft = window.parseInt(dom.first(control._uDown._aFloors[0]).style.marginLeft);
        if (upLeft < downLeft) {
            control._uUp.getMain().style.left = downLeft - upLeft + 'px';
            control._uDown.getMain().style.left = '';
        } else {
            control._uUp.getMain().style.left = '';
            control._uDown.getMain().style.left = upLeft - downLeft + 'px';
        }
    }

    ui.SchemaTree = core.inherits(
        ui.Control,
        'ui-schema-tree',
        function (el, options) {
            ui.Control.call(this, el, options);

            el = dom.first(el);
            dom.addClass(el, ui.PyramidTree.CLASS);
            this._uUp = core.$fastCreate(ui.PyramidTree, el, this, {reverse: true});

            el = dom.next(el);
            dom.addClass(el, ui.PyramidTree.CLASS);
            this._uDown = core.$fastCreate(ui.PyramidTree, el, this);
        },
        {
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                for (var control = event.getControl(); control; control = control.getParent()) {
                    if (control instanceof ui.TreeView) {
                        refresh(this);
                        break;
                    }
                }
            },
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                this._uUp._uTree.getRoot().expand();
                this._uUp._uTree.getRoot().setCapturableStatus(false);
                this._uUp.$ready(event);
                this._uDown._uTree.getRoot().expand();
                this._uDown._uTree.getRoot().setCapturableStatus(false);
                this._uDown.$ready(event);
                refresh(this);
            }
        }
    );
})();
