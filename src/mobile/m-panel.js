/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
(function () {
//{if 0}//
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
        'ui-mobile-panel',
        ui.MScroll,
        {
            refresh: function () {
                var main = this.getMain(),
                    body = this.getBody();

                this.setPosition(Math.max(this.getX(), main.clientWidth - body.scrollWidth), Math.min(0, Math.max(this.getY(), main.clientHeight - body.scrollHeight)));
            }
        }
    );
}());
