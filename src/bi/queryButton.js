/*
queryButton - 查询按钮控件。
定制查询按钮控件，继承自button控件

查询按钮控件HTML初始化的例子:
<div ui="type:QueryButton;></div>

*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    ui.BQueryButton = core.inherits(
        ui.Button,
        'ui-query-button',
        function (el, options) {
            ui.Button.call(this, el, options);
            this._sRoute = options.route;
        },
        {
            /**
             * 输入提交事件。
             * @event
             */
            $submit: function (event) {
                event.preventDefault();
            },
            $click: function (event) {
                ui.Button.prototype.$click.call(this, event);
                var route = ecui.esr.findRoute(this),
                routeName = this._sRoute || route.children || route.NAME,
                    children = ecui.esr.getRoute(routeName);
                children.searchParam = {};
                ecui.esr.parseObject(this.getForm(), children.searchParam);
                ecui.esr.callRoute(routeName + '~pageNo=1', true);
            }
        }
    );
})();
