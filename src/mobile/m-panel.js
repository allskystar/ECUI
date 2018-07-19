/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
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
        ui.MScroll,
        {
            refresh: function () {
                var main = this.getMain(),
                    body = this.getBody();

                this.setPosition(Math.max(this.getX(), main.clientWidth - body.scrollWidth), Math.max(this.getY(), main.clientHeight - body.scrollHeight));
            }
        }
    );

    var oldRemove = dom.remove;
    dom.remove = function (el) {
        for (var parent = dom.parent(el); parent; parent = dom.parent(parent)) {
            if (parent.getControl) {
                var control = parent.getControl();
                if (control instanceof ui.MPanel) {
                    util.timer(control.refresh, 0, control);
                }
            }
        }
        return oldRemove(el);
    };
}());
