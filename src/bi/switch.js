/*
使用方法，可以参考checkbox，继承checkbox.   switch控件
<div ui="type:b-switch;name:city;value:beijing;"></div>

*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    ui.BSwitch = ecui.inherits(
        ui.Checkbox,
        'ui-switch',
        function (el, options) {
            _super(el, options);
            this._sValue = options.value;
            this._sName = options.name;
        }
    );
}());