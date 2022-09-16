/*
使用方法，可以参考checkbox，继承checkbox.   switch控件
<div ui="type:switch;name:city;value:beijing;"></div>

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;

    ui.Switch = ecui.inherits(
        ui.Checkbox,
        'ui-switch',
        function (el, options) {
            ui.Checkbox.call(this, el, options);
            this._sValue = options.value;
            this._sName = options.name;
        }
    );
}());