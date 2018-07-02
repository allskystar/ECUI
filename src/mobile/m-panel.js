/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 移动端容器控件。
     * 实现了对原生滚动操作的功能扩展。
     * @control
     */
    ui.MPanel = core.inherits(
        ui.Control,
        'ui-panel',
        function (el, options) {
            util.setDefault(options, 'mode', 'native');
            ui.Control.call(this, el, options);
        },
        ui.MScroll
    );
//{if 0}//
}());
//{/if}//
