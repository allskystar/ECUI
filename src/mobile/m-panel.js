/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 移动端容器控件。
     * 实现了对原生滚动操作的功能扩展。
     * @control
     */
    ui.MPanel = core.inherits(
        ui.Control,
        'ui-panel',
        ui.MScroll
    );
//{if 0}//
}());
//{/if}//
