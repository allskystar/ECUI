(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    function refresh(control) {
        var upLeft = window.parseInt(control._uUp._aFloors[0].firstElementChild.style.marginLeft),
            downLeft = window.parseInt(control._uDown._aFloors[0].firstElementChild.style.marginLeft);
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
            _super(el, options);

            el = el.firstElementChild;
            dom.addClass(el, ui.PyramidTree.CLASS);
            this._uUp = core.$fastCreate(ui.PyramidTree, el, this, {reverse: true});

            el = el.nextElementSibling;
            dom.addClass(el, ui.PyramidTree.CLASS);
            this._uDown = core.$fastCreate(ui.PyramidTree, el, this);
        },
        {
            $click: function (event) {
                _super.$click(event);
                for (var control = event.getControl(); control; control = control.getParent()) {
                    if (control instanceof ui.TreeView) {
                        refresh(this);
                        break;
                    }
                }
            },
            $ready: function (event) {
                _super.$ready(event);
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
