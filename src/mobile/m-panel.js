//{if $css}//
ecui.__ControlStyle__('\
.ui-mobile-panel {\
    overflow: hidden !important;\
}\
\
.ui-mobile-panel-location .ui-mobile-panel-body {\
    overflow: hidden !important;\
    height: 100%;\
}\
');
//{/if}//
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
        {
            /**
             * @override
             */
            $create: function (options) {
                _super.$create(options);
                dom.addClass(this.getMain(), 'ui-mobile-panel-location');
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                _super.$initStructure(width, height);
                this.$setSize(width, height);
                dom.removeClass(this.getMain(), 'ui-mobile-panel-location');
            },

            /**
             * @override
             */
            $restoreStructure: function () {
                _super.$restoreStructure();
                dom.addClass(this.getMain(), 'ui-mobile-panel-location');
            }
        },
        ui.iMScroll
    );
})();
