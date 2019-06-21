/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 移动端容器控件。
     * 实现了对原生滚动操作的功能扩展。
     * @control
     */
    ui.MPanel = core.inherits(
        ui.Control,
        'ui-mobile-panel',
        [
            function (el) {
                dom.addClass(el, 'ui-mobile-panel-location');
            }
        ],
        {
            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Control.prototype.$initStructure.call(this, width, height);
                this.$setSize(width, height);
                dom.removeClass(this.getMain(), 'ui-mobile-panel-location');
            },

            /**
             * @override
             */
            $restoreStructure: function () {
                ui.Control.prototype.$restoreStructure.call(this);
                dom.addClass(this.getMain(), 'ui-mobile-panel-location');
            }
        },
        ui.MScroll
    );
}());
